'use client'
import type { NotionBlock } from '@/lib/types'
import { notionStyles } from './notion-styles'
import { formatText, formatTitleCase } from './notion-utils'

export function ParagraphBlock({ block }: { block: NotionBlock }) {
  const { id, content } = block

  return content ? (
    <p
      key={id}
      style={notionStyles.paragraph}
      dangerouslySetInnerHTML={{ __html: formatText(content) }}
    />
  ) : (
    <p key={id} style={notionStyles.emptyParagraph}>
      Párrafo
    </p>
  )
}

export function Heading1Block({ block }: { block: NotionBlock }) {
  const { id, content } = block
  const formattedContent = formatTitleCase(content || 'Encabezado 1')

  return (
    <h1
      key={id}
      style={notionStyles.heading1}
      dangerouslySetInnerHTML={{ __html: formatText(formattedContent) }}
    />
  )
}

export function Heading2Block({ block }: { block: NotionBlock }) {
  const { id, content } = block
  const formattedContent = formatTitleCase(content || 'Encabezado 2')

  return (
    <h2
      key={id}
      style={notionStyles.heading2}
      dangerouslySetInnerHTML={{ __html: formatText(formattedContent) }}
    />
  )
}

export function Heading3Block({ block }: { block: NotionBlock }) {
  const { id, content } = block
  const formattedContent = formatTitleCase(content || 'Encabezado 3')

  return (
    <h3
      key={id}
      style={notionStyles.heading3}
      dangerouslySetInnerHTML={{ __html: formatText(formattedContent) }}
    />
  )
}

export function QuoteBlock({ block }: { block: NotionBlock }) {
  const { id, content } = block

  return (
    <blockquote
      key={id}
      style={notionStyles.blockquote}
      dangerouslySetInnerHTML={{ __html: formatText(content || '') }}
    />
  )
}

export function DividerBlock({ block }: { block: NotionBlock }) {
  const { id } = block

  return <hr key={id} style={notionStyles.divider} />
}

export function DefaultBlock({ block }: { block: NotionBlock }) {
  const { id, content, type } = block

  if (content && content.trim()) {
    return (
      <div
        key={id}
        style={notionStyles.defaultContent}
        dangerouslySetInnerHTML={{ __html: formatText(content) }}
      />
    )
  }

  if (['paragraph', 'heading_1', 'heading_2', 'heading_3', 'quote'].includes(type)) {
    return (
      <div key={id} style={notionStyles.unavailableContent}>
        Contenido no disponible
      </div>
    )
  }

  return null
}

export function ListRenderer({ blocks, listType }: { blocks: NotionBlock[]; listType: string }) {
  if (listType === 'bulleted_list_item') {
    return (
      <ul style={notionStyles.bulletedList}>
        {blocks.map((item) => (
          <li
            key={item.id}
            style={notionStyles.listItem}
            dangerouslySetInnerHTML={{
              __html: formatText((item.content || '• Item').replace(/^[•\-*]\s*/, '')),
            }}
          />
        ))}
      </ul>
    )
  } else if (listType === 'numbered_list_item') {
    return (
      <ol style={notionStyles.numberedList}>
        {blocks.map((item, idx) => (
          <li
            key={item.id}
            style={notionStyles.listItem}
            dangerouslySetInnerHTML={{
              __html: formatText((item.content || `Item ${idx + 1}`).replace(/^\d+\.\s*/, '')),
            }}
          />
        ))}
      </ol>
    )
  }

  return null
}
