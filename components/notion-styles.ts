export const notionStyles = {
  content: {
    color: 'var(--foreground)',
  },
  emptyContent: {
    color: 'var(--muted-foreground)',
  },
  paragraph: {
    marginBottom: '1rem',
    lineHeight: 1.7,
  },
  emptyParagraph: {
    marginBottom: '1rem',
    lineHeight: 1.7,
    color: 'var(--muted-foreground)',
  },
  heading1: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginTop: '2.5rem',
    marginBottom: '1rem',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '0.5rem',
  },
  heading2: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginTop: '2rem',
    marginBottom: '0.75rem',
    paddingBottom: '0.25rem',
  },
  heading3: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginTop: '1.5rem',
    marginBottom: '0.75rem',
  },
  codeBlock: {
    marginBottom: '1.5rem',
    marginTop: '1.5rem',
  },
  codeHighlighter: {
    borderRadius: '0.5rem',
    padding: '1rem',
    fontSize: '0.9rem',
    backgroundColor: '#1E1E1E',
  },
  codeCaption: {
    textAlign: 'center',
    fontSize: '0.875rem',
    color: 'var(--muted-foreground)',
    marginTop: '0.5rem',
  },
  figure: {
    marginBottom: '1.5rem',
  },
  imageContainer: {
    borderRadius: '0.5rem',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 'auto',
  },
  figcaption: {
    textAlign: 'center',
    color: 'var(--muted-foreground)',
    marginTop: '0.5rem',
    fontSize: '0.875rem',
  },
  blockquote: {
    borderLeft: '4px solid #8b5cf6',
    paddingLeft: '1rem',
    color: 'var(--muted-foreground)',
    margin: '1.5rem 0',
    fontStyle: 'italic',
  },
  divider: {
    border: 'none',
    height: '1px',
    backgroundColor: 'var(--border)',
    margin: '2rem 0',
  },
  todoContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  todoCheckbox: {
    marginTop: '0.25rem',
  },
  toggleDetails: {
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: 'var(--muted)',
    borderRadius: '0.5rem',
  },
  toggleSummary: {
    cursor: 'pointer',
    fontWeight: '500',
  },
  toggleContent: {
    paddingLeft: '1rem',
    marginTop: '0.5rem',
  },
  tableContainer: {
    marginBottom: '1.5rem',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableCell: (isLastCell: boolean) => ({
    padding: '0.75rem',
    borderBottom: '1px solid var(--border)',
    borderRight: isLastCell ? 'none' : '1px solid var(--border)',
  }),
  defaultContent: {
    marginBottom: '1rem',
  },
  unavailableContent: {
    marginBottom: '1rem',
    color: 'var(--muted-foreground)',
  },
  bulletedList: {
    paddingLeft: '1.5rem',
    marginBottom: '1.5rem',
    listStyleType: 'disc',
  },
  numberedList: {
    paddingLeft: '1.5rem',
    marginBottom: '1.5rem',
    listStyleType: 'decimal',
  },
  listItem: {
    marginBottom: '0.5rem',
  },
}
