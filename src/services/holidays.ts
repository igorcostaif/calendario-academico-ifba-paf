export type BrazilHoliday = { date: string; name: string; type?: string }

/** Busca feriados nacionais pela BrasilAPI (array) */
export async function getBrazilNationalHolidays(year: number): Promise<BrazilHoliday[]> {
  const url = `https://brasilapi.com.br/api/feriados/v1/${year}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Erro ao buscar feriados na BrasilAPI')
  const data = await res.json()
  // Data costuma ser [{date:"2025-01-01", name:"Confraternização Universal", ...}, ...]
  return data.map((h:any) => ({ date: h.date, name: h.name, type: h.type || 'national' }))
}

/** Tenta filtrar por estado (melhor-effort) */
export async function getBrazilStateHolidays(year:number, stateAbbrev:string): Promise<BrazilHoliday[]> {
  try {
    const all = await getBrazilNationalHolidays(year)
    // BrasilAPI não tem endpoint padrão para estado em todos os casos => fallback
    // Se existir alguma tag no name com sigla, filtra, caso contrário retorna empty
    return all.filter(h => (h as any).type !== 'national' || (h.name && h.name.toLowerCase().includes(stateAbbrev.toLowerCase())))
  } catch(e) {
    return []
  }
}

/** Parse CSV simples: header date,name,municipality */
export function parseMunicipalCSV(csvText: string) {
  const lines = csvText.split(/\r?\n/).filter(Boolean)
  const header = lines.shift() || ''
  const idxDate = header.split(',').map(h=>h.trim()).indexOf('date')
  const idxName = header.split(',').map(h=>h.trim()).indexOf('name')
  const idxMunicipality = header.split(',').map(h=>h.trim()).indexOf('municipality')
  if (idxDate === -1 || idxName === -1) throw new Error('CSV deve conter cabeçalho: date,name,municipality')
  return lines.map(line => {
    const cols = line.split(',')
    return { date: cols[idxDate].trim(), name: cols[idxName].trim(), municipality: (cols[idxMunicipality]||'').trim() }
  })
}
