import { Client } from '@notionhq/client'

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

export { notion, databaseId }
