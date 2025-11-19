import React from 'react'

const COLORS = [
  '#16662e', // verde IFBA
  '#1d4ed8', // azul
  '#b91c1c', // vermelho
  '#b45309', // laranja
  '#9333ea', // roxo
  '#047857', // verde escuro
  '#0891b2', // ciano
]

export default function ColorPickerModal({
  open,
  onClose,
  onSelect
}: {
  open: boolean
  onClose: () => void
  onSelect: (color: string) => void
}) {

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded shadow-xl w-80">

        <h2 className="text-lg font-bold mb-3" style={{color:'#16662e'}}>
          Escolha a cor
        </h2>

        <div className="grid grid-cols-5 gap-3 mt-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                onSelect(c)
                onClose()
              }}
              className="w-10 h-10 rounded-full border shadow-sm"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2 border rounded text-gray-700 hover:bg-gray-100"
        >
          Cancelar
        </button>

      </div>
    </div>
  )
}
