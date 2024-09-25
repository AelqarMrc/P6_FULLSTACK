const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.js');
const multer = require('../middleware/multer-config');

const stuffCTRL = require('../controllers/stuff.js')

router.get('/', stuffCTRL.getAllBook);
router.post('/', auth, multer, stuffCTRL.createBook);
router.get('/:id', stuffCTRL.getOneBook)
router.put('/:id', auth, multer, stuffCTRL.modifyBook);
router.delete('/:id', auth, stuffCTRL.deleteBook);

module.exports = router;