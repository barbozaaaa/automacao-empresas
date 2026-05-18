import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { CrmClient, CrmClientInsert } from '../lib/database.types'
import styles from './CRM.module.css'

const PLAN_LABELS = { free: 'Free', pro: 'Pro', enterprise: 'Enterprise' }
const STATUS_LABELS = { trial: 'Trial', active: 'Ativo', overdue: 'Vencido', cancelled: 'Cancelado' }
const STATUS_VARIANT: Record<string, string> = {
  trial: styles.badgeBlue,
  active: styles.badgeGreen,
  overdue: styles.badgeAmber,
  cancelled: styles.badgeRed,
}
const PLAN_VARIANT: Record<string, string> = {
  free: styles.badgeGray,
  pro: styles.badgePurple,
  enterprise: styles.badgeCyan,
}

const EMPTY_FORM: CrmClientInsert = {
  clinic_name: '', owner_name: '', email: '', phone: '',
  city: '', plan: 'free', plan_status: 'trial',
  plan_expires_at: '', monthly_value: 0, notes: '',
}

export default function CRM({ onLogout }: { onLogout: () => void }) {
  const [clients, setClients] = useState<CrmClient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPlan, setFilterPlan] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [modal, setModal] = useState<'new' | 'edit' | null>(null)
  const [selected, setSelected] = useState<CrmClient | null>(null)
  const [form, setForm] = useState<CrmClientInsert>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    setLoading(true)
    const { data } = await supabase
      .from('crm_clients')
      .select('*')
      .order('created_at', { ascending: false })
    setClients(data ?? [])
    setLoading(false)
  }

  const filtered = clients.filter(c => {
    const matchSearch = search === '' ||
      c.clinic_name.toLowerCase().includes(search.toLowerCase()) ||
      c.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    const matchPlan = filterPlan === 'all' || c.plan === filterPlan
    const matchStatus = filterStatus === 'all' || c.plan_status === filterStatus
    return matchSearch && matchPlan && matchStatus
  })

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.plan_status === 'active').length,
    trial: clients.filter(c => c.plan_status === 'trial').length,
    overdue: clients.filter(c => c.plan_status === 'overdue').length,
    mrr: clients.filter(c => c.plan_status === 'active').reduce((s, c) => s + c.monthly_value, 0),
  }

  function openNew() {
    setForm(EMPTY_FORM)
    setSelected(null)
    setModal('new')
  }

  function openEdit(c: CrmClient) {
    setSelected(c)
    setForm({
      clinic_name: c.clinic_name,
      owner_name: c.owner_name,
      email: c.email,
      phone: c.phone,
      city: c.city ?? '',
      plan: c.plan,
      plan_status: c.plan_status,
      plan_expires_at: c.plan_expires_at ?? '',
      monthly_value: c.monthly_value,
      notes: c.notes ?? '',
    })
    setModal('edit')
  }

  async function saveClient() {
    setSaving(true)
    const payload = { ...form, monthly_value: Number(form.monthly_value) }

    if (modal === 'new') {
      await supabase.from('crm_clients').insert(payload as any)
    } else if (selected) {
      await supabase.from('crm_clients').update(payload as any).eq('id', selected.id)
    }

    await loadClients()
    setModal(null)
    setSaving(false)
  }

  async function deleteClient(id: string) {
    await supabase.from('crm_clients').delete().eq('id', id)
    setDeleteConfirm(null)
    await loadClients()
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <span>🦷</span>
            <span className={styles.logoText}>Flow</span>
            <span className={styles.logoBadge}>ADM</span>
          </div>
          <h1 className={styles.title}>CRM — Clientes</h1>
        </div>
        <button className={styles.btnLogout} onClick={onLogout}>Sair</button>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <StatCard label="Total de clientes" value={stats.total} icon="👥" color="var(--blue, #3b82f6)" />
        <StatCard label="Ativos" value={stats.active} icon="✅" color="#22c55e" />
        <StatCard label="Em trial" value={stats.trial} icon="⏳" color="#a78bfa" />
        <StatCard label="Vencidos" value={stats.overdue} icon="⚠️" color="#f59e0b" />
        <StatCard label="MRR" value={`R$${stats.mrr.toFixed(0)}`} icon="💰" color="#06b6d4" />
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="Buscar clínica, dono ou email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className={styles.select} value={filterPlan} onChange={e => setFilterPlan(e.target.value)}>
          <option value="all">Todos os planos</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select className={styles.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Todos os status</option>
          <option value="trial">Trial</option>
          <option value="active">Ativo</option>
          <option value="overdue">Vencido</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <button className={styles.btnPrimary} onClick={openNew}>＋ Novo cliente</button>
      </div>

      {/* Table */}
      <div className={styles.card}>
        {loading ? (
          <div className={styles.empty}>Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>Nenhum cliente encontrado.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Clínica / Responsável</th>
                <th>Contato</th>
                <th>Cidade</th>
                <th>Plano</th>
                <th>Status</th>
                <th>Vencimento</th>
                <th>Valor/mês</th>
                <th>Notas</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className={styles.clinicName}>{c.clinic_name}</div>
                    <div className={styles.ownerName}>{c.owner_name}</div>
                  </td>
                  <td>
                    <div className={styles.contact}>{c.email}</div>
                    <div className={styles.contact}>{c.phone}</div>
                  </td>
                  <td className={styles.city}>{c.city ?? '—'}</td>
                  <td><span className={`${styles.badge} ${PLAN_VARIANT[c.plan]}`}>{PLAN_LABELS[c.plan]}</span></td>
                  <td><span className={`${styles.badge} ${STATUS_VARIANT[c.plan_status]}`}>{STATUS_LABELS[c.plan_status]}</span></td>
                  <td className={styles.date}>{c.plan_expires_at ? new Date(c.plan_expires_at).toLocaleDateString('pt-BR') : '—'}</td>
                  <td className={styles.value}>{c.monthly_value > 0 ? `R$${c.monthly_value.toFixed(0)}` : '—'}</td>
                  <td className={styles.notes} title={c.notes ?? ''}>{c.notes ? c.notes.slice(0, 40) + (c.notes.length > 40 ? '…' : '') : '—'}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.btnEdit} onClick={() => openEdit(c)}>✏️</button>
                      <button className={styles.btnDelete} onClick={() => setDeleteConfirm(c.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal novo/editar */}
      {modal && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{modal === 'new' ? 'Novo cliente' : 'Editar cliente'}</h2>

            <div className={styles.grid2}>
              <Field label="Nome da clínica *">
                <input className={styles.input} value={form.clinic_name} onChange={e => setForm(f => ({ ...f, clinic_name: e.target.value }))} />
              </Field>
              <Field label="Responsável *">
                <input className={styles.input} value={form.owner_name} onChange={e => setForm(f => ({ ...f, owner_name: e.target.value }))} />
              </Field>
              <Field label="Email *">
                <input className={styles.input} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </Field>
              <Field label="Telefone *">
                <input className={styles.input} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </Field>
              <Field label="Cidade">
                <input className={styles.input} value={form.city ?? ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
              </Field>
              <Field label="Plano">
                <select className={styles.input} value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value as CrmClientInsert['plan'] }))}>
                  <option value="free">Free</option>
                  <option value="pro">Pro — R$197/mês</option>
                  <option value="enterprise">Enterprise — R$497/mês</option>
                </select>
              </Field>
              <Field label="Status">
                <select className={styles.input} value={form.plan_status} onChange={e => setForm(f => ({ ...f, plan_status: e.target.value as CrmClientInsert['plan_status'] }))}>
                  <option value="trial">Trial</option>
                  <option value="active">Ativo</option>
                  <option value="overdue">Vencido</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </Field>
              <Field label="Vencimento">
                <input className={styles.input} type="date" value={form.plan_expires_at ?? ''} onChange={e => setForm(f => ({ ...f, plan_expires_at: e.target.value }))} />
              </Field>
              <Field label="Valor mensal (R$)">
                <input className={styles.input} type="number" value={form.monthly_value} onChange={e => setForm(f => ({ ...f, monthly_value: Number(e.target.value) }))} />
              </Field>
            </div>

            <Field label="Observações">
              <textarea className={styles.textarea} rows={3} value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </Field>

            <div className={styles.modalActions}>
              <button className={styles.btnGhost} onClick={() => setModal(null)}>Cancelar</button>
              <button
                className={styles.btnPrimary}
                onClick={saveClient}
                disabled={saving || !form.clinic_name || !form.owner_name || !form.email || !form.phone}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de exclusão */}
      {deleteConfirm && (
        <div className={styles.overlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.confirmBox} onClick={e => e.stopPropagation()}>
            <p className={styles.confirmText}>Tem certeza que deseja remover este cliente?</p>
            <div className={styles.modalActions}>
              <button className={styles.btnGhost} onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button className={styles.btnDanger} onClick={() => deleteClient(deleteConfirm)}>Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statIcon}>{icon}</span>
      <div className={styles.statValue} style={{ color }}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  )
}
