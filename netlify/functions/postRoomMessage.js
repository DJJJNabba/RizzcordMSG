// netlify/functions/postRoomMessage.js
exports.handler = async (event, context) => {
  console.log('postRoomMessage function triggered');

  const roomCode = event.path.split('/').pop();
  console.log(`Room code: ${roomCode}`);

  const { username, color, message } = JSON.parse(event.body);
  console.log(`Message received from ${username}: ${message} with color ${color}`);

  let rooms = {
    testRoomCode: [
      { username: 'User1', color: '#ff0000', message: 'Hello World!' }
    ]
  };

  if (!rooms[roomCode]) {
    rooms[roomCode] = [];
  }

  rooms[roomCode].push({ username, color, message });
  console.log(`Updated messages for room: ${roomCode}`, rooms[roomCode]);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Message received!" }),
  };
};
