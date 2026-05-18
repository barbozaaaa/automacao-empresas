import { useAppointments } from '../hooks/useClinic'
import Badge from '../components/Badge'
import styles from './Agendamentos.module.css'

interface Props { onToast: (msg: string) => void }

export default function Agendamentos({ onToast }: Props) {
  const { data, loading, updateStatus } = useAppointments()

  const confirmed    = data.filter(a => a.status === 'confirmed').length
  const pending      = data.filter(a => a.status === 'pending').length
  const missed       = data.filter(a => a.status === 'missed').length

  async function confirmar(id: string) {
    await updateStatus(id, 'confirmed')
    onToast('✅ Paciente confirmado!')
  }

  async function reagendar(id: string) {
    await updateStatus(id, 'rescheduling')
    onToast('🔄 Reagendamento iniciado!')
  }

  return (
    <div className={styles.page}>
      <div className={styles.ph}>
        <div>
          <h1>Agendamentos</h1>
          <p>Gerencie todas as consultas da clínica</p>
        </div>
        <div className={styles.actions}>
          <Badge variant="green">{confirmed} confirmados</Badge>
          <Badge variant="amber">{pending} pendentes</Badge>
          <Badge variant="red">{missed} falta(s)</Badge>
          <button className={styles.btnPrimary} onClick={() => onToast('➕ Agendamento criado!')}>＋ Novo</button>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.cardTitle}>Todos os agendamentos <span style={{ color: '#555', fontSize: '0.8rem' }}>({data.length})</span></span>
          <button className={styles.btnGhost}>↓ Exportar</button>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', color: '#555', textAlign: 'center' }}>Carregando...</div>
        ) : data.length === 0 ? (
          <div style={{ padding: '2rem', color: '#555', textAlign: 'center' }}>Nenhum agendamento encontrado.</div>
        ) : (
          <table className={styles.tbl}>
            <thead>
              <tr><th>Paciente</th><th>Data</th><th>Horário</th><th>Procedimento</th><th>Valor</th><th>Status</th><th>Ação</th></tr>
            </thead>
            <tbody>
              {data.map(a => {
                const dt = new Date(a.scheduled_at)
                return (
                  <tr key={a.id}>
                    <td>
                      <div className={styles.patName}>{(a as any).patient_name ?? '—'}</div>
                      <div className={styles.patPhone}>{(a as any).patient_phone ?? ''}</div>
                    </td>
                    <td className={styles.mono}>{dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</td>
                    <td className={styles.mono}>{dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
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
                      {a.status === 'pending'   && <button className={styles.btnSm} onClick={() => confirmar(a.id)}>Confirmar</button>}
                      {a.status === 'missed'    && <button className={styles.btnSm} onClick={() => reagendar(a.id)}>Reagendar</button>}
                      {(a.status === 'confirmed' || a.status === 'scheduled' || a.status === 'rescheduling') && <button className={styles.btnSm}>↗</button>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
