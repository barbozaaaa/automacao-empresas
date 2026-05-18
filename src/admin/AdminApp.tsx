import { useState } from 'react'
import AdminLogin from './AdminLogin'
import CRM from './CRM'

export default function AdminApp() {
  const [logged, setLogged] = useState(() => sessionStorage.getItem('flow_admin') === '1')

  function logout() {
    sessionStorage.removeItem('flow_admin')
    setLogged(false)
  }

  if (!logged) return <AdminLogin onLogin={() => setLogged(true)} />
  return <CRM onLogout={logout} />
}
