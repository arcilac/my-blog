import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

async function testNotionConnection() {
  try {
    // Intenta con el formato con guiones
    const databaseId = ''
    console.log('Trying with format including hyphens:', databaseId)

    const response = await notion.databases.query({
      database_id: databaseId,
    })

    console.log('Connection successful!')
    console.log(`Found ${response.results.length} results`)
    return
  } catch (error) {
    console.log('Failed with hyphenated format:', error.message)
  }

  try {
    // Intenta con el formato sin guiones
    const databaseId = ''
    console.log('Trying with format without hyphens:', databaseId)

    const response = await notion.databases.query({
      database_id: databaseId,
    })

    console.log('Connection successful!')
    console.log(`Found ${response.results.length} results`)
  } catch (error) {
    console.log('Failed with non-hyphenated format:', error.message)
    console.error('Both formats failed. Check your API key and database sharing settings.')
  }
}

testNotionConnection()
