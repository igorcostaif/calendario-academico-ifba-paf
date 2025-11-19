import React from 'react'

export default function Modal({ open, onClose, children }: any) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]">
      <div className="bg-white p-6 rounded shadow-xl w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute right-2 top-2 text-gray-600 text-lg"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
}
