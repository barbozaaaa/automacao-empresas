import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Patient, Appointment, AutomationFlow } from '../lib/database.types'

async function getClinicId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data } = await supabase
    .from('clinics')
    .select('id')
    .eq('owner_id', session.user.id)
    .single()

  return (data as any)?.id ?? null
}

// ─────────────────────────────────────────────
// usePatients
// ─────────────────────────────────────────────
export function usePatients() {
  const [clinicId, setClinicId] = useState<string | null>(null)
  const [data, setData]         = useState<Patient[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const cid = clinicId ?? await getClinicId()
    if (!cid) { setLoading(false); return }
    if (!clinicId) setClinicId(cid)

    const { data: rows, error: err } = await supabase
      .from('patients')
      .select('*')
      .eq('clinic_id', cid)
      .order('name')

    if (err) setError(err.message)
    else setData((rows ?? []) as Patient[])
    setLoading(false)
  }, [clinicId])

  useEffect(() => { load() }, [load])

  const addPatient = useCallback(async (p: Omit<Patient, 'id' | 'clinic_id' | 'created_at' | 'updated_at'>) => {
    const cid = clinicId ?? await getClinicId()
    if (!cid) return null
    const { error: err } = await supabase
      .from('patients')
      .insert({ ...p, clinic_id: cid } as any)
    if (!err) await load()
    return err
  }, [clinicId, load])

  const updatePatient = useCallback(async (id: string, p: Partial<Patient>) => {
    const { error: err } = await supabase
      .from('patients')
      .update(p as any)
      .eq('id', id)
    if (!err) await load()
    return err
  }, [load])

  return { data, loading, error, refetch: load, addPatient, updatePatient }
}

// ─────────────────────────────────────────────
// useAppointments
// ─────────────────────────────────────────────
type AppointmentWithPatient = Appointment & { patient_name?: string; patient_phone?: string }

export function useAppointments(dateFilter?: string) {
  const [clinicId, setClinicId] = useState<string | null>(null)
  const [data, setData]         = useState<AppointmentWithPatient[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const cid = clinicId ?? await getClinicId()
    if (!cid) { setLoading(false); return }
    if (!clinicId) setClinicId(cid)

    let query = supabase
      .from('appointments')
      .select('*, patients(name, phone)')
      .eq('clinic_id', cid)
      .order('scheduled_at')

    if (dateFilter) {
      query = query
        .gte('scheduled_at', `${dateFilter}T00:00:00`)
        .lte('scheduled_at', `${dateFilter}T23:59:59`)
    }

    const { data: rows, error: err } = await query

    if (err) {
      setError(err.message)
    } else {
      setData((rows ?? []).map((r: any) => ({
        ...r,
        patient_name:  r.patients?.name,
        patient_phone: r.patients?.phone,
      })))
    }
    setLoading(false)
  }, [clinicId, dateFilter])

  useEffect(() => { load() }, [load])

  const updateStatus = useCallback(async (id: string, status: Appointment['status']) => {
    setData(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    await supabase
      .from('appointments')
      .update({ status } as any)
      .eq('id', id)
  }, [])

  return { data, loading, error, refetch: load, updateStatus }
}

// ─────────────────────────────────────────────
// useAutomationFlows
// ─────────────────────────────────────────────
export function useAutomationFlows() {
  const [clinicId, setClinicId] = useState<string | null>(null)
  const [data, setData]         = useState<AutomationFlow[]>([])
  const [loading, setLoading]   = useState(true)

  const load = useCallback(async () => {
    const cid = clinicId ?? await getClinicId()
    if (!cid) { setLoading(false); return }
    if (!clinicId) setClinicId(cid)

    const { data: rows } = await supabase
      .from('automation_flows')
      .select('*')
      .eq('clinic_id', cid)
      .order('created_at')

    setData((rows ?? []) as AutomationFlow[])
    setLoading(false)
  }, [clinicId])

  useEffect(() => { load() }, [load])

  const toggle = useCallback(async (id: string) => {
    const flow = data.find(f => f.id === id)
    if (!flow) return
    setData(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f))
    await supabase
      .from('automation_flows')
      .update({ active: !flow.active } as any)
      .eq('id', id)
  }, [data])

  return { data, loading, toggle }
}

// ─────────────────────────────────────────────
// useBotMetrics
// ─────────────────────────────────────────────
export function useBotMetrics() {
  const [messagesSent, setMessagesSent] = useState(0)
  const [resolved, setResolved]         = useState(0)
  const [scheduled, setScheduled]       = useState(0)

  useEffect(() => {
    async function load() {
      const cid = await getClinicId()
      if (!cid) return
      const today = new Date().toISOString().slice(0, 10)
      const { data } = await supabase
        .from('bot_metrics')
        .select('*')
        .eq('clinic_id', cid)
        .eq('date', today)
        .single()
      if (data) {
        const d = data as any
        setMessagesSent(d.messages_sent)
        setResolved(d.resolved)
        setScheduled(d.scheduled)
      }
    }
    load()
  }, [])

  return { messagesSent, setMessagesSent, resolved, scheduled }
}

// ─────────────────────────────────────────────
// useClinicInfo
// ─────────────────────────────────────────────
export function useClinicInfo() {
  const [name, setName]     = useState<string>('')
  const [plan, setPlan]     = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const cid = await getClinicId()
      if (!cid) { setLoading(false); return }
      const { data } = await supabase
        .from('clinics')
        .select('name, plan')
        .eq('id', cid)
        .single()
      if (data) {
        const d = data as any
        setName(d.name)
        setPlan(d.plan)
      }
      setLoading(false)
    }
    load()
  }, [])

  return { name, plan, loading }
}
