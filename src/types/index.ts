export interface User {
  id: string
  email: string
  displayName?: string
  avatar?: string
  status?: 'online' | 'away' | 'offline'
}

export interface Channel {
  id: string
  name: string
  description?: string
  is_private: boolean
  created_by: string
  created_at: string
}

export interface Message {
  id: string
  channel_id: string
  user_id: string
  content: string
  message_type: string
  created_at: string
}

export interface ChannelMember {
  id: string
  channel_id: string
  user_id: string
  joined_at: string
}