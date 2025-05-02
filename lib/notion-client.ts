import { Client } from '@notionhq/client'

let notion: Client | null = null
let databaseId: string | undefined = undefined

if (typeof process !== 'undefined' && process.env.NOTION_API_KEY) {
  try {
    notion = new Client({
      auth: process.env.NOTION_API_KEY,
    })

    databaseId = process.env.NOTION_DATABASE_ID

    if (!databaseId) {
      console.warn('NOTION_DATABASE_ID no está definido en las variables de entorno')
    }
  } catch (error) {
    console.error('Error al inicializar el cliente de Notion:', error)
  }
}

export function isNotionReady() {
  return !!notion && !!databaseId
}

export { notion, databaseId }
