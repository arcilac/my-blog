import { getAllPosts, getPostBySlug } from '@/lib/notion-api'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Calendar, Tag } from 'lucide-react'
import { NotionRenderer } from '@/components/notion-renderer'
import '../../pages.css'

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  let post
  try {
    post = await getPostBySlug(params.slug)
  } catch (error) {
    console.error('Error fetching post:', error)
  }

  if (!post) {
    notFound()
  }

  return (
    <main className="post-container">
      <article className="post-article">
        {post.coverImage && (
          <div className="post-cover">
            <Image
              src={post.coverImage || '/placeholder.svg'}
              alt={post.title}
              width={1200}
              height={630}
              className="w-full h-auto"
            />
          </div>
        )}

        <h1 className="post-title">{post.title}</h1>

        <div className="post-content">
          <NotionRenderer blocks={post.content || []} />
        </div>
        <div className="post-meta">
          {post.publishedDate && (
            <div className="post-date">
              <Calendar className="h-4 w-4" />
              <span>{post.publishedDate}</span>
            </div>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              <Tag className="h-4 w-4" />
              <div className="flex gap-2">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="post-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </main>
  )
}
