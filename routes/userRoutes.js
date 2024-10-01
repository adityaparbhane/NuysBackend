const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');


router.post('/newAdmin', (req, res) => {
  const { username, email, user_password } = req.body;

  console.log(req.body);
  const role = "Admin"   

  controller.createItem(username, email, user_password, role, (err, result) => {
    if (err) {
      console.error('Error creating record:', err);
      res.status(500).json({ error: 'Error creating record' });
    } else {
      console.log(res.status);

      res.status(201).json({ message: 'user created successfully', id: result.insertId, username, role });
    }
  });
});




module.exports = router;
