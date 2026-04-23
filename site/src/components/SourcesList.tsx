import { SOURCES } from '../data'

export default function SourcesList() {
  return (
    <section className="mt-10 pt-6 border-t border-slate-700">
      <h2 className="text-xl font-bold text-slate-100 mb-4">Sources</h2>
      <ol className="text-xs text-slate-400 space-y-3 pl-4 list-decimal">
        {Object.values(SOURCES).map((s) => (
          <li key={s.key} className="leading-relaxed">
            <strong className="text-slate-300">{s.shortName}</strong> — {s.fullCitation}{' '}
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="break-all text-slate-500 hover:text-slate-300">
              {s.url}
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}
