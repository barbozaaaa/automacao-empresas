import { usePatients } from '../hooks/useClinic'
import Badge from '../components/Badge'
import styles from './Pacientes.module.css'

interface Props { onToast: (msg: string) => void }

export default function Pacientes({ onToast }: Props) {
  const { data, loading } = usePatients()

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
          <span className={styles.cardTitle}>
            Todos os pacientes <span className={styles.count}>{loading ? '...' : `${data.length} cadastrados`}</span>
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', color: '#555', textAlign: 'center' }}>Carregando...</div>
        ) : data.length === 0 ? (
          <div style={{ padding: '2rem', color: '#555', textAlign: 'center' }}>Nenhum paciente cadastrado ainda.</div>
        ) : (
          <table className={styles.tbl}>
            <thead>
              <tr><th>Nome</th><th>Telefone</th><th>Email</th><th>Status</th><th>Avaliação</th></tr>
            </thead>
            <tbody>
              {data.map(p => (
                <tr key={p.id}>
                  <td><div className={styles.patName}>{p.name}</div></td>
                  <td className={styles.mono}>{p.phone}</td>
                  <td className={styles.mono}>{p.email ?? '—'}</td>
                  <td>
                    {p.status === 'active'   && <Badge variant="green">Ativo</Badge>}
                    {p.status === 'missed'   && <Badge variant="amber">Faltou</Badge>}
                    {p.status === 'new'      && <Badge variant="blue">Novo</Badge>}
                    {p.status === 'inactive' && <Badge variant="red">Inativo</Badge>}
                  </td>
                  <td className={styles.avaliacao}>
                    {p.rating ? `★ ${p.rating.toFixed(1)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
