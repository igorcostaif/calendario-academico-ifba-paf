export function exportWeekdayCountsCSV(counts:Record<string, number>, filename='counts.csv'){
  const rows = [['weekday','count'], ...Object.entries(counts)]
  const csv = rows.map(r => r.map(cell => `"${cell}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
