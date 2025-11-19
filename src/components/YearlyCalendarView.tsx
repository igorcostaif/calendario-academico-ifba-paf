import React from 'react'
import dayjs from 'dayjs'

type Any = any

export default function YearlyCalendarView({
  year,
  cal,
  daysMap,
  onToggleLetivo
}: {
  year: number
  cal: Any
  daysMap: Record<string, Any>
  onToggleLetivo: (dateStr: string) => void
}) {

  const months = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
  ]

  function renderMonth(monthIndex: number) {
    const start = dayjs(`${year}-${monthIndex+1}-01`)
    const firstDay = start.day()
    const daysInMonth = start.daysInMonth()

    const blanks = Array(firstDay).fill(null)
    const days = Array.from({length: daysInMonth}, (_, i) => i + 1)

    return (
      <div key={monthIndex} className="p-3 bg-white rounded shadow-sm border">
        <h3 className="font-semibold mb-2 text-center">
          {months[monthIndex]}
        </h3>

        <div className="grid grid-cols-7 text-center text-xs font-semibold mb-1 text-gray-600">
          <div>D</div><div>S</div><div>T</div><div>Q</div><div>Q</div><div>S</div><div>S</div>
        </div>

        <div className="grid grid-cols-7 text-center gap-1">
          {blanks.map((_, i) => <div key={'b'+i}></div>)}

          {days.map(day => {
            const iso = dayjs(`${year}-${monthIndex+1}-${day}`).format('YYYY-MM-DD')
            const info = daysMap[iso]

            const isLetivo = info?.is_letivo
            const isEvent = info?.title
            const color = info?.color || (isLetivo ? '#16662e' : undefined)

            return (
              <button
                key={day}
                onClick={() => onToggleLetivo(iso)}
                className={`
                  w-7 h-7 flex items-center justify-center rounded-full text-sm transition-all
                  ${isEvent ? 'text-white font-bold' : ''}
                  ${color ? '' : 'hover:bg-gray-200'}
                `}
                style={{
                  backgroundColor: color || (isLetivo ? '#16662e' : undefined),
                  border: isEvent ? '2px solid ' + color : undefined,
                  color: isLetivo ? 'white' : undefined
                }}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 12 }).map((_, idx) => renderMonth(idx))}
    </div>
  )
}
