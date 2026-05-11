import { useState } from 'react'
import type { Consulta } from '../types'
import Badge from '../components/Badge'
import WhatsAppBot from '../components/WhatsAppBot'
import styles from './Dashboard.module.css'

const initialConsultas: Consulta[] = [
  { nome: 'Maria Santos', telefone: '(11) 98821-3344', data: '06/05', horario: '09:00', procedimento: 'Limpeza', valor: 'R$180', status: 'confirmada' },
  { nome: 'João Almeida', telefone: '(11) 99933-1122', data: '06/05', horario: '10:30', procedimento: 'Canal', valor: 'R$800', status: 'aguardando' },
  { nome: 'Lucia Ferreira', telefone: '(11) 97744-5566', data: '06/05', horario: '11:00', procedimento: 'Ortodontia', valor: 'R$350', status: 'confirmada' },
  { nome: 'Carlos Mendes', telefone: '(11) 96655-8899', data: '06/05', horario: '14:00', procedimento: 'Clareamento', valor: 'R$600', status: 'faltou' },
  { nome: 'Ana Paula Costa', telefone: '(11) 95544-7711', data: '06/05', horario: '15:30', procedimento: 'Extração', valor: 'R$250', status: 'aguardando' },
]

interface Props {
  onToast: (msg: string) => void
}

export default function Dashboard({ onToast }: Props) {
  const [consultas, setConsultas] = useState<Consulta[]>(initialConsultas)
  const [confirmadas, setConfirmadas] = useState(14)
  const [msgs, setMsgs] = useState(47)

  const confirmar = (index: number) => {
    setConsultas(prev => prev.map((c, i) => i === index ? { ...c, status: 'confirmada' } : c))
    setConfirmadas(v => v + 1)
    onToast('✅ Paciente confirmado via WhatsApp!')
  }

  const reagendar = (index: number) => {
    setConsultas(prev => prev.map((c, i) => i === index ? { ...c, status: 'agendado' } : c))
    onToast('🔄 Mensagem de reagendamento enviada!')
  }

  const simConfirm = () => {
    onToast('📱 Enviando confirmações automáticas...')
    setTimeout(() => {
      setConsultas(prev => prev.map(c => c.status === 'aguardando' ? { ...c, status: 'confirmada' } : c))
      setConfirmadas(18)
      setMsgs(v => v + 3)
      onToast('✅ 2 pacientes confirmaram via WhatsApp!')
    }, 1600)
  }

  return (
    <div className={styles.page}>
      <div className={styles.ph}>
        <div>
          <h1>Bom dia, Dra. Ana 👋</h1>
          <p className={styles.sub}>
            <span className={styles.live}><span className={styles.liveDot} />sistema online</span>
            · Terça, 6 de maio de 2025
          </p>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnGhost} onClick={simConfirm}>▶ Simular confirmações</button>
          <button className={styles.btnPrimary} onClick={() => onToast('➕ Novo agendamento criado!')}>＋ Novo agendamento</button>
        </div>
      </div>

      <div className={styles.stats}>
        <StatCard icon="📅" value="18" label="Consultas hoje" change="↑ 3 a mais que ontem" changeColor="var(--cyan)" glowColor="var(--cyan)" valueColor="var(--cyan)" />
        <StatCard icon="✅" value={String(confirmadas)} label="Confirmadas auto." change="↑ 78% taxa confirmação" changeColor="var(--green)" glowColor="var(--green)" valueColor="var(--green)" />
        <StatCard icon="💰" value="R$750" label="Faltas evitadas" change="↑ 5 faltas prevenidas" changeColor="var(--amber)" glowColor="var(--amber)" valueColor="var(--amber)" />
        <StatCard icon="💬" value={String(msgs)} label="Mensagens enviadas" change="pelo bot hoje" changeColor="var(--text3)" glowColor="var(--blue)" valueColor="var(--blue)" />
      </div>

      <div className={styles.grid2}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Consultas de hoje</span>
            <Badge variant="blue">Terça, 06/05</Badge>
          </div>
          <table className={styles.tbl}>
            <thead>
              <tr>
                <th>Paciente</th><th>Horário</th><th>Proc.</th><th>Valor</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {consultas.map((c, i) => (
                <tr key={i}>
                  <td>
                    <div className={styles.patName}>{c.nome}</div>
                    <div className={styles.patPhone}>{c.telefone}</div>
                  </td>
                  <td className={styles.mono}>{c.horario}</td>
                  <td>{c.procedimento}</td>
                  <td className={c.status === 'faltou' ? styles.valRed : styles.valGreen}>{c.valor}</td>
                  <td>
                    {c.status === 'confirmada' && <Badge variant="green">Confirmada</Badge>}
                    {c.status === 'aguardando' && <Badge variant="amber">Aguardando</Badge>}
                    {c.status === 'faltou' && <Badge variant="red">Faltou</Badge>}
                    {c.status === 'agendado' && <Badge variant="purple">Reagendando</Badge>}
                  </td>
                  <td>
                    {c.status === 'aguardando' && (
                      <button className={styles.btnSm} onClick={() => confirmar(i)}>Confirmar</button>
                    )}
                    {c.status === 'faltou' && (
                      <button className={styles.btnSm} onClick={() => reagendar(i)}>Reagendar</button>
                    )}
                    {(c.status === 'confirmada' || c.status === 'agendado') && (
                      <button className={styles.btnSm}>↗</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
