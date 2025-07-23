import { useState, useEffect } from 'react'
import { Hash, Users, Settings, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { blink } from '@/blink/client'
import type { Channel, User } from '@/types'

interface SidebarProps {
  currentChannel: string
  onChannelSelect: (channelId: string) => void
  user: User | null
}

export function Sidebar({ currentChannel, onChannelSelect, user }: SidebarProps) {
  const [channels, setChannels] = useState<Channel[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const loadChannels = async () => {
    try {
      const channelsData = await blink.db.channels.list({
        orderBy: { name: 'asc' }
      })
      setChannels(channelsData)
    } catch (error) {
      console.error('Error loading channels:', error)
    }
  }

  useEffect(() => {
    loadChannels()
  }, [])

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-semibold text-white">Komunikator</h1>
        <p className="text-sm text-slate-400">Firma XYZ</p>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Szukaj kanałów..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
          />
        </div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide">
              Kanały
            </h3>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-400 hover:text-white">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {filteredChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onChannelSelect(channel.id)}
                className={`w-full flex items-center px-2 py-1.5 rounded text-sm transition-colors ${
                  currentChannel === channel.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Hash className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{channel.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Direct Messages */}
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide">
              Wiadomości
            </h3>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-400 hover:text-white">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-1">
            <button className="w-full flex items-center px-2 py-1.5 rounded text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <div className="relative mr-2">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs bg-green-600">JK</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 rounded-full border border-slate-900"></div>
              </div>
              <span className="truncate">Jan Kowalski</span>
              <Badge variant="secondary" className="ml-auto text-xs bg-red-600 text-white">2</Badge>
            </button>
            
            <button className="w-full flex items-center px-2 py-1.5 rounded text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <div className="relative mr-2">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs bg-blue-600">AN</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-yellow-500 rounded-full border border-slate-900"></div>
              </div>
              <span className="truncate">Anna Nowak</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-blue-600 text-white">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.displayName || user?.email || 'Użytkownik'}
            </p>
            <p className="text-xs text-slate-400">Online</p>
          </div>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}