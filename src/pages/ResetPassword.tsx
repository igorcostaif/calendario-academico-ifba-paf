import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase } from '../services/supabaseClient'

export default function ResetPassword() {
  const [password, setPassword] = useState('')

  async function updatePassword() {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return alert(error.message)
    alert('Senha atualizada com sucesso')
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-lg font-semibold">Redefinir senha</h2>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full border rounded p-2 mt-4" placeholder="Nova senha" />
        <button onClick={updatePassword} className="mt-4 px-3 py-2 rounded" style={{background:'#1f8a3a',color:'#fff'}}>Atualizar</button>
      </div>
    </div>
  )
}
