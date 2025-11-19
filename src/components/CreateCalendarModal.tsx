import React, { useState } from 'react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import { supabase } from '../services/supabaseClient'

export default function CreateCalendarModal({ open, onClose, user, reload }: any) {
  const [name, setName] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  async function create() {
    if (!name || !start || !end) return alert("Preencha todos os campos.")

    const { error } = await supabase.from("calendars").insert({
      name,
      year,
      user_id: user.id,
      start_date: start,
      end_date: end,
    })

    if (error) return alert(error.message)

    onClose()
    reload()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4">Novo Calendário</h2>

      <div className="grid grid-cols-1 gap-3">
        <input className="border p-2 rounded" placeholder="Nome" onChange={(e) => setName(e.target.value)} />

        <input type="number" className="border p-2 rounded" value={year} onChange={(e) => setYear(Number(e.target.value))} />

        <label>Início do Ano Letivo:</label>
        <input type="date" className="border p-2 rounded" onChange={(e) => setStart(e.target.value)} />

        <label>Fim do Ano Letivo:</label>
        <input type="date" className="border p-2 rounded" onChange={(e) => setEnd(e.target.value)} />

        <Button onClick={create}>Criar</Button>
      </div>
    </Modal>
  )
}
