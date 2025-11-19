import React, { useState } from 'react'
import { supabase } from '../services/supabaseClient'

export default function Login({ onLogin }:{ onLogin?:()=>void }) {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('')

  async function submit(e:React.FormEvent){
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return alert(error.message)
    onLogin?.()
    window.location.href = '/coord'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <div className="flex flex-col items-center">
          <img src="/logo-ifba.svg" alt="IFBA" className="w-28 mb-4" />
          <h2 className="text-xl font-semibold" style={{color:'#16662e'}}>Calendário Acadêmico — IFBA-PA</h2>
        </div>

        <form onSubmit={submit} className="mt-4">
          <input className="w-full border rounded p-2 mt-3" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} />
          <input type="password" className="w-full border rounded p-2 mt-2" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} />
          <div className="flex justify-between items-center mt-4">
            <button className="px-4 py-2 rounded" style={{background:'#1f8a3a', color:'#fff'}}>Entrar</button>
            <a href="/forgot" className="text-sm text-blue-600">Esqueci a senha</a>
          </div>
        </form>
      </div>
    </div>
  )
}
