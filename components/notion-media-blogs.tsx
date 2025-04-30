'use client'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { NotionBlock } from '@/lib/types'
import { notionStyles } from './notion-styles'
import { formatText, cleanCodeContent } from './notion-utils'

export function CodeBlock({ block }: { block: NotionBlock }) {
  const { id, content, properties } = block
  const cleanedCode = content ? cleanCodeContent(content) : ''

  return (
    <div key={id} style={notionStyles.codeBlock}>
      <SyntaxHighlighter
        language={properties?.language || 'typescript'}
        style={vscDarkPlus}
        customStyle={notionStyles.codeHighlighter}
      >
        {cleanedCode}
      </SyntaxHighlighter>
      {properties?.caption && (
        <div style={notionStyles.codeCaption as React.CSSProperties}>{properties.caption}</div>
      )}
    </div>
  )
}

export function ImageBlock({ block }: { block: NotionBlock }) {
  const { id, properties } = block

  if (!properties?.source) return null

  return (
    <figure key={id} style={notionStyles.figure}>
      <div style={notionStyles.imageContainer}>
        <img
          src={properties.source}
          alt={properties?.caption || 'Image'}
          style={notionStyles.image}
        />
      </div>
      {properties?.caption && (
        <figcaption style={notionStyles.figcaption as React.CSSProperties}>
          {properties.caption}
        </figcaption>
      )}
    </figure>
  )
}

export function ToDoBlock({ block }: { block: NotionBlock }) {
  const { id, content, properties } = block

  return (
    <div key={id} style={notionStyles.todoContainer}>
      <input
        type="checkbox"
        checked={properties?.checked}
        readOnly
        style={notionStyles.todoCheckbox}
      />
      <span dangerouslySetInnerHTML={{ __html: formatText(content || 'Tarea pendiente') }} />
    </div>
  )
}

export function ToggleBlock({ block }: { block: NotionBlock }) {
  const { id, content, properties } = block

  return (
    <details key={id} style={notionStyles.toggleDetails}>
      <summary style={notionStyles.toggleSummary}>
        {properties?.title || content || 'Detalles'}
      </summary>
      <div
        style={notionStyles.toggleContent}
        dangerouslySetInnerHTML={{ __html: formatText(properties?.description || '') }}
      />
    </details>
  )
}
