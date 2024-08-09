exports.handler = async (event, context) => {
    const roomCode = event.path.split('/').pop();
    const { username, color, message } = JSON.parse(event.body);
    if (username && color && message) {
      if (!rooms[roomCode]) {
        rooms[roomCode] = [];
      }
      rooms[roomCode].push({ username, color, message });
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Message received!" }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid data" }),
      };
    }
  };
  