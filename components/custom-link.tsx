import Link, { LinkProps } from 'next/link'
import { ReactNode } from 'react'

interface CustomLinkProps extends LinkProps {
  children: ReactNode
  className?: string
}

export default function CustomLink({ href, children, className, ...props }: CustomLinkProps) {
  const basePath = process.env.NODE_ENV === 'production' ? '/my-blog' : ''

  const isInternalLink =
    typeof href === 'string' && !href.startsWith('http') && !href.startsWith('#')

  const finalHref = isInternalLink ? `${basePath}${href}` : href

  return (
    <Link href={finalHref} className={className} {...props}>
      {children}
    </Link>
  )
}
