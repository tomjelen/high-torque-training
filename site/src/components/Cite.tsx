import { SOURCES } from '../data'

interface CiteProps {
  sourceKey: string
}

export default function Cite({ sourceKey }: CiteProps) {
  const source = SOURCES[sourceKey]
  if (!source) return null
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="cite"
      title={source.fullCitation}
    >
      [{source.shortName}]
    </a>
  )
}
