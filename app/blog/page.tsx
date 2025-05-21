import { getAllPosts } from '@/lib/notion-api'
import { Post } from '@/lib/types'
import BlogPageClient from './client-page'

export default async function Page() {
  let posts: Post[] = []

  try {
    const fetchedPosts = await getAllPosts()

    posts = fetchedPosts.map(
      (post) =>
        ({
          title: post.title || '',
          publishedDate: post.publishedDate || '',
          excerpt: post.excerpt || '',
          slug: post.slug || '',
          coverImage: post.coverImage || undefined,
          tags: post.tags || [],
        } as Post),
    )
  } catch (error) {
    console.error('Error fetching posts from Notion:', error)
    posts = []
  }

  return <BlogPageClient initialPosts={posts} />
}
