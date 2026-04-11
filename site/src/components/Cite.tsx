import { SOURCES } from '../data'

interface CiteProps {
  sourceKey: string
  note?: string
}

export default function Cite({ sourceKey, note }: CiteProps) {
  const source = SOURCES[sourceKey]
  if (!source) return null
  const tooltip = note
    ? `${source.fullCitation}\n* ${note}`
    : source.fullCitation
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="cite"
      title={tooltip}
    >
      [{source.shortName}]{note && '*'}
    </a>
  )
}
