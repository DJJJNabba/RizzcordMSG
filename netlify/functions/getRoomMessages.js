// netlify/functions/getRoomMessages.js
exports.handler = async (event, context) => {
  const roomCode = event.path.split('/').pop();
  let rooms = {};  // Replace this with a persistent storage solution in a real-world scenario
  if (!rooms[roomCode]) {
    rooms[roomCode] = [];
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ messages: rooms[roomCode] }),
  };
};
