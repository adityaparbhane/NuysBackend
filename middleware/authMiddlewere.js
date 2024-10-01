


const jwt = require('jsonwebtoken');
const secretKey = 'your-secret-key'; 

const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const tokenString = token.split(" ")[1];
    const decoded = await jwt.verify(tokenString, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Failed to authenticate token' });
  }
};

module.exports = verifyToken;

