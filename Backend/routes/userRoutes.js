const express = require('express');
const router = express.Router();

// FIX 1: Changed 'userControl' to 'userController' to match your filename
// FIX 2: Used { } to pull out the specific functions we need
const { createUser, loginUser } = require('../controllers/userController'); 

// Register Route
router.post('/users', createUser);

// Login Route
router.post('/login', loginUser);

module.exports = router;