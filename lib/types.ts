import type { ReactNode } from 'react'

export type Theme = 'dark' | 'light'

export type NotionBlockProperties = {
  checked?: boolean
  title?: string
  language?: string
  source?: string
  caption?: string
  icon?: string
  url?: string
  description?: string
}

export type NotionBlock = {
  id: string
  type: string
  content: string
  properties?: NotionBlockProperties
}

export type NotionPost = {
  id: string
  title: string
  slug: string
  publishedDate: string | null
  excerpt: string
  tags: string[]
  coverImage: string | null
  content?: NotionBlock[]
}

export type MdBlock = {
  type?: string
  content?: string
  imageUrl?: string
  caption?: string
  language?: string
  parent?: string
  children?: MdBlock[]
  [key: string]: any
}

export type ThemeProviderProps = {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export type Post = {
  coverImage?: string
  title: string
  publishedDate: string
  excerpt: string
  tags?: string[]
  slug: string
}

export type NotionRendererProps = {
  blocks: NotionBlock[]
}

export type BlockRendererProps = {
  block: NotionBlock
}
