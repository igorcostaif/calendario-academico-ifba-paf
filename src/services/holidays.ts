export type BrazilHoliday = { date: string; name: string; type: string }

export async function getBrazilHolidays(year: number): Promise<BrazilHoliday[]> {
  const url = `https://brasilapi.com.br/api/feriados/v1/${year}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Erro ao buscar feriados na BrasilAPI')
  return res.json()
}