import React, { useState } from 'react'
import { supabase } from '../services/supabaseClient'

export default function Login({ onLogin }:{ onLogin: ()=>void }){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')

  async function submit(e:React.FormEvent){
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if(error) return alert(error.message)
    onLogin()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-semibold" style={{color:'#16662e'}}>IFBA — Calendário Acadêmico</h2>
        <input className="w-full border rounded p-2 mt-4" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full border rounded p-2 mt-2" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} />
        <div className="flex gap-2 mt-4">
          <button className="px-3 py-2 rounded" style={{background:'#1f8a3a', color:'#fff'}}>Entrar</button>
        </div>
      </form>
    </div>
  )
}
