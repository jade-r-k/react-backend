const express = require('express');
const router = express.Router();

const { 
    register, 
    login
  } = require('../controllers/user_controller');

router
    .post('/register', register)
    .post('/login', login)

module.exports = router;