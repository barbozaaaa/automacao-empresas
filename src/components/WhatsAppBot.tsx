import { useState, useRef, useEffect } from 'react'
import type { KeyboardEvent } from 'react'
import type { BotMessage } from '../types'
import styles from './WhatsAppBot.module.css'

interface BotState {
  step: 'inicio' | 'nome' | 'proc' | 'horario' | 'fim'
  nome: string | null
  proc: string | null
}

function botReply(msg: string, state: BotState): { response: string; newState: BotState } {
  const m = msg.toLowerCase().trim()
  const s = { ...state }

  if (s.step === 'inicio') {
    s.step = 'nome'
    if (m.includes('horár') || m.includes('hora')) {
      s.step = 'inicio'
      return { response: '📅 Horários disponíveis:\n\nQuarta: 10h, 14h, 16h\nQuinta: 09h, 14h\nSexta: 11h\n\nQuer agendar?', newState: s }
    }
    if (m.includes('limpeza') || m.includes('preço') || m.includes('valor')) {
      s.step = 'inicio'
      return { response: '🦷 Limpeza dental: R$180 (~45min)\n\n✓ Remoção de tártaro\n✓ Polimento\n✓ Orientação de higiene\n\nQuer agendar?', newState: s }
    }
    if (m.includes('plano') || m.includes('convênio')) {
      s.step = 'inicio'
      return { response: '✅ Atendemos:\n• Unimed Odonto\n• SulAmérica\n• Bradesco Dental\n• Porto Seguro\n\nQual é o seu plano?', newState: s }
    }
    if (m.includes('cancel')) {
      s.step = 'inicio'
      return { response: 'Para cancelar, me diz seu nome e horário da consulta. Ou prefere reagendar? 🔄', newState: s }
    }
    return { response: 'Olá! 😊 Para começar, me diz seu nome completo?', newState: s }
  }

  if (s.step === 'nome') {
    s.nome = msg.split(' ')[0]
    s.step = 'proc'
    return {
      response: `Prazer, ${s.nome}! 😄\n\nQue tipo de consulta você precisa?\n\n1️⃣ Limpeza — R$180\n2️⃣ Avaliação — Grátis\n3️⃣ Canal — R$800\n4️⃣ Clareamento — R$600\n5️⃣ Ortodontia — a partir de R$350`,
      newState: s,
    }
  }

  if (s.step === 'proc') {
    if (m.includes('1') || m.includes('limpeza')) s.proc = 'Limpeza dental — R$180'
    else if (m.includes('2') || m.includes('avalia')) s.proc = 'Avaliação — Grátis'
    else if (m.includes('3') || m.includes('canal')) s.proc = 'Canal — R$800'
    else if (m.includes('4') || m.includes('clarea')) s.proc = 'Clareamento — R$600'
    else if (m.includes('5') || m.includes('orto')) s.proc = 'Ortodontia — R$350+'
    else s.proc = msg
    s.step = 'horario'
    return { response: '📅 Horários disponíveis:\n\nQuarta: 10h ou 15h\nQuinta: 09h ou 14h\nSexta: 11h\n\nQual prefere?', newState: s }
  }

  if (s.step === 'horario') {
    const nome = s.nome; const proc = s.proc
    s.step = 'fim'
    return {
      response: `Perfeito! Agendamento confirmado ✅\n\n👤 ${nome}\n📅 ${msg}\n🦷 ${proc}\n📍 Rua das Flores, 142\n\nVou te mandar um lembrete na véspera. Qualquer dúvida é só chamar! 😊`,
      newState: s,
    }
  }

  s.step = 'inicio'; s.nome = null; s.proc = null
  return { response: 'Posso ajudar com mais alguma coisa? Digite "agendar" para uma nova consulta 😊', newState: s }
}

interface Props {
  compact?: boolean
  onToast?: (msg: string) => void
}

export default function WhatsAppBot({ compact = false, onToast }: Props) {
  const initialMsg: BotMessage = {
    text: compact
      ? 'Olá! 😊 Sou o assistente da Odonto Sorrir. Como posso ajudar?'
      : 'Olá! 😊 Sou o assistente da Odonto Sorrir.\n\nPosso ajudar com:\n• Agendar consulta\n• Confirmar agendamento\n• Horários e valores\n• Informações gerais',
    from: 'bot',
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  }

  const [messages, setMessages] = useState<BotMessage[]>([initialMsg])
  const [input, setInput] = useState('')
  const [botState, setBotState] = useState<BotState>({ step: 'inicio', nome: null, proc: null })
  const msgsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
  }, [messages])

  const now = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const send = () => {
    if (!input.trim()) return
    const val = input
    setInput('')
    const userMsg: BotMessage = { text: val, from: 'user', time: now() + ' ✓✓' }
    setMessages(prev => [...prev, userMsg])
    setTimeout(() => {
      const { response, newState } = botReply(val, botState)
      setBotState(newState)
      setMessages(prev => [...prev, { text: response, from: 'bot', time: now() }])
    }, 700)
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') send() }

  const quickReplies = [
    'Oi, quero agendar uma consulta',
    'Quais horários disponíveis?',
    'Qual o valor da limpeza?',
    'Vocês atendem plano odontológico?',
    'Preciso cancelar minha consulta',
  ]

  const clear = () => {
    setBotState({ step: 'inicio', nome: null, proc: null })
    setMessages([initialMsg])
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div className={styles.av}>🤖</div>
        <div>
          <div className={styles.name}>Assistente Odonto Sorrir</div>
          <div className={styles.status}>● online agora</div>
        </div>
        {!compact && (
          <button className={styles.clearBtn} onClick={clear}>Limpar</button>
        )}
      </div>

      <div className={styles.msgs} ref={msgsRef} style={{ height: compact ? 300 : 420 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`${styles.msg} ${styles[msg.from]}`}>
            {msg.text.split('\n').map((line, j) => (
              <span key={j}>{line}<br /></span>
            ))}
            <div className={styles.time}>{msg.time}</div>
          </div>
        ))}
      </div>

      {!compact && (
        <div className={styles.quickWrap}>
          {quickReplies.map(q => (
            <button key={q} className={styles.quickBtn} onClick={() => { setInput(q) }}>
              💬 {q}
            </button>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <input
          className={styles.inp}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder={compact ? 'Responder como paciente...' : 'Digite uma mensagem...'}
        />
        <button className={styles.sendBtn} onClick={send}>▶</button>
      </div>

      {!compact && onToast && (
        <div className={styles.miniStats}>
          <div className={styles.miniStat}><div className={styles.miniVal} style={{ color: 'var(--green)' }}>94%</div><div className={styles.miniLbl}>sem humano</div></div>
          <div className={styles.miniStat}><div className={styles.miniVal} style={{ color: 'var(--cyan)' }}>18s</div><div className={styles.miniLbl}>resp. média</div></div>
          <div className={styles.miniStat}><div className={styles.miniVal} style={{ color: 'var(--amber)' }}>47</div><div className={styles.miniLbl}>msgs hoje</div></div>
          <div className={styles.miniStat}><div className={styles.miniVal} style={{ color: 'var(--blue)' }}>8</div><div className={styles.miniLbl}>agendados</div></div>
        </div>
      )}
    </div>
  )
}
