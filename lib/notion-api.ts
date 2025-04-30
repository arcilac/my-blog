import { NotionToMarkdown } from 'notion-to-md'
import { cache } from 'react'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import type { MdBlock, NotionPost } from './types'
import { notion, databaseId } from './notion-client'
import { formatPostFromPage } from './notion-formatter'
import { processBlocks } from './notion-processor'

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
