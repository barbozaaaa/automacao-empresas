import type { PageId } from '../types'
import styles from './Sidebar.module.css'

interface Props {
  activePage: PageId
  onNavigate: (page: PageId) => void
}

const navItems: { id: PageId; icon: string; label: string; badge?: string; live?: boolean }[] = [
  { id: 'dashboard', icon: '◈', label: 'Dashboard' },
  { id: 'agenda', icon: '◷', label: 'Agendamentos', badge: '18' },
  { id: 'whatsapp', icon: '◉', label: 'Bot WhatsApp', live: true },
  { id: 'flows', icon: '⟳', label: 'Automações', badge: '4' },
  { id: 'relatorios', icon: '▦', label: 'Relatórios' },
  { id: 'pacientes', icon: '◑', label: 'Pacientes' },
]

export default function Sidebar({ activePage, onNavigate }: Props) {
  return (
    <nav className={styles.sidebar}>
      <div className={styles.logoArea}>
        <div className={styles.logoBadge}>
          <div className={styles.logoPulse}>⚡</div>
          <div>
            <div className={styles.logoName}>ClinicaFlow</div>
          </div>
        </div>
        <div className={styles.logoTag}>v2.0 · automação IA</div>
      </div>

      <div className={styles.nav}>
        <div className={styles.navSection}>Principal</div>
        {navItems.slice(0, 2).map(item => (
          <NavItem key={item.id} item={item} active={activePage === item.id} onNavigate={onNavigate} />
        ))}
        <div className={styles.navSection}>Automação</div>
        {navItems.slice(2, 4).map(item => (
          <NavItem key={item.id} item={item} active={activePage === item.id} onNavigate={onNavigate} />
        ))}
        <div className={styles.navSection}>Dados</div>
        {navItems.slice(4).map(item => (
          <NavItem key={item.id} item={item} active={activePage === item.id} onNavigate={onNavigate} />
        ))}
      </div>

      <div className={styles.sidebarBottom}>
        <div className={styles.userCard}>
          <div className={styles.userAv}>OS</div>
          <div>
            <div className={styles.userName}>Odonto Sorrir</div>
            <div className={styles.userRole}>● plano pro</div>
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavItem({ item, active, onNavigate }: {
  item: typeof navItems[number]
  active: boolean
  onNavigate: (page: PageId) => void
}) {
  return (
    <button
      className={`${styles.navItem} ${active ? styles.active : ''}`}
      onClick={() => onNavigate(item.id)}
    >
      <span className={styles.navIcon}>{item.icon}</span>
      {item.label}
      {item.live && <span className={styles.navBadgeLive}>●</span>}
      {item.badge && !item.live && <span className={styles.navBadge}>{item.badge}</span>}
    </button>
  )
}
