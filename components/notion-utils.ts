import type { NotionBlock } from '@/lib/types'

export function formatText(text: string) {
  if (!text) return ''

  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')

  return text
}

export function cleanCodeContent(content: string): string {
  return content
    .replace(/^```[\w-]*\s*`?\s*/g, '')
    .replace(/`?\s*```\s*$/g, '')
    .replace(/^`|`$/g, '')
}

export function groupBlocks(blocks: NotionBlock[]) {
  const validBlocks = blocks.filter((block) => {
    return (
      block.content ||
      block.type === 'divider' ||
      (block.type === 'image' && block.properties?.source) ||
      block.type === 'to_do'
    )
  })

  const groupedBlocks: (NotionBlock | NotionBlock[])[] = []
  let currentList: NotionBlock[] = []
  let currentListType: string | null = null

  validBlocks.forEach((block) => {
    if (block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
      if (!currentListType || currentListType === block.type) {
        currentListType = block.type
        currentList.push(block)
      } else {
        if (currentList.length > 0) {
          groupedBlocks.push([...currentList])
          currentList = [block]
          currentListType = block.type
        }
      }
    } else {
      if (currentList.length > 0) {
        groupedBlocks.push([...currentList])
        currentList = []
        currentListType = null
      }
      groupedBlocks.push(block)
    }
  })

  if (currentList.length > 0) {
    groupedBlocks.push([...currentList])
  }

  return groupedBlocks
}
