import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Paperclip, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { blink } from '@/blink/client'
import type { Message, Channel, User } from '@/types'

interface ChatAreaProps {
  channel: Channel | null
  user: User | null
}

export function ChatArea({ channel, user }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const loadMessages = useCallback(async () => {
    if (!channel || !channel.id) return
    
    try {
      setIsLoading(true)
      const messagesData = await blink.db.messages.list({
        where: { channel_id: channel.id },
        orderBy: { created_at: 'asc' },
        limit: 100
      })
      // Filter out any invalid messages
      const validMessages = messagesData.filter(msg => 
        msg && msg.id && msg.user_id && msg.content && msg.channel_id
      )
      setMessages(validMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
      setMessages([]) // Set empty array on error
    } finally {
      setIsLoading(false)
    }
  }, [channel])

  useEffect(() => {
    if (channel) {
      loadMessages()
    }
  }, [channel, loadMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const sendMessage = async () => {
    if (!newMessage.trim() || !channel || !user || !channel.id || !user.id) return

    try {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      
      const message = await blink.db.messages.create({
        id: messageId,
        channel_id: channel.id,
        user_id: user.id,
        content: newMessage.trim(),
        message_type: 'text'
      })

      // Only add message if it's valid
      if (message && message.id && message.user_id && message.content) {
        setMessages(prev => [...prev, message])
      }
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      // Could add user notification here
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '--:--'
    try {
      return new Date(timestamp).toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Error formatting time:', error)
      return '--:--'
    }
  }

  const getUserInitials = (userId: string) => {
    // For demo purposes, generate initials from user ID
    if (!userId || typeof userId !== 'string') {
      return 'U'
    }
    return userId.substring(0, 2).toUpperCase()
  }

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Wybierz kanał
          </h3>
          <p className="text-gray-500">
            Wybierz kanał z listy po lewej stronie, aby rozpocząć rozmowę
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
              <span className="text-blue-600 font-semibold text-sm">#</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {channel.name}
              </h2>
              {channel.description && (
                <p className="text-sm text-gray-500">{channel.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6">
        <div className="py-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Brak wiadomości w tym kanale. Napisz pierwszą!
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              // Add safety checks for message data
              if (!message || !message.id || !message.user_id || !message.content) {
                return null
              }
              
              const isCurrentUser = message.user_id === user?.id
              const showAvatar = index === 0 || messages[index - 1]?.user_id !== message.user_id
              
              return (
                <div key={message.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {showAvatar ? (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-600 text-white text-sm">
                          {getUserInitials(message.user_id)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8 h-8"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {showAvatar && (
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {message.user_id === user?.id ? 'Ty' : `Użytkownik ${getUserInitials(message.user_id)}`}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                    )}
                    
                    <div className={`inline-block px-4 py-2 rounded-lg max-w-xs lg:max-w-md ${
                      isCurrentUser
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              )
            }).filter(Boolean)
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <Button size="sm" variant="ghost" className="text-gray-500 hover:text-gray-700">
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              placeholder={`Napisz wiadomość do #${channel.name}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-12"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}