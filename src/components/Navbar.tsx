import React from 'react'
import { supabase } from '../services/supabaseClient'

export default function Navbar({ user }: any) {
  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="w-full bg-[#16662e] text-white p-3 flex justify-between items-center">
      <h1 className="font-semibold text-lg">IFBA - Calendário Acadêmico</h1>

      <div className="flex items-center gap-4">
        {user?.email}
        <button className="bg-white text-[#16662e] px-3 py-1 rounded" onClick={logout}>
          Sair
        </button>
      </div>
    </div>
  )
}
