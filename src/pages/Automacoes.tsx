import { useState } from 'react'
import type { Automacao } from '../types'
import styles from './Automacoes.module.css'

const initial: Automacao[] = [
  {
    id: 'confirm', icon: '📅', iconBg: 'rgba(0,229,160,0.1)', nome: 'Confirmação automática', ativa: true,
    descricao: '24h antes da consulta, envia mensagem pro paciente pedindo confirmação. Se não confirmar, você é avisado automaticamente.',
    metricas: [{ label: 'envios', valor: '247' }, { label: 'confirmação', valor: '78%', cor: 'var(--green)' }, { label: 'recuperados', valor: 'R$3.2k', cor: 'var(--amber)' }],
  },
  {
    id: 'reag', icon: '🔄', iconBg: 'rgba(0,212,255,0.1)', nome: 'Reagendamento de faltas', ativa: true,
    descricao: 'Quando um paciente falta, o sistema envia automaticamente opções de reagendamento para não perder o cliente.',
    metricas: [{ label: 'faltas', valor: '23' }, { label: 'reagendaram', valor: '61%', cor: 'var(--green)' }, { label: 'recuperados', valor: '14' }],
  },
  {
    id: 'rel', icon: '📊', iconBg: 'rgba(245,166,35,0.1)', nome: 'Relatório semanal', ativa: true,
    descricao: 'Todo domingo às 20h gera e envia automaticamente um resumo de faturamento, faltas e novos pacientes.',
    metricas: [{ label: 'relatórios', valor: '12' }, { label: 'entregues', valor: '100%', cor: 'var(--green)' }, { label: 'economizadas', valor: '~4h', cor: 'var(--cyan)' }],
  },
  {
    id: 'sat', icon: '⭐', iconBg: 'rgba(167,139,250,0.1)', nome: 'Pesquisa de satisfação', ativa: true,
    descricao: '2 horas após a consulta, envia pesquisa de avaliação. Feedbacks negativos alertam a equipe automaticamente.',
    metricas: [{ label: 'avaliações', valor: '89' }, { label: 'média', valor: '4.8★', cor: 'var(--amber)' }, { label: 'responderam', valor: '73%', cor: 'var(--green)' }],
  },
]

interface Props { onToast: (msg: string) => void }

export default function Automacoes({ onToast }: Props) {
  const [flows, setFlows] = useState<Automacao[]>(initial)

  const toggle = (id: string) => {
    setFlows(prev => prev.map(f => f.id === id ? { ...f, ativa: !f.ativa } : f))
    const flow = flows.find(f => f.id === id)
    onToast(flow?.ativa ? '⏸ Automação pausada.' : '✅ Automação ativada!')
  }

  return (
    <div className={styles.page}>
      <div className={styles.ph}>
        <div>
          <h1>Automações</h1>
          <p>Fluxos inteligentes que trabalham por você 24h</p>
        </div>
        <div className={styles.actions}>
          <span className={styles.live}><span className={styles.liveDot} />4 fluxos ativos</span>
          <button className={styles.btnPrimary} onClick={() => onToast('✨ Novo fluxo criado!')}>＋ Novo fluxo</button>
        </div>
      </div>

      <div className={styles.flows}>
        {flows.map(f => (
          <div key={f.id} className={`${styles.flow} ${f.ativa ? styles.on : ''}`}>
            <div className={styles.flowHead}>
              <div className={styles.flowIcon} style={{ background: f.iconBg }}>{f.icon}</div>
              <button className={`${styles.tog} ${f.ativa ? styles.togOn : ''}`} onClick={() => toggle(f.id)} />
            </div>
            <div className={styles.flowName}>{f.nome}</div>
            <div className={styles.flowDesc}>{f.descricao}</div>
            <div className={styles.metrics}>
              {f.metricas.map((m, i) => (
                <div key={i} className={styles.metric}>
                  <span style={{ color: m.cor }}>{m.valor}</span>
                  {m.label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
