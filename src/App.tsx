import React, { useState, useEffect, useRef } from 'react';
import { Send, UserCircle2, Users, MessageSquare ,Zap} from 'lucide-react';

type Message = {
  type: 'message' | 'system';
  content: string;
  username?: string;
  timestamp: string;
};

type OnlineUser = {
  username: string;
};

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
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
      const data = JSON.parse(event.data);
      if (data.type === 'userList') {
        setOnlineUsers(data.users);
      } else {
        setMessages((prev) => [...prev, data]);
        if (data.type === 'system') {
          console.log(data.message);
        }
      }
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-8">
          <MessageSquare className="w-12 h-12 text-blue-500" />
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your username"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Join Chat
          </button>
        </form>
      </div>
    </div>
      );

  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Online Users ({onlineUsers.length})
          </h2>
        </div>
        <ul className="p-2">
          {onlineUsers.map((user, index) => (
            <li key={index} className="py-2 px-4 hover:bg-gray-100 rounded-md">
              <div className="flex items-center space-x-2">
                <UserCircle2 className="w-5 h-5 text-gray-500" />
                <span>{user.username}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-blue-500" />
            Chat Room
          </h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.type === 'system' ? 'justify-center' : 'items-start space-x-3'}`}>
              {msg.type !== 'system' && (
                <UserCircle2 className="w-8 h-8 text-gray-400 flex-shrink-0" />
              )}
              <div className={`${
                msg.type === 'system' 
                  ? 'bg-gray-200 text-gray-600 px-4 py-2 rounded-full text-sm'
                  : 'flex-1 bg-white p-3 rounded-lg shadow-sm'
              }`}>
                {msg.type !== 'system' && (
                  <div className="flex items-baseline space-x-2">
                    <span className="font-semibold text-blue-600">{msg.username}</span>
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
        <form onSubmit={sendMessage} className="bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type your message..."
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-200 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>
      {/* <Toaster /> */}
    </div>
  );
}

export default App;