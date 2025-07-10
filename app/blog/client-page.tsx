'use client'

import { useState, useEffect, type ChangeEvent } from 'react'
import BlogCard from '@/components/blog-card'
import Link from 'next/link'
import '../pages.css'
import type { Post } from '@/lib/types'
import { Search } from 'lucide-react'

export default function BlogPageClient({ initialPosts }: { initialPosts: Post[] }) {
  const [posts] = useState<Post[]>(initialPosts || [])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(initialPosts || [])

  useEffect(() => {
    const handler = setTimeout(() => {
      const filtered = posts.filter((post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredPosts(filtered)
    }, 100)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm, posts])

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  return (
    <main className="blog-page">
      <div className="container mx-auto px-4">
        <h1 className="blog-list-title">
          <span className="text-gradient">All blog posts</span>
        </h1>

        <div className="search-section">
          <div className="search-icon">
            <Search className="h-6 w-6" />
          </div>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search posts by title..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        </div>

        {filteredPosts && filteredPosts.length > 0 ? (
          <div className="blog-grid">
            {filteredPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="no-posts">
            <h2 className="no-posts-title">No posts found</h2>
            <p className="no-posts-message">
              {searchTerm
                ? `No posts matching "${searchTerm}" were found. Try a different search term.`
                : 'No entries found in your Notion database. Make sure you have published posts in your Notion database.'}
            </p>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="btn btn-primary">
                Clear Search
              </button>
            )}
            {!searchTerm && (
              <Link href="/" className="btn btn-primary">
                Return Home
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
