require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { initSockets } = require('./utils/socketHandlers');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const convRoutes = require('./routes/conversations');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/conversations', convRoutes);

const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: { origin: '*' }
});

initSockets(io);

const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chatapp', { useNewUrlParser:true, useUnifiedTopology:true })
  .then(()=> server.listen(PORT, ()=> console.log('Server listening', PORT)))
  .catch(err => console.error(err));
