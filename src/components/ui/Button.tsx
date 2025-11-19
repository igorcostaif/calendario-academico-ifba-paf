import React from 'react'

export default function Button({ children, onClick, color = 'green', className = '' }: any) {
  const base = "px-3 py-2 rounded text-white font-medium transition"

  const colors: any = {
    green: "bg-[#1f8a3a] hover:bg-[#16662e]",
    red: "bg-red-600 hover:bg-red-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    gray: "bg-gray-600 hover:bg-gray-700"
  }

  return (
    <button onClick={onClick} className={`${base} ${colors[color]} ${className}`}>
      {children}
    </button>
  )
}
