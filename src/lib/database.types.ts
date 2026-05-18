export type Database = {
  public: {
    Tables: {
      clinics: {
        Row: {
          id:         string
          owner_id:   string | null
          name:       string
          phone:      string | null
          email:      string | null
          plan:       'trial' | 'free' | 'pro' | 'enterprise'
          active:     boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?:        string
          owner_id?:  string | null
          name:       string
          phone?:     string | null
          email?:     string | null
          plan?:      'trial' | 'free' | 'pro' | 'enterprise'
          active?:    boolean
        }
        Update: {
          name?:      string
          phone?:     string | null
          email?:     string | null
          plan?:      'trial' | 'free' | 'pro' | 'enterprise'
          active?:    boolean
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id:         string
          clinic_id:  string
          name:       string
          phone:      string
          email:      string | null
          status:     'active' | 'new' | 'missed' | 'inactive'
          rating:     number | null
          notes:      string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?:        string
          clinic_id:  string
          name:       string
          phone:      string
          email?:     string | null
          status?:    'active' | 'new' | 'missed' | 'inactive'
          rating?:    number | null
          notes?:     string | null
        }
        Update: {
          name?:      string
          phone?:     string
          email?:     string | null
          status?:    'active' | 'new' | 'missed' | 'inactive'
          rating?:    number | null
          notes?:     string | null
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id:           string
          clinic_id:    string
          patient_id:   string
          procedure:    string
          value:        number
          scheduled_at: string
          status:       'confirmed' | 'pending' | 'missed' | 'scheduled' | 'rescheduling'
          notes:        string | null
          created_at:   string
          updated_at:   string
        }
        Insert: {
          id?:          string
          clinic_id:    string
          patient_id:   string
          procedure:    string
          value?:       number
          scheduled_at: string
          status?:      'confirmed' | 'pending' | 'missed' | 'scheduled' | 'rescheduling'
          notes?:       string | null
        }
        Update: {
          procedure?:    string
          value?:        number
          scheduled_at?: string
          status?:       'confirmed' | 'pending' | 'missed' | 'scheduled' | 'rescheduling'
          notes?:        string | null
          updated_at?:   string
        }
      }
      automation_flows: {
        Row: {
          id:          string
          clinic_id:   string
          name:        string
          description: string | null
          icon:        string | null
          active:      boolean
          created_at:  string
        }
        Insert: {
          id?:          string
          clinic_id:    string
          name:         string
          description?: string | null
          icon?:        string | null
          active?:      boolean
        }
        Update: {
          name?:        string
          description?: string | null
          icon?:        string | null
          active?:      boolean
        }
      }
      bot_metrics: {
        Row: {
          id:            string
          clinic_id:     string
          date:          string
          messages_sent: number
          resolved:      number
          scheduled:     number
          created_at:    string
        }
        Insert: {
          clinic_id:      string
          date?:          string
          messages_sent?: number
          resolved?:      number
          scheduled?:     number
        }
        Update: {
          messages_sent?: number
          resolved?:      number
          scheduled?:     number
        }
      }
      crm_clients: {
        Row: {
          id:              string
          clinic_name:     string
          owner_name:      string
          email:           string
          phone:           string
          city:            string | null
          plan:            'free' | 'pro' | 'enterprise'
          plan_status:     'trial' | 'active' | 'overdue' | 'cancelled'
          plan_expires_at: string | null
          monthly_value:   number
          notes:           string | null
          created_at:      string
          updated_at:      string
        }
        Insert: {
          id?:              string
          clinic_name:      string
          owner_name:       string
          email:            string
          phone:            string
          city?:            string | null
          plan?:            'free' | 'pro' | 'enterprise'
          plan_status?:     'trial' | 'active' | 'overdue' | 'cancelled'
          plan_expires_at?: string | null
          monthly_value?:   number
          notes?:           string | null
        }
        Update: {
          clinic_name?:     string
          owner_name?:      string
          email?:           string
          phone?:           string
          city?:            string | null
          plan?:            'free' | 'pro' | 'enterprise'
          plan_status?:     'trial' | 'active' | 'overdue' | 'cancelled'
          plan_expires_at?: string | null
          monthly_value?:   number
          notes?:           string | null
          updated_at?:      string
        }
      }
    }
  }
}

export type Clinic         = Database['public']['Tables']['clinics']['Row']
export type Patient        = Database['public']['Tables']['patients']['Row']
export type Appointment    = Database['public']['Tables']['appointments']['Row']
export type AutomationFlow = Database['public']['Tables']['automation_flows']['Row']
export type BotMetrics     = Database['public']['Tables']['bot_metrics']['Row']
export type CrmClient      = Database['public']['Tables']['crm_clients']['Row']
export type CrmClientInsert = Database['public']['Tables']['crm_clients']['Insert']
export type CrmClientUpdate = Database['public']['Tables']['crm_clients']['Update']
