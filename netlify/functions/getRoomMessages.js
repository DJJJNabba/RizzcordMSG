// netlify/functions/getRoomMessages.js
exports.handler = async (event, context) => {
  console.log('getRoomMessages function triggered');
  
  const roomCode = event.path.split('/').pop();
  console.log(`Room code received: ${roomCode}`);

  // Mock data for testing
  let rooms = {
    testRoomCode: [
      { username: 'User1', color: '#ff0000', message: 'Hello World!' },
      { username: 'User2', color: '#00ff00', message: 'How are you?' }
    ]
  };

  if (!rooms[roomCode]) {
    console.log(`No messages found for room: ${roomCode}`);
    rooms[roomCode] = [];  // Initialize if not existing
  } else {
    console.log(`Messages found for room: ${roomCode}`);
  }

  console.log(`Returning messages: ${JSON.stringify(rooms[roomCode])}`);
  return {
    statusCode: 200,
    body: JSON.stringify({ messages: rooms[roomCode] }),
  };
};
