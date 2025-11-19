import React, { useEffect, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import type { EventApi } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import dayjs from 'dayjs'
import { supabase } from '../services/supabaseClient'
import YearlyCalendarView from './YearlyCalendarView'
import ColorPickerModal from './ColorPickerModal'

type EventRow = {
  id: string
  date: string
  title?: string
  color?: string
  is_letivo?: boolean
}

export default function CalendarView({
  cal,
  daysMap,
  readOnly = false,
  onReload
}: {
  cal: any
  daysMap: Record<string, EventRow>
  readOnly?: boolean
  onReload?: () => void
}) {
  const calendarRef = useRef<any>(null)

  const [viewMode, setViewMode] = useState<'month' | 'year'>('month')
  const [selectedYear, setSelectedYear] = useState<number>(cal.year)

  // Modal de cor
  const [colorModalOpen, setColorModalOpen] = useState(false)
  const [pendingColorCallback, setPendingColorCallback] = useState<((color: string) => void) | null>(null)

  useEffect(() => {
    setSelectedYear(cal.year)
  }, [cal])

  async function toggleLetivo(dateStr: string) {
    if (!cal) return
    const existing = daysMap[dateStr]

    if (existing) {
      const { error } = await supabase
        .from('calendar_events')
        .update({ is_letivo: !existing.is_letivo })
        .eq('id', existing.id)
      if (error) return alert(error.message)
    } else {
      const { error } = await supabase.from('calendar_events').insert({
        calendar_id: cal.id,
        date: dateStr,
        title: '',
        color: '#16662e',
        is_letivo: true
      })
      if (error) return alert(error.message)
    }
    onReload?.()
  }

  function openColorPicker(cb: (color: string) => void) {
    setPendingColorCallback(() => cb)
    setColorModalOpen(true)
  }

  async function createEvent(dateStr: string) {
    if (!cal) return

    const title = prompt('Título do evento:')
    if (!title) return

    openColorPicker(async (color) => {
      const { error } = await supabase
        .from('calendar_events')
        .insert({
          calendar_id: cal.id,
          date: dateStr,
          title,
          color,
          is_letivo: true
        })
      if (error) return alert(error.message)
      onReload?.()
    })
  }

  async function editEvent(ev: EventApi) {
    const id = ev.id
    const row = daysMap[ev.startStr]
    if (!row) return

    const newTitle = prompt('Editar título', ev.title)
    if (newTitle === null) return

    openColorPicker(async (color) => {
      const { error } = await supabase
        .from('calendar_events')
        .update({
          title: newTitle,
          color
        })
        .eq('id', id)

      if (error) return alert(error.message)
      onReload?.()
    })
  }

  function handleDateClick(info: any) {
    if (readOnly) return
    toggleLetivo(dayjs(info.date).format('YYYY-MM-DD'))
  }

  let lastClick = 0
  function handleDayMouseDown(ev: any) {
    const now = Date.now()
    const diff = now - lastClick

    if (diff < 400) {
      const cell = ev?.target?.closest?.('.fc-daygrid-day')
      const date = cell?.getAttribute('data-date')
      if (date) createEvent(date)
    }

    lastClick = now
  }

  const events = Object.entries(daysMap || {}).map(([d, ev]) => ({
    id: ev.id,
    title: ev.title || (ev.is_letivo ? 'Letivo' : 'Não letivo'),
    start: d,
    allDay: true,
    backgroundColor: ev.color ?? (ev.is_letivo ? '#e6f4ea' : '#fee2e2'),
    borderColor: ev.color ?? '#16662e'
  }))

  // VISÃO ANO
  if (viewMode === 'year') {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setSelectedYear(selectedYear - 1)} className="px-3 py-1 border rounded">◀</button>
          <div className="text-xl font-bold" style={{ color: '#16662e' }}>{selectedYear}</div>
          <button onClick={() => setSelectedYear(selectedYear + 1)} className="px-3 py-1 border rounded">▶</button>
        </div>

        <YearlyCalendarView
          year={selectedYear}
          cal={cal}
          daysMap={daysMap}
          onToggleLetivo={toggleLetivo}
        />

        <div className="flex justify-end mt-4">
          <button onClick={() => setViewMode('month')} className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200">
            Voltar para Mês
          </button>
        </div>

        <ColorPickerModal
          open={colorModalOpen}
          onClose={() => setColorModalOpen(false)}
          onSelect={(c) => pendingColorCallback && pendingColorCallback(c)}
        />
      </div>
    )
  }

  // VISÃO MÊS
  return (
    <div onMouseDown={handleDayMouseDown}>
      <div className="flex justify-end mb-3">
        <button onClick={() => setViewMode('year')} className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200">
          Ano
        </button>
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        eventClick={(info) => !readOnly && editEvent(info.event)}
        dayMaxEventRows={3}
      />

      <div className="text-xs text-gray-600 mt-2">
        Clique: alterna letivo/não letivo • Duplo clique: adicionar evento • Clique em evento: editar
      </div>

      <ColorPickerModal
        open={colorModalOpen}
        onClose={() => setColorModalOpen(false)}
        onSelect={(c) => pendingColorCallback && pendingColorCallback(c)}
      />
    </div>
  )
}
