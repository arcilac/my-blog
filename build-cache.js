const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const CACHE_FILE = '.build-cache.json'

class BuildCache {
  constructor() {
    this.cachePath = path.join(process.cwd(), CACHE_FILE)
    this.cache = this.loadCache()
  }

  loadCache() {
    try {
      if (fs.existsSync(this.cachePath)) {
        const data = fs.readFileSync(this.cachePath, 'utf8')
        return JSON.parse(data)
      }
    } catch (error) {
      console.warn('Error loading build cache:', error.message)
    }

    return {
      lastBuild: null,
      posts: {},
      buildHash: null,
      version: '1.0.0',
    }
  }

  saveCache() {
    try {
      fs.writeFileSync(this.cachePath, JSON.stringify(this.cache, null, 2))
    } catch (error) {
      console.error('Error saving build cache:', error)
    }
  }

  // Obtener la fecha del último build exitoso
  getLastBuildDate() {
    return this.cache.lastBuild
  }

  // Actualizar la fecha del último build
  updateLastBuildDate() {
    this.cache.lastBuild = new Date().toISOString()
    this.saveCache()
  }

  // Obtener hash de un post para detectar cambios
  getPostHash(postId) {
    return this.cache.posts[postId]?.hash || null
  }

  // Actualizar hash de un post
  updatePostHash(postId, postData) {
    const hash = this.generateHash(postData)

    if (!this.cache.posts[postId]) {
      this.cache.posts[postId] = {}
    }

    this.cache.posts[postId] = {
      hash,
      lastEditedTime: postData.lastEditedTime,
      slug: postData.slug,
      title: postData.title,
      updatedAt: new Date().toISOString(),
    }

    return hash
  }

  // Verificar si un post ha cambiado
  hasPostChanged(postId, postData) {
    const cachedPost = this.cache.posts[postId]

    if (!cachedPost) {
      return true // Nuevo post
    }

    // Comparar por fecha de edición de Notion
    if (postData.lastEditedTime !== cachedPost.lastEditedTime) {
      return true
    }

    // Comparar por hash del contenido
    const currentHash = this.generateHash(postData)
    return currentHash !== cachedPost.hash
  }

  // Generar hash del contenido de un post
  generateHash(postData) {
    const contentToHash = {
      title: postData.title,
      slug: postData.slug,
      excerpt: postData.excerpt,
      tags: postData.tags,
      coverImage: postData.coverImage,
      lastEditedTime: postData.lastEditedTime,
    }

    return crypto.createHash('md5').update(JSON.stringify(contentToHash)).digest('hex')
  }

  // Obtener posts que han cambiado
  getChangedPosts(allPosts) {
    const changedPosts = []
    const newPosts = []
    const unchangedPosts = []

    allPosts.forEach((post) => {
      if (this.hasPostChanged(post.id, post)) {
        if (!this.cache.posts[post.id]) {
          newPosts.push(post)
        } else {
          changedPosts.push(post)
        }
      } else {
        unchangedPosts.push(post)
      }
    })

    return {
      changed: changedPosts,
      new: newPosts,
      unchanged: unchangedPosts,
      totalChanged: changedPosts.length + newPosts.length,
    }
  }

  // Actualizar cache con posts procesados
  updatePostsCache(posts) {
    posts.forEach((post) => {
      this.updatePostHash(post.id, post)
    })
    this.saveCache()
  }

  // Limpiar posts eliminados del cache
  cleanupDeletedPosts(currentPostIds) {
    const cachedPostIds = Object.keys(this.cache.posts)
    const deletedPosts = cachedPostIds.filter((id) => !currentPostIds.includes(id))

    deletedPosts.forEach((postId) => {
      delete this.cache.posts[postId]
    })

    if (deletedPosts.length > 0) {
      console.log(`🗑️ Removed ${deletedPosts.length} deleted posts from cache`)
      this.saveCache()
    }

    return deletedPosts
  }

  // Obtener estadísticas del cache
  getStats() {
    return {
      lastBuild: this.cache.lastBuild,
      totalPosts: Object.keys(this.cache.posts).length,
      version: this.cache.version,
    }
  }

  // Resetear cache completamente
  reset() {
    this.cache = {
      lastBuild: null,
      posts: {},
      buildHash: null,
      version: '1.0.0',
    }
    this.saveCache()
    console.log('🔄 Build cache reset')
  }
}

module.exports = BuildCache
