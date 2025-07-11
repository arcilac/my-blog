import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'
import './components.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content md:flex-row">
          <div className="footer-brand md:text-left">
            <Link href="/" className="footer-logo">
              Cami's blog
            </Link>
            <p className="footer-tagline">Personal thoughts and explorations</p>
          </div>

          <div className="social-links">
            <a
              href="https://github.com/Arcilac"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/camila-arcila-b28347279/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </a>
            <a href="mailto:arcilacamila08@gmail.com" className="social-link">
              <Mail className="h-5 w-5" />
              <span className="sr-only">Email</span>
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            {' '}
            Made with <span className="text-red-500">❤</span> by Camila Arcila
          </p>
        </div>
      </div>
    </footer>
  )
}
