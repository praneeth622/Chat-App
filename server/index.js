import { WebSocket, WebSocketServer } from 'ws';
import { createServer } from 'http';

const server = createServer();
const wss = new WebSocketServer({ server });

const clients = new Map();

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'join':
          clients.set(ws, { username: data.username });
          
          broadcastMessage({
            type: 'system',
            content: `${data.username} joined the chat`,
            timestamp: new Date().toISOString(),
          });
          
          broadcastUserList();
          break;
          
        case 'message':
          const client = clients.get(ws);
          if (client) {
            broadcastMessage({
              type: 'message',
              content: data.content,
              username: client.username,
              timestamp: new Date().toISOString(),
            });
          }
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    const client = clients.get(ws);
    if (client) {
      broadcastMessage({
        type: 'system',
        content: `${client.username} left the chat`,
        timestamp: new Date().toISOString(),
      });
      
      clients.delete(ws);
      
      broadcastUserList();
    }
  });
});

// Function to broadcast messages to all connected clients
function broadcastMessage(message) {
  const messageStr = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

// Function to broadcast the list of online users
function broadcastUserList() {
  const users = Array.from(clients.values()).map((client) => ({
    username: client.username,
  }));

  const userListMessage = {
    type: 'userList',
    users: users,
  };

  broadcastMessage(userListMessage);
}

server.listen(8080, () => {
  console.log('WebSocket server is running on port 8080');
});
