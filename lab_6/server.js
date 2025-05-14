const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, 'public')));

const wss = new WebSocket.Server({ server });

const users = new Map();
let userIdCounter = 1;

wss.on('connection', (ws) => {
    const userId = userIdCounter++;
    let username = `User${userId}`;
    users.set(ws, { id: userId, username });

    ws.send(JSON.stringify({
        type: 'connection',
        userId: userId,
        username: username,
        message: 'Welcome to the chat!',
        users: Array.from(users.values()).map(u => ({ id: u.id, username: u.username }))
    }));

    broadcastMessage({
        type: 'user-joined',
        userId: userId,
        username: username,
        message: `${username} has joined the chat`
    }, ws);

    ws.on('message', (messageData) => {
        try {
            const data = JSON.parse(messageData);
            
            if (data.type === 'message') {
                broadcastMessage({
                    type: 'message',
                    userId: userId,
                    username: username,
                    message: data.message
                });
            }
            else if (data.type === 'username-change') {
                const oldUsername = username;
                username = data.username;
                users.get(ws).username = username;
                
                broadcastMessage({
                    type: 'username-changed',
                    userId: userId,
                    oldUsername: oldUsername,
                    newUsername: username,
                    message: `${oldUsername} changed their name to ${username}`
                });
            }
        } catch (e) {
            console.error('Invalid message format:', e);
        }
    });    
    
    ws.on('close', () => {
        const userData = users.get(ws);
        users.delete(ws);
        
        broadcastMessage({
            type: 'user-left',
            userId: userId,
            username: userData.username,
            message: `${userData.username} has left the chat`
        });
    });
});

function broadcastMessage(message, excludeWs = null) {
    const messageStr = JSON.stringify(message);
    
    wss.clients.forEach((client) => {
        if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
