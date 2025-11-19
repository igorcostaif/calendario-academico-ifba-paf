import React, { useState } from 'react'
import { supabase } from '../services/supabaseClient'

export default function ForgotPassword(){
  const [email,setEmail]=useState('')
  async function send(){
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset' })
    if(error) return alert(error.message)
    alert('E-mail de recuperação enviado (verifique caixa de spam).')
  }
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-lg font-semibold">Recuperar senha</h2>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail" className="w-full border rounded p-2 mt-4" />
        <button onClick={send} className="mt-4 px-3 py-2 rounded" style={{background:'#1f8a3a',color:'#fff'}}>Enviar</button>
      </div>
    </div>
  )
}
