import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { cache } from 'react'

import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import type { MdBlock, NotionBlock, NotionBlockProperties, NotionPost } from './types'

let notion: Client | null = null
let databaseId: string | undefined = undefined

try {
  notion = new Client({
    auth: process.env.NOTION_API_KEY || '',
  })

  databaseId = process.env.NOTION_DATABASE_ID

  if (!databaseId) {
    console.warn('NOTION_DATABASE_ID is not defined in environment variables')
  }
} catch (error) {
  console.error('Failed to initialize Notion client:', error)
}

export const getAllPosts = cache(async (): Promise<NotionPost[]> => {
  if (!notion || !databaseId) {
    throw new Error('Notion client or database ID not properly initialized')
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Published',
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: 'PublishedDate',
          direction: 'descending',
        },
      ],
    })

    return Promise.all(
      response.results.map(async (page) => {
        return formatPostFromPage(page as PageObjectResponse)
      }),
    )
  } catch (error) {
    console.error('Error fetching posts from Notion:', error)
    throw error
  }
})

export const getPostBySlug = cache(async (slug: string): Promise<NotionPost | null> => {
  if (!notion || !databaseId) {
    throw new Error('Notion client or database ID not properly initialized')
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: 'Published',
            checkbox: {
              equals: true,
            },
          },
          {
            property: 'Slug',
            rich_text: {
              equals: slug,
            },
          },
        ],
      },
    })

    if (response.results.length === 0) {
      return null
    }

    const page = response.results[0] as PageObjectResponse
    const post = await formatPostFromPage(page)

    const n2m = new NotionToMarkdown({ notionClient: notion })
    const mdBlocks = await n2m.pageToMarkdown(post.id)

    const blocks = processBlocks(mdBlocks as MdBlock[])

    return {
      ...post,
      content: blocks,
    }
  } catch (error) {
    console.error(`Error fetching post with slug ${slug}:`, error)
    return null
  }
})

async function formatPostFromPage(page: PageObjectResponse): Promise<NotionPost> {
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

function processBlocks(mdBlocks: MdBlock[]): NotionBlock[] {
  const flattenBlocks: NotionBlock[] = []

  function processChildPage(childPage: MdBlock) {
    if (childPage.children && Array.isArray(childPage.children)) {
      childPage.children.forEach((child, index) => {
        const id = `block-${index}`

        let content = ''
        if (typeof child.content === 'string') {
          content = child.content
        } else if (child.parent && typeof child.parent === 'string') {
          content = child.parent.replace(/^#+\s/, '')
        }

        let type = child.type || 'paragraph'

        const properties: NotionBlockProperties = {}

        if (child.type === 'image' && child.imageUrl) {
          properties.source = child.imageUrl
          properties.caption = child.caption
        }

        if (child.type === 'code') {
          properties.language = child.language
        }

        flattenBlocks.push({
          id,
          type,
          content,
          properties,
        })

        if (child.children && Array.isArray(child.children)) {
          child.children.forEach((grandchild, idx) => {
            const grandchildId = `${id}-${idx}`
            let grandchildContent = ''

            if (typeof grandchild.content === 'string') {
              grandchildContent = grandchild.content
            } else if (grandchild.parent && typeof grandchild.parent === 'string') {
              grandchildContent = grandchild.parent.replace(/^#+\s/, '')
            }

            flattenBlocks.push({
              id: grandchildId,
              type: grandchild.type || 'paragraph',
              content: grandchildContent,
              properties: extractProperties(grandchild),
            })
          })
        }
      })
    }
  }

  mdBlocks.forEach((block) => {
    if (block.type === 'child_page') {
      processChildPage(block)
    } else {
      const id = `block-${flattenBlocks.length}`
      let content = ''

      if (typeof block.content === 'string') {
        content = block.content
      } else if (block.parent && typeof block.parent === 'string') {
        content = block.parent.replace(/^#+\s/, '')
      }

      flattenBlocks.push({
        id,
        type: block.type || 'paragraph',
        content,
        properties: extractProperties(block),
      })

      if (block.children && Array.isArray(block.children)) {
        block.children.forEach((child, idx) => {
          const childId = `${id}-${idx}`
          let childContent = ''

          if (typeof child.content === 'string') {
            childContent = child.content
          } else if (child.parent && typeof child.parent === 'string') {
            childContent = child.parent.replace(/^#+\s/, '')
          }

          flattenBlocks.push({
            id: childId,
            type: child.type || 'paragraph',
            content: childContent,
            properties: extractProperties(child),
          })
        })
      }
    }
  })

  return flattenBlocks
}

function extractProperties(block: MdBlock): NotionBlockProperties {
  const properties: NotionBlockProperties = {}

  if (block.type === 'image') {
    properties.source = block.imageUrl
    properties.caption = block.caption
  }

  if (block.type === 'code') {
    properties.language = block.language
  }

  if (block.type === 'toggle' && block.parent) {
    properties.title = block.parent
    properties.description = block.content
  }

  return properties
}
