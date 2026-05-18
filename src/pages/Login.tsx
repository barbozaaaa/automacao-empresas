import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './Login.module.css'

type Tab = 'login' | 'cadastro'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [tab, setTab]           = useState<Tab>('login')
  const [clinicName, setClinicName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (tab === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error)
    } else {
      if (!clinicName.trim()) { setError('Informe o nome da clínica.'); setLoading(false); return }
      const { error } = await signUp(email, password, clinicName)
      if (error) setError(error)
      else setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.')
    }

    setLoading(false)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>Flow</span>
        </div>
        <p className={styles.tagline}>Automação inteligente para clínicas</p>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
            onClick={() => { setTab('login'); setError(null); setSuccess(null) }}
          >
            Entrar
          </button>
          <button
            className={`${styles.tab} ${tab === 'cadastro' ? styles.tabActive : ''}`}
            onClick={() => { setTab('cadastro'); setError(null); setSuccess(null) }}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {tab === 'cadastro' && (
            <div className={styles.field}>
              <label className={styles.label}>Nome da clínica</label>
              <input
                className={styles.input}
                placeholder="Ex: Clínica Sorriso Feliz"
                value={clinicName}
                onChange={e => setClinicName(e.target.value)}
                autoFocus
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>E-mail</label>
            <input
              className={styles.input}
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus={tab === 'login'}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Senha</label>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {tab === 'cadastro' && (
              <span className={styles.hint}>Mínimo 6 caracteres</span>
            )}
          </div>

          {error   && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.successMsg}>{success}</div>}

          <button
            type="submit"
            className={styles.btn}
            disabled={loading || !email || !password}
          >
            {loading
              ? 'Aguarde...'
              : tab === 'login' ? 'Entrar no painel' : 'Criar minha conta'}
          </button>
        </form>

        <div className={styles.adminLink}>
          <a href="/admin" className={styles.adminAnchor}>Acesso administrativo →</a>
        </div>
      </div>
    </div>
  )
}
