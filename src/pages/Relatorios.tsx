import { useEffect, useRef } from 'react'
import styles from './Relatorios.module.css'

interface Props { onToast: (msg: string) => void }

export default function Relatorios({ onToast }: Props) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const c = chartRef.current
    if (!c || c.children.length) return
    const vals = [62, 78, 95, 70]
    const colors = ['rgba(0,229,160,0.3)', 'rgba(0,229,160,0.5)', 'rgba(0,229,160,0.9)', 'rgba(0,229,160,0.6)']
    vals.forEach((v, i) => {
      const col = document.createElement('div')
      col.className = styles.barCol
      const bar = document.createElement('div')
      bar.className = styles.barFill
      bar.style.cssText = `height:${v}%;background:${colors[i]};transition-delay:${i * 0.1}s`
      col.appendChild(bar)
      c.appendChild(col)
    })
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.ph}>
        <div>
          <h1>Relatórios</h1>
          <p>Dados gerados automaticamente todo mês</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => onToast('📄 Relatório gerado e enviado por e-mail!')}>
          ⬇ Gerar relatório
        </button>
      </div>

      <div className={styles.grid2}>
        <div className={styles.card}>
          <div className={styles.cardHead}><span className={styles.cardTitle}>Faturamento — Maio 2025</span></div>
          <div className={styles.cardBody}>
            <div className={styles.bigVal} style={{ color: 'var(--green)' }}>R$18.450</div>
            <div className={styles.subVal}><span className={styles.up}>↑ 23%</span> em relação a abril</div>
            <div className={styles.chart} ref={chartRef} />
            <div className={styles.chartLabels}><span>Sem 1</span><span>Sem 2</span><span>Sem 3</span><span>Sem 4</span></div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}><span className={styles.cardTitle}>Taxa de presença</span></div>
          <div className={styles.cardBody}>
            <div className={styles.bigVal} style={{ color: 'var(--cyan)' }}>87%</div>
            <div className={styles.subVal}><span className={styles.up}>↑ 15%</span> desde a automação</div>
            <div className={styles.progBar}><div className={styles.progFill} style={{ width: '87%' }} /></div>
            <div className={styles.progNote}>Antes: <span style={{ color: 'var(--red)' }}>72%</span> → Hoje: <span style={{ color: 'var(--green)' }}>87%</span></div>
            <div className={styles.divider} />
            <div className={styles.metricRow}><span>Pacientes ativos</span><span className={styles.metricVal}>142</span></div>
            <div className={styles.metricRow}><span>Novos este mês</span><span className={styles.metricVal} style={{ color: 'var(--green)' }}>+18</span></div>
            <div className={styles.metricRow}><span>Ticket médio</span><span className={styles.metricVal} style={{ color: 'var(--amber)' }}>R$323</span></div>
          </div>
        </div>
      </div>

      <div className={styles.card} style={{ marginTop: 16 }}>
        <div className={styles.cardHead}><span className={styles.cardTitle}>Relatórios disponíveis</span></div>
        <div className={styles.cardBody}>
          {[
            { icon: '📊', bg: 'rgba(0,229,160,0.1)', name: 'Relatório mensal — Abril 2025', meta: 'gerado em 01/05 automaticamente · 14 páginas' },
            { icon: '👥', bg: 'rgba(77,159,255,0.1)', name: 'Relatório de pacientes — Abril 2025', meta: 'novos, ativos, inativos · gerado em 01/05' },
            { icon: '⚠️', bg: 'rgba(245,166,35,0.1)', name: 'Análise de faltas — Abril 2025', meta: 'R$3.200 em faltas evitadas · gerado em 01/05' },
          ].map(r => (
            <div key={r.name} className={styles.rptRow}>
              <div className={styles.rptIco} style={{ background: r.bg }}>{r.icon}</div>
              <div className={styles.rptInfo}>
                <div className={styles.rptName}>{r.name}</div>
                <div className={styles.rptMeta}>{r.meta}</div>
              </div>
              <button className={styles.btnGhost} onClick={() => onToast('📄 Relatório baixado!')}>⬇ Baixar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
