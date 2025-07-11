import type { NotionBlock } from '@/lib/types'

/**
 * Formats text to have proper sentence case capitalization:
 * - Only first letter of the sentence capitalized
 * - Preserves acronyms (sequences of 2+ uppercase letters)
 * - Preserves words in parentheses like (DDD), (E2E) in uppercase
 * - Capitalizes words that precede acronyms in parentheses
 */
export function formatTitleCase(text: string): string {
  if (!text) return text

  const acronymPattern = /\b([A-Za-z\s-]+)\s+\(([A-Z]{2,})\)/g
  const wordsBeforeAcronyms = new Set()

  let match
  while ((match = acronymPattern.exec(text)) !== null) {
    const wordsPhrase = match[1].trim()
    const words = wordsPhrase.split(/\s+/)
    words.forEach((word) => {
      const cleanWord = word.replace(/[^\w-]/g, '').toLowerCase()
      if (cleanWord) {
        wordsBeforeAcronyms.add(cleanWord)
      }
    })
  }

  const words = text.split(/(\s+)/)

  let lettersSeen = 0
  const formattedWords = words.map((word) => {
    if (/^\s+$/.test(word)) return word

    const hasAcronym = /[A-Z]{2,}/.test(word)

    const isInParens = /^\([^)]+\)$/.test(word)
    if (isInParens) {
      const contentInParens = word.slice(1, -1)
      const isAcronymInParens = /^[A-Z]{2,}$/i.test(contentInParens)

      if (isAcronymInParens) {
        return `(${contentInParens.toUpperCase()})`
      }
    }

    if (hasAcronym && !isInParens) {
      return word
    }

    const cleanWord = word.replace(/[^\w-]/g, '').toLowerCase()
    const shouldCapitalizeForAcronym = wordsBeforeAcronyms.has(cleanWord)

    const lettersInWord = (word.match(/[a-zA-Z]/g) || []).length
    const isFirstLetter = lettersSeen === 0 && lettersInWord > 0

    if (isFirstLetter || shouldCapitalizeForAcronym) {
      let result = ''
      let foundFirstLetter = false

      for (let i = 0; i < word.length; i++) {
        if (/[a-zA-Z]/.test(word[i]) && !foundFirstLetter) {
          result += word[i].toUpperCase()
          foundFirstLetter = true
        } else if (/[a-zA-Z]/.test(word[i])) {
          result += word[i].toLowerCase()
        } else {
          result += word[i]
        }
      }

      lettersSeen += lettersInWord
      return result
    } else {
      if (isInParens) {
        return word
      }

      lettersSeen += lettersInWord
      return word.toLowerCase()
    }
  })

  return formattedWords.join('')
}

export function formatText(text: string) {
  if (!text) return ''

  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  )

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
