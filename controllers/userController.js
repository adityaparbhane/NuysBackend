

const db = require('../models/db');

const createItem = async (username, email, user_password, role, callback) => {
  const sql = 'INSERT INTO user (username, email, user_password, role) VALUES (?, ?, ?, ?)';
  try {
    const result = await db.queryAsync(sql, [username, email, user_password, role]);
    callback(null, result); 
  } catch (error) {
    callback(error, null);
  }
};

module.exports = {
  createItem,
};
