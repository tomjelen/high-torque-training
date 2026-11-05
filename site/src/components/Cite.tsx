import { SOURCES } from '../data'

interface CiteProps {
  sourceKey: string
}

export default function Cite({ sourceKey }: CiteProps) {
  const source = SOURCES[sourceKey]
  if (!source) return null
  if (!source.url) {
    return (
      <span className="text-[length:max(0.85em,11px)] ml-1 text-inherit" title={source.fullCitation}>
        [{source.shortName}]
      </span>
    )
  }
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[length:max(0.85em,11px)] no-underline hover:underline ml-1 text-inherit"
      title={source.fullCitation}
    >
      [{source.shortName}]
    </a>
  )
}
