const express = require('express');
const router = express.Router();
const { sendReport } = require('../controllers/reportController');

router.post('/email', sendReport);

module.exports = router;