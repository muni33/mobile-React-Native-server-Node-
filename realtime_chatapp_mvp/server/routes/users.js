const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

router.get('/', auth, async (req,res)=>{
  try {
    const users = await User.find({ _id: {$ne: req.user._id}}).lean();
    const results = await Promise.all(users.map(async u=>{
      const conv = await Conversation.findOne({ participants: { $all: [req.user._id, u._id] } }).populate('lastMessage').lean();
      return {
        ...u,
        lastMessage: conv?.lastMessage ? { text: conv.lastMessage.text, createdAt: conv.lastMessage.createdAt, readBy: conv.lastMessage.readBy } : null,
        conversationId: conv?._id ?? null
      };
    }));
    res.json(results);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
