import { SOURCES } from '../data'

interface CiteProps {
  sourceKey: string
  note?: string
}

export default function Cite({ sourceKey, note }: CiteProps) {
  const source = SOURCES[sourceKey]
  if (!source) return null
  const tooltip = note ? `${source.fullCitation}\n* ${note}` : source.fullCitation
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[0.8em] opacity-70 hover:opacity-100 no-underline hover:underline ml-1 text-inherit"
      title={tooltip}
    >
      [{source.shortName}]{note && '*'}
    </a>
  )
}
