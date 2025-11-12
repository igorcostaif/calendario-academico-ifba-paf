import React, { useState } from 'react'
import dayjs from 'dayjs'
import { supabase } from '../services/supabaseClient'

type Any = any

export default function CalendarView({ cal, daysMap, readOnly=false }:Any){
  const [localMap, setLocalMap] = useState(daysMap||{})
  if(!cal) return null

  const start = dayjs(cal.start_date)
  const end = dayjs(cal.end_date)
  const months: dayjs.Dayjs[] = []
  let cur = start.startOf('month')
  while(cur.isBefore(end) || cur.isSame(end, 'month')){ months.push(cur); cur = cur.add(1,'month') }

  function onToggle(iso:string){
    if(readOnly) return
    const existing = localMap[iso]
    if(existing){
      const next = { ...existing, is_letivo: !existing.is_letivo }
      supabase.from('calendar_events').update({ is_letivo: next.is_letivo }).eq('id', existing.id)
      setLocalMap({ ...localMap, [iso]: next })
    } else {
      const next = { date: iso, title: '', color: '#16662e', is_letivo: false }
      supabase.from('calendar_events').insert({ calendar_id: cal.id, ...next }).select().then(({ data })=>{
        if(data && data[0]) setLocalMap({ ...localMap, [iso]: data[0] })
      })
    }
  }

  function onAddEvent(iso:string){
    if(readOnly) return
    const title = prompt('Título do evento'); if(!title) return
    const color = '#16662e'
    const existing = localMap[iso]
    if(existing){
      const upd = { ...existing, title, color }
      supabase.from('calendar_events').update({ title, color }).eq('id', existing.id)
      setLocalMap({ ...localMap, [iso]: upd })
    } else {
      supabase.from('calendar_events').insert({ calendar_id: cal.id, date: iso, title, color, is_letivo: true }).select().then(({ data })=>{
        if(data && data[0]) setLocalMap({ ...localMap, [iso]: data[0] })
      })
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="calendar-print-area">
      {months.map((m,i)=> <Month key={i} month={m} cal={cal} map={localMap} onToggle={onToggle} onAddEvent={onAddEvent} readOnly={readOnly} />)}
    </div>
  )
}

function Month({ month, cal, map, onToggle, onAddEvent, readOnly }:Any){
  const year = month.year(); const mon = month.month()
  const first = dayjs(new Date(year,mon,1)).day()
  const daysInMonth = month.daysInMonth()
  const cells: dayjs.Dayjs[] = []; let day = 1 - ((first + 6) % 7)
  for(let w=0; w<6; w++){
    for(let d=0; d<7; d++){ cells.push(dayjs(new Date(year,mon,day))); day++ }
    if(day>daysInMonth) break
  }

  return (
    <div className="border rounded p-2 shadow-sm bg-white">
      <div className="text-center font-semibold">{month.format('MMMM YYYY')}</div>
      <div className="grid grid-cols-7 text-xs mt-2">{['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map((d:string)=> <div key={d} className="text-center font-medium">{d}</div>)}</div>
      <div className="grid grid-cols-7 gap-1 mt-2">
        {cells.map((d,i)=>{
          const iso = d.format('YYYY-MM-DD')
          const inRange = d.isAfter(dayjs(cal.start_date).subtract(1,'day')) && d.isBefore(dayjs(cal.end_date).add(1,'day'))
          const ev = map[iso]
          const isSunday = d.day()===0
          const isLetivo = ev ? !!ev.is_letivo : (inRange && !isSunday)
          return (
            <div key={i}
              className={`h-24 p-1 rounded ${inRange ? 'hover:ring-2 hover:ring-ifba-100 cursor-pointer' : 'opacity-40'} ${isLetivo ? 'bg-green-50' : 'bg-red-50'}`}
              onClick={()=> inRange && onToggle(iso)}
              onDoubleClick={()=> inRange && onAddEvent(iso)}
            >
              <div className="text-xs font-medium">{d.date()}</div>
              <div className="flex gap-1 flex-wrap">
                {ev?.title && <span className="text-[10px] px-1 py-[1px] rounded text-white" style={{background: ev.color || '#16662e'}}>{ev.title}</span>}
              </div>
            </div>
          )
        })}
      </div>
      {!readOnly && <div className="text-[11px] text-gray-500 mt-2">Clique: alterna letivo • Duplo clique: adicionar/editar evento</div>}
    </div>
  )
}
