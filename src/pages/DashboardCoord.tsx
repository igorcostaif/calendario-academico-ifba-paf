import React, { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import CalendarView from '../components/CalendarView'
import EventAccordion from '../components/EventAccordion'
import { getBrazilNationalHolidays, parseMunicipalCSV } from '../services/holidays'
import dayjs from 'dayjs'
import WeekdayCountsChart from '../components/WeekdayCountsChart'
import { exportWeekdayCountsCSV } from '../utils/csvExport'
import CreateCalendarModal from '../components/CreateCalendarModal'

type Any = any

// Nome amigável para cada cor
const COLOR_LABELS: Record<string, string> = {
  '#16662e': 'Padrão IFBA / Letivo',
  '#1d4ed8': 'Azul',
  '#b91c1c': 'Vermelho / Feriado',
  '#b45309': 'Laranja',
  '#9333ea': 'Roxo',
  '#047857': 'Verde escuro',
  '#0891b2': 'Ciano'
}

export default function DashboardCoord({ user, goto }: Any) {

  const [cals, setCals] = useState<Any[]>([])
  const [selected, setSelected] = useState<Any | null>(null)
  const [daysMap, setDaysMap] = useState<Record<string, Any>>({})
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    load()
  }, [user])

  async function load() {
    const { data } = await supabase
      .from('calendars')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setCals(data || [])
    if (data?.length) selectCal(data[0])
  }

  async function selectCal(cal: any) {
    setSelected(cal)
    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('calendar_id', cal.id)
      .order('date')

    const map: Record<string, any> = {}
    ;(data || []).forEach((r: any) => (map[r.date] = r))
    setDaysMap(map)
  }

  async function importNational() {
    if (!selected) return alert('Selecione um calendário')

    try {
      const hs = await getBrazilNationalHolidays(selected.year)
      const rows = hs.map(h => ({
        calendar_id: selected.id,
        date: h.date,
        title: h.name,
        color: '#b91c1c',
        is_letivo: false
      }))
      await supabase.from('calendar_events').upsert(rows, { onConflict: 'calendar_id,date' })
      await selectCal(selected)
      alert('Feriados nacionais importados!')
    } catch (e: any) {
      alert(e.message || 'Erro ao importar feriados')
    }
  }

  function importMunicipalCSV(file: File) {
    const reader = new FileReader()
    reader.onload = async e => {
      try {
        const parsed = parseMunicipalCSV(e.target?.result as string)
        const rows = parsed.map((r: any) => ({
          calendar_id: selected!.id,
          date: r.date,
          title: r.name,
          color: '#b91c1c',
          is_letivo: false
        }))
        await supabase.from('calendar_events').upsert(rows, { onConflict: 'calendar_id,date' })
        await selectCal(selected)
        alert('Feriados municipais importados')
      } catch {
        alert('Erro no CSV')
      }
    }
    reader.readAsText(file)
  }

  // ----------------------------------------
  // Cores presentes no calendário
  // ----------------------------------------
  function getColorLegend() {
    const usedColors = new Set<string>()
    Object.values(daysMap).forEach((e: any) => {
      if (e.color) usedColors.add(e.color)
    })
    return [...usedColors]
  }

  const legendColors = getColorLegend()

  // ----------------------------------------
  // Cálculo de letivos por dia da semana
  // ----------------------------------------
  function countLetivosByWeekday(
    cal: any,
    map: Record<string, Any>
  ): {
    domingo: number
    segunda: number
    terca: number
    quarta: number
    quinta: number
    sexta: number
    sabado: number
  } {
    const result = {
      domingo: 0,
      segunda: 0,
      terca: 0,
      quarta: 0,
      quinta: 0,
      sexta: 0,
      sabado: 0
    }

    const start = dayjs(cal.start_date)
    const end = dayjs(cal.end_date)

    const names = ['domingo','segunda','terca','quarta','quinta','sexta','sabado'] as const

    for (let d = start; d.isBefore(end) || d.isSame(end); d = d.add(1, 'day')) {
  const iso = d.format('YYYY-MM-DD')
  const info = map[iso]
  const dow = d.day()

  const isLetivo = info ? info.is_letivo : dow !== 0

  if (isLetivo) {
    const key = names[dow] // "domingo" | "segunda" | ...
    result[key] += 1
  }
}

    return result
  }

  const counts = selected ? countLetivosByWeekday(selected, daysMap) : null

  const total = counts
    ? (Object.values(counts) as number[]).reduce((a, b) => a + b, 0)
    : 0

  const weeks = counts ? Math.ceil(total / 5) : 0

  // ----------------------------------------
  // Layout principal
  // ----------------------------------------
  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{ color: '#16662e' }}>
            Meus Calendários
          </h1>

          <div className="flex gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="px-3 py-2 rounded"
              style={{ background: '#1f8a3a', color: '#fff' }}
            >
              Novo
            </button>

            <button
              onClick={importNational}
              className="px-3 py-2 rounded"
              style={{ background: '#111827', color: '#fff' }}
            >
              Importar feriados nacionais
            </button>

            <label className="px-3 py-2 rounded bg-blue-600 text-white cursor-pointer">
              Importar Municipais CSV
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={e => e.target.files && importMunicipalCSV(e.target.files[0])}
              />
            </label>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* SIDEBAR */}
          <aside className="col-span-1 bg-white p-3 rounded shadow-sm">

            <h2 className="font-semibold">Seus calendários</h2>
            <ul>
              {cals.map(c => (
                <li key={c.id} className="p-2 border-b">
                  <button onClick={() => selectCal(c)} className="w-full text-left">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.status}</div>
                  </button>
                </li>
              ))}
            </ul>

            {selected && (
              <>
                {/* LEGENDA DE CORES — (VEM PRIMEIRO, OPÇÃO B) */}
                <div className="mt-4 p-3 bg-white rounded shadow-sm border">
                  <h3 className="text-sm font-semibold mb-2" style={{ color: '#16662e' }}>
                    Legenda de Cores
                  </h3>

                  {legendColors.length === 0 && (
                    <div className="text-xs text-gray-500">Nenhum evento colorido</div>
                  )}

                  <div className="space-y-2">
                    {legendColors.map(color => (
                      <div key={color} className="flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                        <span>{COLOR_LABELS[color] || color}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RESUMO — ABAIXO DA LEGENDA */}
                <div className="mt-4 p-3 bg-white rounded shadow-sm border">
                  <h3 className="text-sm font-semibold mb-2" style={{ color: '#16662e' }}>
                    Resumo
                  </h3>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>Dias letivos</span><span>{total}</span></div>
                    <div className="flex justify-between"><span>Semanas letivas (≈)</span><span>{weeks}</span></div>
                    <div className="flex justify-between"><span>Sábados letivos</span><span>{counts?.sabado || 0}</span></div>
                    <div className="flex justify-between"><span>Total de eventos</span><span>{Object.values(daysMap).filter((e: any) => e.title).length}</span></div>
                  </div>

                  <button
                    onClick={() => exportWeekdayCountsCSV(
                      counts ?? {
                        domingo: 0,
                        segunda: 0,
                        terca: 0,
                        quarta: 0,
                        quinta: 0,
                        sexta: 0,
                        sabado: 0
                      }
                    )}
                    className="mt-2 px-2 py-1 rounded border text-sm"
                  >
                    Exportar CSV
                  </button>
                </div>

                {/* GRÁFICO */}
                <div className="mt-4">
                  <WeekdayCountsChart counts={counts ?? {
                    domingo: 0,
                    segunda: 0,
                    terca: 0,
                    quarta: 0,
                    quinta: 0,
                    sexta: 0,
                    sabado: 0
                  }} />
                </div>
              </>
            )}

          </aside>

          {/* MAIN CONTENT */}
         <main className="col-span-3">
            {selected ? (
              <>
                <CalendarView
                  cal={selected}
                  daysMap={daysMap}
                  onReload={() => selectCal(selected)}
                />

                <EventAccordion
                  events={Object.values(daysMap || {}).filter((ev: any) =>
                    ev.title && ev.title.trim() !== ''
                  )}
                  year={selected.year}
                />
              </>
            ) : (
              <div className="p-4 bg-white rounded">Selecione um calendário</div>
            )}
          </main>

        </div>
      </div>

      <CreateCalendarModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          load()
        }}
        user={user}
        reload={load}
      />
    </div>
  )
}
