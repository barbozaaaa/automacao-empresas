import { useState, useCallback } from 'react'
import type { PageId } from './types'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import Dashboard from './pages/Dashboard'
import Agendamentos from './pages/Agendamentos'
import BotPage from './pages/BotPage'
import Automacoes from './pages/Automacoes'
import Relatorios from './pages/Relatorios'
import Pacientes from './pages/Pacientes'
import styles from './App.module.css'

export default function App() {
  const [page, setPage] = useState<PageId>('dashboard')
  const [toast, setToast] = useState({ msg: '', key: 0 })

  const showToast = useCallback((msg: string) => {
    setToast(prev => ({ msg, key: prev.key + 1 }))
  }, [])

  return (
    <>
      <Sidebar activePage={page} onNavigate={setPage} />
      <main className={styles.main}>
        {page === 'dashboard' && <Dashboard onToast={showToast} />}
        {page === 'agenda' && <Agendamentos onToast={showToast} />}
        {page === 'whatsapp' && <BotPage onToast={showToast} />}
        {page === 'flows' && <Automacoes onToast={showToast} />}
        {page === 'relatorios' && <Relatorios onToast={showToast} />}
        {page === 'pacientes' && <Pacientes onToast={showToast} />}
      </main>
      <Toast message={toast.msg} visible={toast.key > 0} key={toast.key} />
    </>
  )
}
