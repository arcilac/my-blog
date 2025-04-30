'use client'
import {
  ParagraphBlock,
  Heading1Block,
  Heading2Block,
  Heading3Block,
  QuoteBlock,
  DividerBlock,
  DefaultBlock,
  ListRenderer,
} from './notion-text-blocks'
import { CodeBlock, ImageBlock, ToDoBlock, ToggleBlock } from './notion-media-blogs'
import { TableBlock } from './notion-table-blocks'
import type { BlockRendererProps } from '../lib/types'

export function BlockRenderer({ block }: BlockRendererProps) {
  const { type } = block

  switch (type) {
    case 'paragraph':
      return <ParagraphBlock block={block} />
    case 'heading_1':
      return <Heading1Block block={block} />
    case 'heading_2':
      return <Heading2Block block={block} />
    case 'heading_3':
      return <Heading3Block block={block} />
    case 'code':
      return <CodeBlock block={block} />
    case 'image':
      return <ImageBlock block={block} />
    case 'quote':
      return <QuoteBlock block={block} />
    case 'divider':
      return <DividerBlock block={block} />
    case 'to_do':
      return <ToDoBlock block={block} />
    case 'toggle':
      return <ToggleBlock block={block} />
    case 'table':
      return <TableBlock block={block} />
    default:
      return <DefaultBlock block={block} />
  }
}
