import { notionStyles } from './notion-styles'
import { groupBlocks } from './notion-utils'
import { BlockRenderer } from './notion-block-renderer'
import { ListRenderer } from './notion-text-blocks'
import type { NotionRendererProps } from '../lib/types'

export function NotionRenderer({ blocks }: NotionRendererProps) {
  if (!blocks || blocks.length === 0) {
    return <div style={notionStyles.emptyContent}>No content available</div>
  }

  const groupedBlocks = groupBlocks(blocks)

  return (
    <div className="notion-content" style={notionStyles.content}>
      {groupedBlocks.map((blockItem, index) => {
        if (Array.isArray(blockItem)) {
          const listType = blockItem[0].type
          return <ListRenderer key={`list-${index}`} blocks={blockItem} listType={listType} />
        }

        return <BlockRenderer key={blockItem.id} block={blockItem} />
      })}
    </div>
  )
}
