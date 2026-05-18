import { useAuth } from '../context/AuthContext'
import { useAppointments, useBotMetrics } from '../hooks/useClinic'
import Badge from '../components/Badge'
import WhatsAppBot from '../components/WhatsAppBot'
import styles from './Dashboard.module.css'

interface Props { onToast: (msg: string) => void }

export default function Dashboard({ onToast }: Props) {
  const { session } = useAuth()
  const { data: appointments, loading, updateStatus } = useAppointments()
  const { messagesSent } = useBotMetrics()

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const todayStr = new Date().toISOString().slice(0, 10)

  const todayAppts = appointments.filter(a => a.scheduled_at?.slice(0, 10) === todayStr)
  const confirmed  = todayAppts.filter(a => a.status === 'confirmed').length
  const missed     = todayAppts.filter(a => a.status === 'missed').length
  const revenue    = todayAppts.filter(a => a.status !== 'missed').reduce((s, a) => s + (a.value ?? 0), 0)

  const clinicName = (session?.user?.user_metadata?.clinic_name as string) ?? 'Dra.'

  async function confirmar(id: string) {
    await updateStatus(id, 'confirmed')
    onToast('✅ Paciente confirmado via WhatsApp!')
  }

  async function reagendar(id: string) {
    await updateStatus(id, 'rescheduling')
    onToast('🔄 Mensagem de reagendamento enviada!')
  }

  return (
    <div className={styles.page}>
      <div className={styles.ph}>
        <div>
          <h1>Bom dia, {clinicName} 👋</h1>
          <p className={styles.sub}>
            <span className={styles.live}><span className={styles.liveDot} />sistema online</span>
            · {today}
          </p>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={() => onToast('➕ Novo agendamento criado!')}>＋ Novo agendamento</button>
        </div>
      </div>

      <div className={styles.stats}>
        <StatCard icon="📅" value={String(todayAppts.length)} label="Consultas hoje"       change={`${confirmed} confirmadas`}       changeColor="var(--cyan)"  glowColor="var(--cyan)"  valueColor="var(--cyan)" />
        <StatCard icon="✅" value={String(confirmed)}         label="Confirmadas"           change={`${Math.round(confirmed / Math.max(todayAppts.length,1) * 100)}% taxa`} changeColor="var(--green)" glowColor="var(--green)" valueColor="var(--green)" />
        <StatCard icon="💰" value={`R$${revenue}`}            label="Receita prevista"      change={`${missed} falta(s) hoje`}        changeColor="var(--amber)" glowColor="var(--amber)" valueColor="var(--amber)" />
        <StatCard icon="💬" value={String(messagesSent)}      label="Mensagens enviadas"    change="pelo bot hoje"                    changeColor="var(--text3)" glowColor="var(--blue)"  valueColor="var(--blue)" />
      </div>

      <div className={styles.grid2}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Consultas de hoje</span>
            <Badge variant="blue">{new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}</Badge>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', color: '#555', textAlign: 'center' }}>Carregando...</div>
          ) : todayAppts.length === 0 ? (
            <div style={{ padding: '2rem', color: '#555', textAlign: 'center' }}>Nenhuma consulta hoje.</div>
          ) : (
            <table className={styles.tbl}>
              <thead>
                <tr><th>Paciente</th><th>Horário</th><th>Proc.</th><th>Valor</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {todayAppts.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className={styles.patName}>{a.patient_name ?? '—'}</div>
                      <div className={styles.patPhone}>{a.patient_phone ?? ''}</div>
                    </td>
                    <td className={styles.mono}>{new Date(a.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{a.procedure}</td>
                    <td className={a.status === 'missed' ? styles.valRed : styles.valGreen}>R${a.value}</td>
                    <td>
                      {a.status === 'confirmed'    && <Badge variant="green">Confirmada</Badge>}
                      {a.status === 'pending'      && <Badge variant="amber">Aguardando</Badge>}
                      {a.status === 'missed'       && <Badge variant="red">Faltou</Badge>}
                      {a.status === 'scheduled'    && <Badge variant="blue">Agendado</Badge>}
                      {a.status === 'rescheduling' && <Badge variant="purple">Reagendando</Badge>}
                    </td>
                    <td>
                      {a.status === 'pending'  && <button className={styles.btnSm} onClick={() => confirmar(a.id)}>Confirmar</button>}
                      {a.status === 'missed'   && <button className={styles.btnSm} onClick={() => reagendar(a.id)}>Reagendar</button>}
                      {(a.status === 'confirmed' || a.status === 'scheduled' || a.status === 'rescheduling') && <button className={styles.btnSm}>↗</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Bot agora</span>
            <span className={styles.live}><span className={styles.liveDot} />online</span>
          </div>
          <WhatsAppBot compact onToast={onToast} />
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, value, label, change, changeColor, glowColor, valueColor }: {
  icon: string; value: string; label: string; change: string
  changeColor: string; glowColor: string; valueColor: string
}) {
  return (
    <div className={styles.stat}>
      <span className={styles.statIcon}>{icon}</span>
      <div className={styles.statVal} style={{ color: valueColor }}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statChange} style={{ color: changeColor }}>{change}</div>
      <div className={styles.statGlow} style={{ background: glowColor }} />
    </div>
  )
}
