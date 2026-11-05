import { SPORTS } from '../lib/markets'

const SPORT_FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: SPORTS.FOOTBALL, label: 'Fútbol' },
  { key: SPORTS.BASKETBALL, label: 'Basketball' },
]

export function SportFilter({ value, onChange, counts }) {
  return (
    <div
      className="flex flex-wrap gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1"
      role="group"
      aria-label="Filtrar por deporte"
    >
      {SPORT_FILTERS.map((item) => {
        const isActive = value === item.key

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            aria-pressed={isActive}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              isActive
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {item.label}
            {counts && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {counts[item.key] ?? 0}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
