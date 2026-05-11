export type PageId = 'dashboard' | 'agenda' | 'whatsapp' | 'flows' | 'relatorios' | 'pacientes'

export interface Consulta {
  nome: string
  telefone: string
  data: string
  horario: string
  procedimento: string
  valor: string
  status: 'confirmada' | 'aguardando' | 'faltou' | 'agendado'
}

export interface Paciente {
  nome: string
  telefone: string
  ultimaConsulta: string
  proxima: string
  status: 'ativo' | 'faltou' | 'novo'
  avaliacao: string
}

export interface Automacao {
  id: string
  icon: string
  iconBg: string
  nome: string
  descricao: string
  metricas: { label: string; valor: string; cor?: string }[]
  ativa: boolean
}

export interface BotMessage {
  text: string
  from: 'bot' | 'user'
  time: string
}
