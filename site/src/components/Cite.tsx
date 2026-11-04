import { SOURCES } from '../data'

interface CiteProps {
  sourceKey: string
  note?: string
}

export default function Cite({ sourceKey, note }: CiteProps) {
  const source = SOURCES[sourceKey]
  if (!source) return null
  const tooltip = note ? `${source.fullCitation}\n* ${note}` : source.fullCitation
  if (!source.url) {
    return (
      <span className="text-[length:max(0.85em,11px)] ml-1 text-inherit" title={tooltip}>
        [{source.shortName}]{note && '*'}
      </span>
    )
  }
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[length:max(0.85em,11px)] no-underline hover:underline ml-1 text-inherit"
      title={tooltip}
    >
      [{source.shortName}]{note && '*'}
    </a>
  )
}
