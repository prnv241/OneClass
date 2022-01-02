const { PeerServer } = require('peer');
const PORT = process.env.PORT || 5002;

PeerServer({ port: PORT , path: '/peerjs' });