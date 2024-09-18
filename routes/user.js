const express = require('express');
const router = express.Router();

const userCTRL = require('../controllers/user');

router.post('signup', userCTRL.signup)
router.post('login', userCTRL.login)


module.exports = router;