import React, { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import CalendarView from '../components/CalendarView'
type Any = any

export default function PublicCalendar(){
  const slug = decodeURIComponent(window.location.pathname.split('/').pop()||'')
  const [cal,setCal]=useState<Any>(null)
  const [events,setEvents]=useState<Any[]>([])

  useEffect(()=>{ if(slug) load() },[slug])

  async function load(){
    const { data, error } = await supabase.from('public_calendars').select('*, calendars(*)').eq('public_url', slug).single()
    if(error){ console.error(error); setCal(null); return }
    if(!data){ setCal(null); return }
    setCal(data.calendars)
    const { data:ev } = await supabase.from('calendar_events').select('*').eq('calendar_id', data.calendar_id).order('date')
    setEvents(ev||[])
  }

  if(!cal) return <div className="p-4">Calendário não encontrado ou não publicado.</div>
  const map:Record<string,Any> = {}; (events||[]).forEach(d=> map[d.date]=d)

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{color:'#16662e'}}>{cal.name}</h1>
          <button onClick={()=>window.print()} className="px-3 py-2 rounded" style={{background:'#1f8a3a', color:'#fff'}}>Imprimir</button>
        </header>
        <CalendarView cal={cal} daysMap={map} readOnly />
      </div>
    </div>
  )
}
