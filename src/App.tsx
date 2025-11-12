import React, { useEffect, useState } from 'react'
import { supabase } from './services/supabaseClient'
import Login from './pages/Login'
import DashboardAdmin from './pages/DashboardAdmin'
import DashboardCoord from './pages/DashboardCoord'
import PublicCalendar from './pages/PublicCalendar'

export default function App(){
  const [user, setUser] = useState<any>(null)
  const [path, setPath] = useState(window.location.pathname)

  useEffect(()=>{
    supabase.auth.getUser().then(r => setUser(r.data.user || null))
    const { data: sub } = supabase.auth.onAuthStateChange((_, s)=> setUser(s?.user ?? null))
    const onPop = ()=> setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return ()=>{ sub.subscription?.unsubscribe(); window.removeEventListener('popstate', onPop) }
  },[])

  const goto = (p:string)=>{ window.history.pushState({}, '', p); setPath(p) }

  if(!user && !path.startsWith('/public')) return <Login onLogin={()=> supabase.auth.getUser().then(r=> setUser(r.data.user))} />
  if(path.startsWith('/admin')) return <DashboardAdmin user={user} goto={goto} />
  if(path.startsWith('/coord')) return <DashboardCoord user={user} goto={goto} />
  if(path.startsWith('/public')) return <PublicCalendar />
  return <DashboardCoord user={user} goto={goto} />
}

