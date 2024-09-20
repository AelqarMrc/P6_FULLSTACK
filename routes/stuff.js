const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.js');
const stuffCTRL = require('../controllers/stuff.js')

router.get('/', auth, stuffCTRL.getAllBook);
router.post('/', auth, stuffCTRL.createBook);
router.get('/:id', auth, stuffCTRL.getOneBook)
router.put('/:id', auth, stuffCTRL.modifyBook);
router.delete('/:id', auth, stuffCTRL.deleteBook);

module.exports = router;