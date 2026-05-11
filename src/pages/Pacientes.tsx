import type { Paciente } from '../types'
import Badge from '../components/Badge'
import styles from './Pacientes.module.css'

const pacientes: Paciente[] = [
  { nome: 'Maria Santos', telefone: '(11) 98821-3344', ultimaConsulta: '28/04', proxima: '06/05', status: 'ativo', avaliacao: '★ 5.0' },
  { nome: 'João Almeida', telefone: '(11) 99933-1122', ultimaConsulta: '15/03', proxima: '06/05', status: 'ativo', avaliacao: '★ 4.5' },
  { nome: 'Lucia Ferreira', telefone: '(11) 97744-5566', ultimaConsulta: '02/05', proxima: '06/05', status: 'ativo', avaliacao: '★ 5.0' },
  { nome: 'Carlos Mendes', telefone: '(11) 96655-8899', ultimaConsulta: '10/04', proxima: '—', status: 'faltou', avaliacao: '★ 3.0' },
  { nome: 'Ana Paula Costa', telefone: '(11) 95544-7711', ultimaConsulta: '20/04', proxima: '06/05', status: 'ativo', avaliacao: '★ 4.8' },
  { nome: 'Roberto Lima', telefone: '(11) 94433-2211', ultimaConsulta: '—', proxima: '07/05', status: 'novo', avaliacao: '—' },
  { nome: 'Fernanda Souza', telefone: '(11) 93322-9988', ultimaConsulta: '01/05', proxima: '07/05', status: 'ativo', avaliacao: '★ 5.0' },
]

interface Props { onToast: (msg: string) => void }

export default function Pacientes({ onToast }: Props) {
  return (
    <div className={styles.page}>
      <div className={styles.ph}>
        <div>
          <h1>Pacientes</h1>
          <p>Base completa de pacientes da clínica</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnGhost}>↓ Exportar</button>
          <button className={styles.btnPrimary} onClick={() => onToast('➕ Paciente cadastrado!')}>＋ Novo paciente</button>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.cardTitle}>Todos os pacientes <span className={styles.count}>142 cadastrados</span></span>
        </div>
        <table className={styles.tbl}>
          <thead>
            <tr><th>Nome</th><th>Telefone</th><th>Última consulta</th><th>Próxima</th><th>Status</th><th>Avaliação</th></tr>
          </thead>
          <tbody>
            {pacientes.map((p, i) => (
              <tr key={i}>
                <td><div className={styles.patName}>{p.nome}</div></td>
                <td className={styles.mono}>{p.telefone}</td>
                <td className={styles.mono}>{p.ultimaConsulta}</td>
                <td className={`${styles.mono} ${p.proxima !== '—' ? styles.proxNext : ''}`}>{p.proxima}</td>
                <td>
                  {p.status === 'ativo' && <Badge variant="green">Ativo</Badge>}
                  {p.status === 'faltou' && <Badge variant="amber">Faltou</Badge>}
                  {p.status === 'novo' && <Badge variant="blue">Novo</Badge>}
                </td>
                <td className={styles.avaliacao}>{p.avaliacao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
