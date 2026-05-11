import WhatsAppBot from '../components/WhatsAppBot'
import styles from './BotPage.module.css'

interface Props { onToast: (msg: string) => void }

export default function BotPage({ onToast }: Props) {
  return (
    <div className={styles.page}>
      <div className={styles.ph}>
        <div>
          <h1>Bot WhatsApp</h1>
          <p>Atendimento automático com IA · 24 horas por dia</p>
        </div>
        <span className={styles.live}><span className={styles.liveDot} />47 msgs hoje</span>
      </div>
      <WhatsAppBot onToast={onToast} />
    </div>
  )
}
