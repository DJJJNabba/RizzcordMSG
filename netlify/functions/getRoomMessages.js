// netlify/functions/getRoomMessages.js
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
    const roomCode = event.path.split('/').pop();
    const ref = db.ref(`rooms/${roomCode}`);
    const snapshot = await ref.once('value');
    const messages = snapshot.val() || [];

    return {
      statusCode: 200,
      body: JSON.stringify({ messages }),
    };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch messages' }),
    };
  }
};
