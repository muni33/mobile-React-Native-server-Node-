const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

router.get('/:id/messages', auth, async (req,res)=>{
  try {
    const { id } = req.params;
    const messages = await Message.find({ conversation: id }).sort('createdAt').lean();
    res.json(messages);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
