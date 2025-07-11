import type { NotionBlock } from '@/lib/types'
import { notionStyles } from './notion-styles'
import { formatText } from './notion-utils'

export function TableBlock({ block }: { block: NotionBlock }) {
  const { id, content } = block

  if (!content) return null

  return (
    <div key={id} style={notionStyles.tableContainer as React.CSSProperties}>
      <table style={notionStyles.table as React.CSSProperties}>
        <tbody>
          {content
            .split('\n')
            .filter((row) => !row.match(/^[\s|]*[-]+[\s|]*$/))
            .map((row, rowIdx) => (
              <tr key={`row-${rowIdx}`}>
                {row
                  .split('|')
                  .filter(Boolean)
                  .map((cell, cellIdx) => {
                    if (cell.trim().match(/^[-]+$/)) return null

                    const isLastCell = cellIdx === row.split('|').filter(Boolean).length - 1

                    return (
                      <td
                        key={`cell-${rowIdx}-${cellIdx}`}
                        style={notionStyles.tableCell(isLastCell)}
                        dangerouslySetInnerHTML={{ __html: formatText(cell.trim()) }}
                      />
                    )
                  })}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
