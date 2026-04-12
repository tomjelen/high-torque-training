import { SOURCES } from '../data'

export default function SourcesList() {
  return (
    <section className="sources-list">
      <h2>Sources</h2>
      <ol>
        {Object.values(SOURCES).map((s) => (
          <li key={s.key}>
            <strong>{s.shortName}</strong> — {s.fullCitation}{' '}
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.url}
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}
