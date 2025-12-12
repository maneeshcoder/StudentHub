import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Conversation {
  user_id: string;
  full_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export default function Messages() {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
      const interval = setInterval(loadConversations, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      const interval = setInterval(() => loadMessages(selectedConversation), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles!sender_id(full_name)')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const conversationMap = new Map<string, any>();
      data?.forEach((msg: any) => {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            user_id: otherUserId,
            last_message: msg.content,
            last_message_at: msg.created_at,
            unread_count: msg.receiver_id === user.id && !msg.read ? 1 : 0,
          });
        }
      });

      const conversations = Array.from(conversationMap.values());
      setConversations(conversations);
      setLoading(false);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setLoading(false);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      await supabase
        .from('messages')
        .update({ read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', otherUserId);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadOtherProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setSelectedProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSelectConversation = (userId: string) => {
    setSelectedConversation(userId);
    loadOtherProfile(userId);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user?.id,
        receiver_id: selectedConversation,
        content: newMessage,
      });

      if (error) throw error;
      setNewMessage('');
      loadMessages(selectedConversation);
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[600px] flex gap-6">
      <div className="w-80 bg-white rounded-lg shadow-md p-4 flex flex-col">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Messages</h2>
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <p className="text-gray-500">Loading conversations...</p>
          ) : conversations.length === 0 ? (
            <p className="text-gray-500 text-sm">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.user_id}
                onClick={() => handleSelectConversation(conv.user_id)}
                className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                  selectedConversation === conv.user_id
                    ? 'bg-blue-100'
                    : 'hover:bg-gray-100'
                }`}
              >
                <p className="font-semibold text-gray-800">{conv.full_name}</p>
                <p className="text-sm text-gray-600 truncate">{conv.last_message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(conv.last_message_at).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col">
        {selectedConversation && selectedProfile ? (
          <>
            <div className="border-b p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{selectedProfile.full_name}</h3>
                <p className="text-sm text-gray-600">{selectedProfile.college_name}</p>
              </div>
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender_id === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="border-t p-4 flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={sending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
