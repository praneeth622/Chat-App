import React, { useState, useEffect, useRef } from 'react';
import { Send, UserCircle2, Users, MessageSquare } from 'lucide-react';

type Message = {
  type: 'message' | 'system';
  content: string;
  username?: string;
  timestamp: string;
};

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connectToChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    wsRef.current = new WebSocket('ws://localhost:8080');

    wsRef.current.onopen = () => {
      setIsConnected(true);
      wsRef.current?.send(JSON.stringify({
        type: 'join',
        username: username
      }));
    };

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
    };
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !wsRef.current) return;

    wsRef.current.send(JSON.stringify({
      type: 'message',
      content: message
    }));

    setMessage('');
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-8">
            <MessageSquare className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">Join the Chat</h1>
          <form onSubmit={connectToChat} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your username"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-6 h-6" />
              <h1 className="text-xl font-semibold">Chat Room</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>{userCount} online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[calc(100vh-16rem)] overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.type === 'system' ? 'justify-center' : 'items-start space-x-3'}`}>
                {msg.type !== 'system' && (
                  <UserCircle2 className="w-8 h-8 text-gray-400 flex-shrink-0" />
                )}
                <div className={`${
                  msg.type === 'system' 
                    ? 'bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm'
                    : 'flex-1'
                }`}>
                  {msg.type !== 'system' && (
                    <div className="flex items-baseline space-x-2">
                      <span className="font-semibold text-indigo-600">{msg.username}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  <p className={msg.type === 'system' ? '' : 'mt-1 text-gray-800'}>
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="p-4 border-t">
            <div className="flex space-x-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Type your message..."
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200 flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;