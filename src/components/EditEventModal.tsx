import React, { useState } from 'react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import { supabase } from '../services/supabaseClient'

export default function EditEventModal({ open, onClose, event, reload }: any) {
  const [title, setTitle] = useState(event?.title || '')
  const [color, setColor] = useState(event?.color || '#16662e')

  async function save() {
    const { error } = await supabase
      .from('calendar_events')
      .update({ title, color })
      .eq('id', event.id)

    if (error) return alert(error.message)

    onClose()
    reload()
  }

  async function remove() {
    if (!confirm("Excluir evento?")) return
    await supabase.from('calendar_events').delete().eq('id', event.id)
    onClose()
    reload()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4">Editar Evento</h2>

      <input className="border p-2 rounded w-full mb-3" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />

      <label className="block mb-3">Cor:</label>
      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />

      <div className="flex gap-3 mt-4">
        <Button onClick={save}>Salvar</Button>
        <Button color="red" onClick={remove}>Excluir</Button>
      </div>
    </Modal>
  )
}
