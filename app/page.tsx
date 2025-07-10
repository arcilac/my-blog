import CustomLink from '@/components/custom-link'
import { ArrowRight } from 'lucide-react'
import './pages.css'

export default async function Home() {
  return (
    <main className="min-h-screen bg-black">
      <section className="home-hero">
        <div className="hero-bg"></div>
        <div className="container mx-auto px-4">
          <div className="hero-content animate-fade-in-down">
            <h1 className="hero-title">
              <span className="text-gradient">My personal blog</span>
            </h1>
            <p className="hero-subtitle">
              Thoughts, ideas, and explorations on technology and design
            </p>
            <CustomLink href="/blog" className="btn btn-primary">
              Read all posts <ArrowRight className="h-4 w-4 ml-2" />
            </CustomLink>
          </div>
        </div>
      </section>
    </main>
  )
}
