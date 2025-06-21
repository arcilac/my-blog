import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowRight } from 'lucide-react'
import { Post } from '@/lib/types'
import './components.css'

export default function BlogCard({ post }: { post: Post }) {
  const basePath = ''
  const blogLink = `${basePath}/blog/${post.slug}`

  const imageUrl = post.coverImage
    ? post.coverImage.startsWith('http')
      ? post.coverImage
      : `${basePath}${post.coverImage.startsWith('/') ? post.coverImage : `/${post.coverImage}`}`
    : `${basePath}/placeholder.svg`

  return (
    <Link href={blogLink} className="blog-card-wrapper">
      <div className="blog-card">
        {post.coverImage && (
          <div className="blog-card-image">
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              unoptimized={true}
            />
          </div>
        )}

        <div className="blog-card-content">
          <div className="blog-card-date">
            <Calendar className="h-4 w-4" />
            <span>{post.publishedDate}</span>
          </div>

          <h3 className="blog-card-title">{post.title}</h3>

          <p className="blog-card-excerpt">{post.excerpt}</p>

          <div className="blog-card-tags">
            {post.tags &&
              post.tags.map((tag: string) => (
                <span key={tag} className="blog-tag">
                  #{tag}
                </span>
              ))}
          </div>

          <div className="blog-card-link">
            Read More <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </Link>
  )
}
