import { useAutomationFlows } from '../hooks/useClinic'
import styles from './Automacoes.module.css'

const ICON_BG: Record<string, string> = {
  '📅': 'rgba(0,229,160,0.1)',
  '🔄': 'rgba(0,212,255,0.1)',
  '📊': 'rgba(245,166,35,0.1)',
  '⭐': 'rgba(167,139,250,0.1)',
}

interface Props { onToast: (msg: string) => void }

export default function Automacoes({ onToast }: Props) {
  const { data, loading, toggle } = useAutomationFlows()

  const ativos = data.filter(f => f.active).length

  async function handleToggle(id: string, active: boolean) {
    await toggle(id)
    onToast(active ? '⏸ Automação pausada.' : '✅ Automação ativada!')
  }

  return (
    <div className={styles.page}>
      <div className={styles.ph}>
        <div>
          <h1>Automações</h1>
          <p>Fluxos inteligentes que trabalham por você 24h</p>
        </div>
        <div className={styles.actions}>
          <span className={styles.live}><span className={styles.liveDot} />{ativos} fluxos ativos</span>
          <button className={styles.btnPrimary} onClick={() => onToast('✨ Novo fluxo criado!')}>＋ Novo fluxo</button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', color: '#555', textAlign: 'center' }}>Carregando...</div>
      ) : (
        <div className={styles.flows}>
          {data.map(f => (
            <div key={f.id} className={`${styles.flow} ${f.active ? styles.on : ''}`}>
              <div className={styles.flowHead}>
                <div className={styles.flowIcon} style={{ background: ICON_BG[f.icon ?? ''] ?? 'rgba(255,255,255,0.05)' }}>
                  {f.icon ?? '⚙️'}
                </div>
                <button
                  className={`${styles.tog} ${f.active ? styles.togOn : ''}`}
                  onClick={() => handleToggle(f.id, f.active)}
                />
              </div>
              <div className={styles.flowName}>{f.name}</div>
              <div className={styles.flowDesc}>{f.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
