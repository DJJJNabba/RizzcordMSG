// netlify/functions/postRoomMessage.js
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    }),
    databaseURL: 'https://rizzcord-8e858.firebaseio.com'  // Replace with your actual database URL
  });
}

const db = admin.database();

exports.handler = async (event, context) => {
  try {
    console.log('postRoomMessage function triggered');

    const roomCode = event.path.split('/').pop();
    console.log(`Room code: ${roomCode}`);

    const { username, color, message } = JSON.parse(event.body);
    console.log(`Message received from ${username}: ${message} with color ${color}`);

    const ref = db.ref(`rooms/${roomCode}`);
    const newMessageRef = ref.push();
    await newMessageRef.set({ username, color, message });

    console.log(`Updated messages for room: ${roomCode}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message received!" }),
    };
  } catch (error) {
    console.error('Error posting message:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to post message' }),
    };
  }
};
