import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { ChatArea } from '@/components/chat/ChatArea'
import { blink } from '@/blink/client'
import type { User, Channel } from '@/types'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [currentChannel, setCurrentChannel] = useState<string>('general')
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setIsLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const loadChannel = async (channelId: string) => {
    if (!channelId) return
    
    try {
      const channels = await blink.db.channels.list({
        where: { id: channelId }
      })
      if (channels.length > 0 && channels[0].id) {
        setSelectedChannel(channels[0])
      } else {
        console.warn(`Channel with id ${channelId} not found`)
        setSelectedChannel(null)
      }
    } catch (error) {
      console.error('Error loading channel:', error)
      setSelectedChannel(null)
    }
  }

  useEffect(() => {
    if (currentChannel) {
      loadChannel(currentChannel)
    }
  }, [currentChannel])

  const handleChannelSelect = (channelId: string) => {
    setCurrentChannel(channelId)
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie komunikatora...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Firmowy Komunikator Wewnętrzny
          </h1>
          <p className="text-gray-600 mb-6">
            Zaloguj się, aby rozpocząć komunikację z zespołem
          </p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Zaloguj się
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar
        currentChannel={currentChannel}
        onChannelSelect={handleChannelSelect}
        user={user}
      />
      <ChatArea
        channel={selectedChannel}
        user={user}
      />
    </div>
  )
}

export default App