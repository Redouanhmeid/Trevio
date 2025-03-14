const jwt = require('jsonwebtoken');
const { User } = require('../models');

const requireAuth = async (req, res, next) => {
 // Verify authentication
 const { authorization } = req.headers;

 if (!authorization) {
  return res.status(401).json({ error: 'Authorization token required' });
 }

 try {
  const token = authorization.split(' ')[1];

  // Verify token
  const decodedToken = jwt.verify(token, process.env.SECRET);

  // Find user
  const user = await User.findByPk(decodedToken.id);

  if (!user) {
   throw Error('User not found');
  }

  req.user = user;
  next();
 } catch (error) {
  res.status(401).json({ error: 'Request is not authorized' });
 }
};

module.exports = requireAuth;
