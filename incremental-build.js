const { Client } = require('@notionhq/client')
const BuildCache = require('./build-cache')
const fs = require('fs')
const path = require('path')

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const databaseId = process.env.NOTION_DATABASE_ID

class IncrementalBuilder {
  constructor() {
    this.cache = new BuildCache()
    this.buildStats = {
      totalPosts: 0,
      newPosts: 0,
      changedPosts: 0,
      unchangedPosts: 0,
      startTime: Date.now(),
    }
  }

  async fetchAllPosts() {
    try {
      const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
          property: 'Published',
          checkbox: {
            equals: true,
          },
        },
        sorts: [
          {
            property: 'PublishedDate',
            direction: 'descending',
          },
        ],
      })

      return response.results.map((page) => ({
        id: page.id,
        title: this.extractTitle(page.properties),
        slug: this.extractSlug(page.properties),
        excerpt: this.extractExcerpt(page.properties),
        tags: this.extractTags(page.properties),
        coverImage: this.extractCoverImage(page),
        publishedDate: this.extractPublishedDate(page),
        lastEditedTime: page.last_edited_time,
        createdTime: page.created_time,
      }))
    } catch (error) {
      console.error('Error fetching posts from Notion:', error)
      throw error
    }
  }

  extractTitle(properties) {
    if ('Title' in properties && properties.Title.type === 'title') {
      return properties.Title.title.map((t) => t.plain_text).join('') || 'Untitled'
    }
    if ('Name' in properties && properties.Name.type === 'title') {
      return properties.Name.title.map((t) => t.plain_text).join('') || 'Untitled'
    }
    for (const [key, value] of Object.entries(properties)) {
      if (value.type === 'title' && 'title' in value) {
        return value.title.map((t) => t.plain_text).join('') || 'Untitled'
      }
    }
    return 'Untitled'
  }

  extractSlug(properties) {
    if ('Slug' in properties && properties.Slug.type === 'rich_text') {
      const slug = properties.Slug.rich_text.map((t) => t.plain_text).join('') || ''
      return slug || this.generateSlugFromTitle(this.extractTitle(properties))
    }
    return this.generateSlugFromTitle(this.extractTitle(properties))
  }

  generateSlugFromTitle(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-')
  }

  extractExcerpt(properties) {
    if ('Excerpt' in properties && properties.Excerpt.type === 'rich_text') {
      return properties.Excerpt.rich_text.map((t) => t.plain_text).join('') || ''
    }
    return ''
  }

  extractTags(properties) {
    if ('Tags' in properties && properties.Tags.type === 'multi_select') {
      return properties.Tags.multi_select.map((tag) => tag.name)
    }
    return []
  }

  extractCoverImage(page) {
    if (page.cover) {
      if (page.cover.type === 'external') {
        return page.cover.external.url
      } else if (page.cover.type === 'file') {
        return page.cover.file.url
      }
    }
    return null
  }

  extractPublishedDate(page) {
    const properties = page.properties
    if ('PublishedDate' in properties && properties.PublishedDate.type === 'date') {
      if (properties.PublishedDate.date) {
        const dateStr = properties.PublishedDate.date.start
        return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      }
    }
    return new Date(page.created_time).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  async analyzeChanges() {
    console.log('🔍 Analyzing changes...')

    const allPosts = await this.fetchAllPosts()
    const changes = this.cache.getChangedPosts(allPosts)

    // Limpiar posts eliminados
    const currentPostIds = allPosts.map((p) => p.id)
    const deletedPosts = this.cache.cleanupDeletedPosts(currentPostIds)

    this.buildStats = {
      ...this.buildStats,
      totalPosts: allPosts.length,
      newPosts: changes.new.length,
      changedPosts: changes.changed.length,
      unchangedPosts: changes.unchanged.length,
      deletedPosts: deletedPosts.length,
    }

    return {
      allPosts,
      changes,
      deletedPosts,
      shouldBuild: changes.totalChanged > 0 || deletedPosts.length > 0,
    }
  }

  generateBuildManifest(postsToRebuild) {
    const manifest = {
      timestamp: new Date().toISOString(),
      rebuildPosts: postsToRebuild.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        lastEditedTime: post.lastEditedTime,
      })),
      buildStats: this.buildStats,
    }

    const manifestPath = path.join(process.cwd(), '.next', 'build-manifest.json')
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true })
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

    return manifest
  }

  printBuildSummary(analysis) {
    const { changes, deletedPosts } = analysis
    const duration = ((Date.now() - this.buildStats.startTime) / 1000).toFixed(2)

    console.log('\n' + '='.repeat(50))
    console.log('📊 INCREMENTAL BUILD SUMMARY')
    console.log('='.repeat(50))
    console.log(`⏱️  Duration: ${duration}s`)
    console.log(`📝 Total posts: ${this.buildStats.totalPosts}`)
    console.log(`🆕 New posts: ${this.buildStats.newPosts}`)
    console.log(`📝 Changed posts: ${this.buildStats.changedPosts}`)
    console.log(`✅ Unchanged posts: ${this.buildStats.unchangedPosts}`)
    console.log(`🗑️  Deleted posts: ${this.buildStats.deletedPosts}`)
    console.log(`🔄 Posts to rebuild: ${changes.totalChanged}`)

    if (changes.new.length > 0) {
      console.log('\n🆕 NEW POSTS:')
      changes.new.forEach((post) => {
        console.log(`   • ${post.title} (${post.slug})`)
      })
    }

    if (changes.changed.length > 0) {
      console.log('\n📝 CHANGED POSTS:')
      changes.changed.forEach((post) => {
        console.log(`   • ${post.title} (${post.slug})`)
      })
    }

    if (deletedPosts.length > 0) {
      console.log('\n🗑️  DELETED POSTS:')
      deletedPosts.forEach((postId) => {
        console.log(`   • ${postId}`)
      })
    }

    if (changes.totalChanged === 0 && deletedPosts.length === 0) {
      console.log('\n✨ No changes detected - skipping build!')
    }

    console.log('='.repeat(50) + '\n')
  }

  async run(forceRebuild = false) {
    try {
      if (forceRebuild) {
        console.log('🔄 Force rebuild mode - resetting cache')
        this.cache.reset()
      }

      const analysis = await this.analyzeChanges()

      this.printBuildSummary(analysis)

      if (!analysis.shouldBuild && !forceRebuild) {
        console.log('✅ No changes detected, skipping build')
        return { shouldBuild: false, changes: analysis.changes }
      }

      // Generar manifiesto de build
      const postsToRebuild = [...analysis.changes.new, ...analysis.changes.changed]
      const manifest = this.generateBuildManifest(postsToRebuild)

      // Actualizar cache con todos los posts (incluso los que no cambiaron)
      this.cache.updatePostsCache(analysis.allPosts)
      this.cache.updateLastBuildDate()

      return {
        shouldBuild: true,
        changes: analysis.changes,
        manifest,
        postsToRebuild,
      }
    } catch (error) {
      console.error('Error in incremental build analysis:', error)
      throw error
    }
  }
}

// Función para uso externo
async function analyzeIncrementalBuild(options = {}) {
  const builder = new IncrementalBuilder()
  return await builder.run(options.force)
}

module.exports = { IncrementalBuilder, analyzeIncrementalBuild }
