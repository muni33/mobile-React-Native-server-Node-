const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req,res)=>{
  try {
    const { name, email, password } = req.body;
    if (!name||!email||!password) return res.status(400).json({error:'Missing fields'});
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({error:'Email exists'});
    const passwordHash = await bcrypt.hash(password,10);
    const user = await User.create({ name, email, passwordHash });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'verysecretkey123', { expiresIn:'7d' });
    res.json({ token, user: { id:user._id, name:user.name, email:user.email }});
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req,res)=>{
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error:'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error:'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'verysecretkey123', { expiresIn:'7d' });
    res.json({ token, user: { id:user._id, name:user.name, email:user.email }});
  } catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
