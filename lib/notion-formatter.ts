import { NotionToMarkdown } from 'notion-to-md'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import type { MdBlock, NotionPost } from './types'
import { notion } from './notion-client'

export async function formatPostFromPage(page: PageObjectResponse): Promise<NotionPost> {
  if (!('properties' in page)) {
    throw new Error('Invalid page object: missing properties')
  }

  let coverImage = null
  if (page.cover) {
    if (page.cover.type === 'external') {
      coverImage = page.cover.external.url
    } else if (page.cover.type === 'file') {
      coverImage = page.cover.file.url
    }
  }

  const properties = page.properties

  let title = 'Untitled'
  let slug = ''
  let excerpt = ''
  let tags: string[] = []
  let publishedDate = null

  if ('Title' in properties && properties.Title.type === 'title') {
    title = properties.Title.title.map((t) => t.plain_text).join('') || 'Untitled'
  } else if ('Name' in properties && properties.Name.type === 'title') {
    title = properties.Name.title.map((t) => t.plain_text).join('') || 'Untitled'
  } else {
    for (const [key, value] of Object.entries(properties)) {
      if (value.type === 'title' && 'title' in value) {
        title = value.title.map((t) => t.plain_text).join('') || 'Untitled'
        break
      }
    }
  }

  if ('Slug' in properties && properties.Slug.type === 'rich_text') {
    slug = properties.Slug.rich_text.map((t) => t.plain_text).join('') || ''
  }

  if (!slug) {
    slug = title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-')
  }

  if ('Excerpt' in properties && properties.Excerpt.type === 'rich_text') {
    excerpt = properties.Excerpt.rich_text.map((t) => t.plain_text).join('') || ''
  }

  if (!excerpt) {
    try {
      const n2m = new NotionToMarkdown({ notionClient: notion! })
      const mdBlocks = await n2m.pageToMarkdown(page.id)

      const firstParagraph = mdBlocks.find(
        (block) =>
          block.type === 'paragraph' ||
          (block.type === 'text' && 'content' in block && block.content),
      )

      if (firstParagraph && 'content' in firstParagraph && firstParagraph.content) {
        if (typeof firstParagraph.content === 'string') {
          excerpt = firstParagraph.content.substring(0, 150) + '...'
        }
      }
    } catch (err) {
      console.error('Error generating excerpt:', err)
      excerpt = 'No excerpt available'
    }
  }

  if ('Tags' in properties && properties.Tags.type === 'multi_select') {
    tags = properties.Tags.multi_select.map((tag) => tag.name)
  }

  if ('PublishedDate' in properties && properties.PublishedDate.type === 'date') {
    if (properties.PublishedDate.date) {
      const dateStr = properties.PublishedDate.date.start
      publishedDate = new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }
  } else if ('Created time' in page) {
    publishedDate = new Date(page.created_time).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return {
    id: page.id,
    title,
    slug,
    publishedDate,
    excerpt,
    tags,
    coverImage,
  }
}
