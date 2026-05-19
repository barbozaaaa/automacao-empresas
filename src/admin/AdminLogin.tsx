import { useState } from 'react'
import styles from './AdminLogin.module.css'

interface Props {
  onLogin: () => void
}

export default function AdminLogin({ onLogin }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)

    await new Promise(r => setTimeout(r, 600))

    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'clinicaflow@adm2026'
    if (password === adminPassword) {
      sessionStorage.setItem('flow_admin', '1')
      onLogin()
    } else {
      setError(true)
    }
    setLoading(false)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🦷</span>
          <span className={styles.logoText}>Flow</span>
          <span className={styles.logoBadge}>ADM</span>
        </div>
        <h1 className={styles.title}>Painel Administrativo</h1>
        <p className={styles.sub}>Acesso restrito — apenas administradores</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Senha de acesso</label>
            <input
              type="password"
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              placeholder="••••••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false) }}
              autoFocus
            />
            {error && <span className={styles.errorMsg}>Senha incorreta. Tente novamente.</span>}
          </div>

          <button type="submit" className={styles.btn} disabled={loading || !password}>
            {loading ? 'Verificando...' : 'Entrar no painel'}
          </button>
        </form>

        <p className={styles.back}>
          <a href="/" className={styles.backLink}>← Voltar ao Flow</a>
        </p>
      </div>
    </div>
  )
}
