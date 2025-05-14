document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const chatMessages = document.getElementById('chat-messages');
    const usersList = document.getElementById('users-list');
    const usernameInput = document.getElementById('username-input');
    const changeUsernameBtn = document.getElementById('change-username');

    let userId;
    let username; const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}`;
    const socket = new WebSocket(wsUrl);

    socket.addEventListener('open', (event) => {
        console.log('Connected to the WebSocket server');
    });
    
    socket.addEventListener('message', (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('Received message:', data);

            handleMessage(data);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });
    
    socket.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
        outputSystemMessage('Connection error. Please try refreshing the page.');
    });
    
    socket.addEventListener('close', (event) => {
        console.log('Disconnected from the WebSocket server');
        outputSystemMessage('Disconnected from server. Please refresh the page to reconnect.');
    });
    
    function handleMessage(data) {
        switch (data.type) {
            case 'connection':
                userId = data.userId;
                username = data.username;
                outputSystemMessage(data.message);
                updateUsersList(data.users);
                break;

            case 'message':
                outputMessage(data);
                break;

            case 'user-joined':
                outputSystemMessage(data.message);
                addUser(data);
                break;

            case 'user-left':
                outputSystemMessage(data.message);
                removeUser(data.userId);
                break;

            case 'username-changed':
                outputSystemMessage(data.message);
                updateUsername(data.userId, data.newUsername);
                break;
        }        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const msg = e.target.elements.msg.value.trim();

        if (!msg) return;

        sendMessage(msg);

        e.target.elements.msg.value = '';
        e.target.elements.msg.focus();
    }); 
    
    changeUsernameBtn.addEventListener('click', () => {
        const newUsername = usernameInput.value.trim();

        if (newUsername && newUsername !== username) {
            socket.send(JSON.stringify({
                type: 'username-change',
                username: newUsername
            }));

            usernameInput.value = '';
        }
    });
    
    function outputMessage(message) {
        const div = document.createElement('div');
        div.classList.add('message');

        if (message.userId === userId) {
            div.classList.add('current-user');
        } else {
            div.classList.add('other-user');
        }

        div.innerHTML = `
            <div class="meta">
                <span>${message.username}</span>
                <span>${new Date().toLocaleTimeString()}</span>
            </div>
            <p class="text">${escapeHTML(message.message)}</p>
        `;

        chatMessages.appendChild(div);
    }

    function outputSystemMessage(message) {
        const div = document.createElement('div');
        div.classList.add('system-message');
        div.textContent = message;
        chatMessages.appendChild(div);
    }
    
    function sendMessage(message) {
        socket.send(JSON.stringify({
            type: 'message',
            message: message
        }));
    }

    function updateUsersList(users) {
        usersList.innerHTML = '';
        users.forEach(user => {
            const li = document.createElement('li');
            li.id = `user-${user.id}`;
            li.textContent = user.username;
            if (user.id === userId) {
                li.textContent += ' (you)';
                li.style.fontWeight = 'bold';
            }
            usersList.appendChild(li);
        });
    }

    function addUser(user) {
        const li = document.createElement('li');
        li.id = `user-${user.userId}`;
        li.textContent = user.username;
        usersList.appendChild(li);
    }

    function removeUser(id) {
        const userElement = document.getElementById(`user-${id}`);
        if (userElement) {
            userElement.remove();
        }
    }

    function updateUsername(id, newUsername) {
        const userElement = document.getElementById(`user-${id}`);
        if (userElement) {
            userElement.textContent = newUsername;
            if (id === userId) {
                userElement.textContent += ' (you)';
                userElement.style.fontWeight = 'bold';
                username = newUsername;
            }
        }
    } 
    
    function escapeHTML(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
