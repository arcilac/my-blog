import type { MdBlock, NotionBlock, NotionBlockProperties } from './types'

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

export function processBlocks(mdBlocks: MdBlock[]): NotionBlock[] {
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
