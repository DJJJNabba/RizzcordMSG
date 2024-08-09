exports.handler = async (event, context) => {
    const roomCode = event.path.split('/').pop();
    if (!rooms[roomCode]) {
      rooms[roomCode] = [];
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ messages: rooms[roomCode] }),
    };
  };
  