import styles from './Badge.module.css'

type Variant = 'green' | 'amber' | 'red' | 'blue' | 'purple'

interface Props {
  variant: Variant
  children: React.ReactNode
}

export default function Badge({ variant, children }: Props) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      <span className={styles.dot} />
      {children}
    </span>
  )
}
