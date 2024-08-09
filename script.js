document.addEventListener('DOMContentLoaded', (event) => {
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPopup = document.getElementById('settingsPopup');
  const saveSettings = document.getElementById('saveSettings');
  const closeSettings = document.getElementById('closeSettings');
  const usernameInput = document.getElementById('username');
  const nameColorInput = document.getElementById('nameColor');
  const chatLink = document.querySelector('nav a[href="/index.html"]');

  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      settingsPopup.style.display = 'block';
    });
  }

  if (closeSettings) {
    closeSettings.addEventListener('click', () => {
      settingsPopup.style.display = 'none';
    });
  }

  if (saveSettings) {
    saveSettings.addEventListener('click', () => {
      currentUsername = usernameInput.value || 'Anonymous'; // Default to 'Anonymous' if empty
      currentNameColor = nameColorInput.value || '#FFFFFF'; // Default to white if empty

      // Save settings to local storage
      localStorage.setItem('username', currentUsername);
      localStorage.setItem('color', currentNameColor);

      settingsPopup.style.display = 'none';
    });
  }

  // Redirect new users or open recent room for returning users
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    const recentRoomCode = localStorage.getItem('recentRoomCode');
    if (recentRoomCode) {
      window.location.href = `/rooms/${recentRoomCode}`;
    } else {
      window.location.href = '/rooms.html';
    }
  }

  if (chatLink) {
    chatLink.addEventListener('click', (event) => {
      event.preventDefault();
      const recentRoomCode = localStorage.getItem('recentRoomCode');
      if (recentRoomCode) {
        window.location.href = `/rooms/${recentRoomCode}`;
      } else {
        window.location.href = '/rooms.html';
      }
    });
  }

  loadSettings();
  setRoomCode();
  fetchData();
  setInterval(fetchData, 2000); // Fetch data every 2 seconds

  const messageInput = document.getElementById('messageInput');
  if (messageInput) {
    messageInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        sendData();
      }
    });

    messageInput.addEventListener('input', function(event) {
      checkForEmojiInput(event.target);
    });
  }

  displayRecentRooms();
  initializeEmojiPicker();
});

let currentUsername = 'Anonymous';
let currentNameColor = '#FFFFFF'; // Default to white
let roomCode = '';

// Load settings from local storage
function loadSettings() {
  const savedUsername = localStorage.getItem('username');
  const savedColor = localStorage.getItem('color');
  if (savedUsername) {
    currentUsername = savedUsername;
    document.getElementById('username').value = savedUsername;
  }
  if (savedColor) {
    currentNameColor = savedColor;
    document.getElementById('nameColor').value = savedColor;
  }
}

// Set room code from URL and save it to local storage
function setRoomCode() {
  const pathSegments = window.location.pathname.split('/');
  if (pathSegments.length > 2 && pathSegments[1] === 'rooms') {
    roomCode = pathSegments[2];
    saveRecentRoom(roomCode);
    localStorage.setItem('recentRoomCode', roomCode);
  } else {
    roomCode = ''; // Default or handle case when no room code is present
  }
}

// Save the room code to recent rooms in local storage
function saveRecentRoom(roomCode) {
  let recentRooms = JSON.parse(localStorage.getItem('recentRooms')) || [];
  recentRooms = recentRooms.filter(code => code !== roomCode); // Remove if it already exists
  recentRooms.unshift(roomCode); // Add to the beginning
  if (recentRooms.length > 5) recentRooms.pop(); // Keep only the last 5 rooms
  localStorage.setItem('recentRooms', JSON.stringify(recentRooms));
}

// Display the recent rooms
function displayRecentRooms() {
  const recentRooms = JSON.parse(localStorage.getItem('recentRooms')) || [];
  const recentRoomsContainer = document.getElementById('recentRooms');
  if (recentRoomsContainer) {
    recentRoomsContainer.innerHTML = '';
    recentRooms.forEach(roomCode => {
      const roomLink = document.createElement('a');
      roomLink.href = `/rooms/${roomCode}`;
      roomLink.textContent = roomCode;
      roomLink.className = 'recent-room';
      recentRoomsContainer.appendChild(roomLink);
    });
  }
}

// Send message to the server
async function sendData() {
  const message = document.getElementById('messageInput').value;
  if (message.trim() !== '') {
    try {
      const response = await fetch(`/.netlify/functions/postRoomMessage/${roomCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: currentUsername, color: currentNameColor, message }),
      });
      const result = await response.json();
      console.log(result.message);
      fetchData();
      document.getElementById('messageInput').value = ''; // Clear input after sending
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
}

// Fetch messages from the server
async function fetchData() {
  try {
    const response = await fetch(`/.netlify/functions/getRoomMessages/${roomCode}`);
    const data = await response.json();
    const display = document.getElementById('messageDisplay');
    if (display) {
      display.innerHTML = ''; // Clear display before updating
      let lastUsername = null;
      data.messages.forEach((msg, index) => {
        const newMessage = document.createElement('div');
        newMessage.className = 'message';
        if (msg.username !== lastUsername) {
          if (index > 0) {
            const gap = document.createElement('div');
            gap.style.marginTop = '20px';
            display.appendChild(gap);
          }
          const usernameSpan = document.createElement('span');
          usernameSpan.textContent = msg.username;
          usernameSpan.style.color = msg.color;
          newMessage.appendChild(usernameSpan);
          lastUsername = msg.username;
        }
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = parseMarkup(msg.message);
        newMessage.appendChild(messageContent);
        display.appendChild(newMessage);
      });
      twemoji.parse(display); // Render emojis
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
}

// Join room by navigating to the room URL
function joinRoom() {
  const roomCode = document.getElementById('roomCodeInput').value.trim();
  if (roomCode !== '') {
    window.location.href = `/rooms/${roomCode}`;
  } else {
    alert('Please enter a room code.');
  }
}

// Create a new room with a generated room code
function createRoom() {
  const roomCode = generateRoomCode();
  window.location.href = `/rooms/${roomCode}`;
}

// Generate a random room code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8);
}

// Parse markup for formatting and emojis
function parseMarkup(text) {
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic
  text = text.replace(/\*(.*?)\*\*/g, '<em>$1</em>');
  text = text.replace(/_(.*?)_/g, '<em>$1</em>');

  // Strikethrough
  text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // Headers
  text = text.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  text = text.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  text = text.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  // Unordered List
  text = text.replace(/^\* (.*?)$/gm, '<ul><li>$1</li></ul>');
  text = text.replace(/^- (.*?)$/gm, '<ul><li>$1</li></ul>');
  text = text.replace(/<\/ul>\n<ul>/g, '');

  // Ordered List
  text = text.replace(/^\d+\. (.*?)$/gm, '<ol><li>$1</li></ol>');
  text = text.replace(/<\/ol>\n<ol>/g, '');

  // Links
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

  // Images
  text = text.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;">');

  // Emojis
  text = text.replace(/:([a-zA-Z0-9_+-]+):/g, (match, p1) => {
    const emojiUrl = `https://twemoji.maxcdn.com/v/latest/svg/${twemoji.convert.toCodePoint(p1)}.svg`;
    return `<img src="${emojiUrl}" class="emoji" alt="${p1}">`;
  });

  return text;
}
