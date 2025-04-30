import BlogCard from '@/components/blog-card'
import { getAllPosts } from '@/lib/notion'
import Link from 'next/link'
import '../pages.css'

export default async function BlogPage() {
  let posts: { id: string; [key: string]: any }[] = []

  try {
    posts = await getAllPosts()
  } catch (error) {
    console.error('Error fetching posts from Notion:', error)
  }

  return (
    <main className="blog-page">
      <div className="container mx-auto px-4">
        <h1 className="blog-list-title">
          <span className="text-gradient">All Blog Posts</span>
        </h1>

        {posts.length > 0 ? (
          <div className="blog-grid">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="no-posts">
            <h2 className="no-posts-title">No posts available</h2>
            <p className="no-posts-message">
              No entries found in your Notion database. Make sure you have published posts in your
              Notion database.
            </p>
            <Link href="/" className="btn btn-primary">
              Return Home
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
