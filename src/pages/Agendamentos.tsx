import { useState } from 'react'
import type { Consulta } from '../types'
import Badge from '../components/Badge'
import styles from './Agendamentos.module.css'

const initial: Consulta[] = [
  { nome: 'Maria Santos', telefone: '(11) 98821-3344', data: '06/05', horario: '09:00', procedimento: 'Limpeza', valor: 'R$180', status: 'confirmada' },
  { nome: 'João Almeida', telefone: '(11) 99933-1122', data: '06/05', horario: '10:30', procedimento: 'Canal', valor: 'R$800', status: 'aguardando' },
  { nome: 'Lucia Ferreira', telefone: '(11) 97744-5566', data: '06/05', horario: '11:00', procedimento: 'Ortodontia', valor: 'R$350', status: 'confirmada' },
  { nome: 'Carlos Mendes', telefone: '(11) 96655-8899', data: '06/05', horario: '14:00', procedimento: 'Clareamento', valor: 'R$600', status: 'faltou' },
  { nome: 'Ana Paula Costa', telefone: '(11) 95544-7711', data: '06/05', horario: '15:30', procedimento: 'Extração', valor: 'R$250', status: 'aguardando' },
  { nome: 'Roberto Lima', telefone: '(11) 94433-2211', data: '07/05', horario: '09:30', procedimento: 'Avaliação', valor: 'Grátis', status: 'agendado' },
  { nome: 'Fernanda Souza', telefone: '(11) 93322-9988', data: '07/05', horario: '14:00', procedimento: 'Limpeza', valor: 'R$180', status: 'confirmada' },
]

interface Props { onToast: (msg: string) => void }

export default function Agendamentos({ onToast }: Props) {
  const [consultas, setConsultas] = useState<Consulta[]>(initial)

  const confirmar = (i: number) => {
    setConsultas(prev => prev.map((c, idx) => idx === i ? { ...c, status: 'confirmada' } : c))
    onToast('✅ Paciente confirmado!')
  }

  return (
    <div className={styles.page}>
      <div className={styles.ph}>
        <div>
          <h1>Agendamentos</h1>
          <p>Gerencie todas as consultas da clínica</p>
        </div>
        <div className={styles.actions}>
          <Badge variant="green">14 confirmados</Badge>
          <Badge variant="amber">3 pendentes</Badge>
          <Badge variant="red">1 falta</Badge>
          <button className={styles.btnPrimary} onClick={() => onToast('➕ Agendamento criado!')}>＋ Novo</button>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.cardTitle}>Todos os agendamentos</span>
          <button className={styles.btnGhost}>↓ Exportar</button>
        </div>
        <table className={styles.tbl}>
          <thead>
            <tr><th>Paciente</th><th>Data</th><th>Horário</th><th>Procedimento</th><th>Valor</th><th>Status</th><th>Ação</th></tr>
          </thead>
          <tbody>
            {consultas.map((c, i) => (
              <tr key={i}>
                <td>
                  <div className={styles.patName}>{c.nome}</div>
                  <div className={styles.patPhone}>{c.telefone}</div>
                </td>
                <td className={styles.mono}>{c.data}</td>
                <td className={styles.mono}>{c.horario}</td>
                <td>{c.procedimento}</td>
                <td className={c.status === 'faltou' ? styles.valRed : styles.valGreen}>{c.valor}</td>
                <td>
                  {c.status === 'confirmada' && <Badge variant="green">Confirmada</Badge>}
                  {c.status === 'aguardando' && <Badge variant="amber">Aguardando</Badge>}
                  {c.status === 'faltou' && <Badge variant="red">Faltou</Badge>}
                  {c.status === 'agendado' && <Badge variant="blue">Agendado</Badge>}
                </td>
                <td>
                  {c.status === 'aguardando'
                    ? <button className={styles.btnSm} onClick={() => confirmar(i)}>Confirmar</button>
                    : <button className={styles.btnSm}>↗</button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
