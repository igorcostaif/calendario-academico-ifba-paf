import React, { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import dayjs from 'dayjs'
import CalendarView from '../components/CalendarView'
import { getBrazilHolidays } from '../services/holidays'

type Any = any

export default function DashboardCoord({ user, goto }: Any){
  const [cals,setCals]=useState<Any[]>([])
  const [selected,setSelected]=useState<Any>(null)
  const [daysMap,setDaysMap]=useState<Record<string, Any>>({})

  useEffect(()=>{ if(user) load() },[user])

  async function load(){
    const { data, error } = await supabase.from('calendars').select('*').eq('user_id', user.id).order('created_at',{ascending:false})
    if(error) alert(error.message)
    setCals(data||[])
    if(data?.length) selectCal(data[0])
  }

  async function selectCal(cal:Any){
    setSelected(cal)
    const { data } = await supabase.from('calendar_events').select('*').eq('calendar_id', cal.id).order('date')
    const map:Record<string,Any>={}; (data||[]).forEach(d=> map[d.date]=d)
    setDaysMap(map)
  }

  async function createCal(){
    const name = prompt('Nome do calendário'); if(!name) return
    const y = new Date().getFullYear()
    const payload = { user_id: user.id, name, year: y, start_date: `${y}-02-01`, end_date: `${y}-12-20`, status: 'rascunho' }
    const { error } = await supabase.from('calendars').insert(payload)
    if(error) return alert(error.message)
    load()
  }

  async function importHolidays(){
    if(!selected) return alert('Selecione um calendário.')
    try{
      const hs = await getBrazilHolidays(selected.year)
      const rows = hs.map(h => ({
        calendar_id: selected.id,
        date: h.date,
        title: h.name,
        color: '#b91c1c',
        is_letivo: false
      }))
      // requer unique(calendar_id,date) no SQL
      const { error } = await supabase.from('calendar_events').upsert(rows, { onConflict: 'calendar_id,date' })
      if(error) throw error
      alert('Feriados importados com sucesso!')
      await selectCal(selected)
    }catch(err:any){
      alert(err.message || 'Falha ao importar feriados.')
    }
  }

  function countLetivosByWeekday(cal: Any, map: Record<string, Any>){
    if(!cal) return {}
    const start = dayjs(cal.start_date); const end = dayjs(cal.end_date)
    const result:Record<string, number> = {segunda:0,terca:0,quarta:0,quinta:0,sexta:0,sabado:0,domingo:0}
    const names = ['domingo','segunda','terca','quarta','quinta','sexta','sabado']
    for(let d=start; d.isBefore(end) || d.isSame(end); d=d.add(1,'day')){
      const iso = d.format('YYYY-MM-DD'); const info = map[iso]; const dow = d.day()
      const isSunday = dow===0
      const isLetivo = info ? !!info.is_letivo : !isSunday
      if(isLetivo) result[names[dow]]++
    }
    return result
  }

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{color:'#16662e'}}>Meus Calendários</h1>
          <div className="flex gap-2">
            <button onClick={createCal} className="px-3 py-2 rounded" style={{background:'#1f8a3a',color:'#fff'}}>Novo</button>
            <button onClick={importHolidays} className="px-3 py-2 rounded" style={{background:'#b91c1c',color:'#fff'}}>Importar feriados</button>
            <button onClick={async()=>{await supabase.auth.signOut(); goto('/login')}} className="px-3 py-2 border rounded">Sair</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <aside className="col-span-1 bg-white p-3 rounded shadow-sm">
            <h2 className="font-semibold">Seus calendários</h2>
            <ul>{cals.map(c=> <li key={c.id} className="p-2 border-b"><button onClick={()=>selectCal(c)}>{c.name}<div className="text-xs text-gray-500">{c.status}</div></button></li>)}</ul>

            {selected && (
              <div className="mt-3 text-sm bg-gray-50 p-2 rounded">
                <div className="font-semibold mb-1" style={{color:'#16662e'}}>Letivos por dia</div>
                {Object.entries(countLetivosByWeekday(selected, daysMap)).map(([k,v])=> (
                  <div key={k} className="flex justify-between"><span className="capitalize">{k}</span><span>{v as number}</span></div>
                ))}
                <div className="flex justify-between mt-1 border-t pt-1">
                  <span>Total</span>
                  <span>{Object.values(countLetivosByWeekday(selected, daysMap)).reduce((a:any,b:any)=>a+b,0)}</span>
                </div>
              </div>
            )}
          </aside>

          <main className="col-span-3">
            {selected ? <CalendarView cal={selected} daysMap={daysMap} readOnly={false} /> : <div className="p-4 bg-white rounded">Selecione um calendário</div>}
          </main>
        </div>
      </div>
    </div>
  )
}
