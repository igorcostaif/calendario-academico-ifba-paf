import React, { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
type Any = any

export default function DashboardAdmin({ user, goto }: Any){
  const [cals,setCals]=useState<Any[]>([])
  useEffect(()=>{ load() },[])

  async function load(){
    const { data, error } = await supabase.from('calendars').select('*').order('created_at',{ascending:false})
    if(error) alert(error.message)
    setCals(data||[])
  }

  async function publish(id:string){
    const slug = prompt('Slug público (curto)'); if(!slug) return
    const { error: e1 } = await supabase.from('public_calendars').insert({ calendar_id:id, public_url:slug })
    if(e1) return alert(e1.message)
    const { error: e2 } = await supabase.from('calendars').update({ status:'publicado' }).eq('id', id)
    if(e2) return alert(e2.message)
    alert('Publicado em /public/'+slug); load()
  }

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold" style={{color:'#16662e'}}>Painel Administrativo</h1>
        <div className="mt-4 bg-white p-4 rounded">
          <table className="w-full">
            <thead><tr><th>Nome</th><th>Ano</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>{cals.map(c=> <tr key={c.id}><td>{c.name}</td><td>{c.year}</td><td>{c.status}</td><td><button onClick={()=>publish(c.id)} className="px-2 py-1 rounded" style={{background:'#16662e',color:'#fff'}}>Publicar</button></td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
