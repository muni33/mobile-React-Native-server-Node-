const jwt = require('jsonwebtoken');
const User = require('../models/User');
module.exports = async (req,res,next)=>{
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({error:'No token'});
  const token = header.split(' ')[1];
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'verysecretkey123');
    req.user = await User.findById(payload.id);
    next();
  }catch(e){ res.status(401).json({error:'Invalid token'}); }
}
