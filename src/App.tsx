import { useState, useCallback } from 'react'
import type { PageId } from './types'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Agendamentos from './pages/Agendamentos'
import BotPage from './pages/BotPage'
import Automacoes from './pages/Automacoes'
import Relatorios from './pages/Relatorios'
import Pacientes from './pages/Pacientes'
import styles from './App.module.css'

function AppContent() {
  const { session, loading, signOut } = useAuth()
  const [page, setPage]   = useState<PageId>('dashboard')
  const [toast, setToast] = useState({ msg: '', key: 0 })

  const showToast = useCallback((msg: string) => {
    setToast(prev => ({ msg, key: prev.key + 1 }))
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: '#555' }}>
      Carregando...
    </div>
  )

  if (!session) return <Login />

  return (
    <>
      <Sidebar activePage={page} onNavigate={setPage} onSignOut={signOut} />
      <main className={styles.main}>
        {page === 'dashboard'  && <Dashboard onToast={showToast} />}
        {page === 'agenda'     && <Agendamentos onToast={showToast} />}
        {page === 'whatsapp'   && <BotPage onToast={showToast} />}
        {page === 'flows'      && <Automacoes onToast={showToast} />}
        {page === 'relatorios' && <Relatorios onToast={showToast} />}
        {page === 'pacientes'  && <Pacientes onToast={showToast} />}
      </main>
      <Toast message={toast.msg} visible={toast.key > 0} key={toast.key} />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
