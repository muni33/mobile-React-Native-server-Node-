const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const onlineUsers = new Map(); // userId -> socketId

function getUserIdFromToken(token){
  try { return jwt.verify(token, process.env.JWT_SECRET || 'verysecretkey123').id; }
  catch(e){ return null; }
}

function initSockets(io){
  io.use((socket, next)=>{
    const token = socket.handshake.auth?.token;
    const userId = getUserIdFromToken(token);
    if (!userId) return next(new Error('unauthorized'));
    socket.userId = userId;
    next();
  });

  io.on('connection', async (socket)=>{
    const uid = socket.userId;
    onlineUsers.set(uid.toString(), socket.id);
    await User.findByIdAndUpdate(uid, { online: true });

    // broadcast online status
    io.emit('user:online', { userId: uid });

    // handle sending messages
    socket.on('message:send', async ({ conversationId, toUserId, text })=>{
      try {
        let conv = null;
        if (conversationId) conv = await Conversation.findById(conversationId);
        else {
          conv = await Conversation.findOne({ participants: { $all: [uid, toUserId] } });
          if (!conv) conv = await Conversation.create({ participants: [uid, toUserId] });
        }
        const message = await Message.create({
          conversation: conv._id,
          sender: uid,
          text,
        });
        conv.lastMessage = message._id;
        conv.updatedAt = new Date();
        await conv.save();

        const payload = { 
          _id: message._id, conversation: conv._id, sender: uid, text: message.text, createdAt: message.createdAt, readBy: message.readBy || []
        };
        socket.emit('message:new', payload);
        const toSocket = onlineUsers.get(toUserId.toString());
        if (toSocket) io.to(toSocket).emit('message:new', payload);
      } catch(err) {
        console.error('message send error', err);
      }
    });

    socket.on('typing:start', ({ conversationId, toUserId })=>{
      const toSocket = onlineUsers.get(toUserId.toString());
      if (toSocket) io.to(toSocket).emit('typing:start', { conversationId, from: uid });
    });

    socket.on('typing:stop', ({ conversationId, toUserId })=>{
      const toSocket = onlineUsers.get(toUserId.toString());
      if (toSocket) io.to(toSocket).emit('typing:stop', { conversationId, from: uid });
    });

    socket.on('message:read', async ({ messageId })=>{
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;
        if (!msg.readBy.includes(uid)) {
          msg.readBy.push(uid);
          await msg.save();
        }
        const conv = await Conversation.findById(msg.conversation);
        conv.participants.forEach(p=>{
          const s = onlineUsers.get(p.toString());
          if (s) io.to(s).emit('message:read', { messageId, by: uid });
        });
      } catch(err) {
        console.error('read error', err);
      }
    });

    socket.on('disconnect', async ()=>{
      onlineUsers.delete(uid.toString());
      await User.findByIdAndUpdate(uid, { online: false, lastSeen: new Date() });
      io.emit('user:offline', { userId: uid, lastSeen: new Date() });
    });
  });
}

module.exports = { initSockets };
