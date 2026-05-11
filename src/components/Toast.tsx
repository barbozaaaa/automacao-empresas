import { useEffect, useState } from 'react'
import styles from './Toast.module.css'

interface Props {
  message: string
  visible: boolean
}

export default function Toast({ message, visible }: Props) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible) {
      setShow(true)
      const t = setTimeout(() => setShow(false), 3200)
      return () => clearTimeout(t)
    }
  }, [visible, message])

  return (
    <div className={`${styles.toast} ${show ? styles.show : ''}`}>
      <div className={styles.dot} />
      <span>{message}</span>
    </div>
  )
}
