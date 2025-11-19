import React, { useState } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'

dayjs.locale('pt-br')

type EventRow = {
  id: string
  date: string
  title?: string
  color?: string
  is_letivo?: boolean
}

export default function EventAccordion({ events, year }: { events: EventRow[], year: number }) {
  if (!events || events.length === 0) {
    return (
      <div className="mt-6 p-4 bg-white rounded shadow text-gray-500 text-sm">
        Nenhum evento cadastrado neste calendário.
      </div>
    )
  }

  // agrupamento por mês
  const byMonth: Record<number, EventRow[]> = {}

  events.forEach(ev => {
    const m = dayjs(ev.date).month() // 0–11
    if (!byMonth[m]) byMonth[m] = []
    byMonth[m].push(ev)
  })

  // meses ordenados
  const sortedMonths = Object.keys(byMonth)
    .map(m => Number(m))
    .sort((a, b) => a - b)

  const [open, setOpen] = useState<number | null>(null)

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-3" style={{ color: '#16662e' }}>
        Eventos do Calendário
      </h2>

      <div className="space-y-3">

        {sortedMonths.map(month => {

          const list = byMonth[month]
          const isOpen = open === month

          return (
            <div key={month} className="bg-white rounded border shadow-sm">

              {/* Cabeçalho do mês */}
              <button
                onClick={() => setOpen(isOpen ? null : month)}
                className="w-full p-3 flex justify-between items-center text-left"
              >
                <span className="font-semibold">
                  {monthNames[month]} {year}
                </span>
                <span className="text-sm text-gray-600">
                  {list.length} evento(s)
                </span>
              </button>

              {/* Conteúdo da lista */}
              {isOpen && (
                <div className="p-3 border-t space-y-2">

                  {list
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map(ev => (
                      <div
                        key={ev.id}
                        className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                      >
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: ev.color || '#16662e' }}
                        />

                        <div className="flex-1">
                          <div className="font-medium">
                            {dayjs(ev.date).format('DD/MM')}
                            {ev.title ? ` — ${ev.title}` : ''}
                          </div>

                          <div className="text-xs text-gray-600">
                            {ev.is_letivo ? 'Letivo' : 'Não letivo'}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

            </div>
          )
        })}

      </div>
    </div>
  )
}
