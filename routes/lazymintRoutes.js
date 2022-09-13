var express = require('express');
var lazyMint = require("../controllers/lazymintControllers");

const router = express.Router();

//add lazy mint
router.post('/create-lazy-mint', lazyMint.AddLazyMint);
//get lazy mint
router.get('/get-lazy-mint/:id', lazyMint.GetLazyMint);

module.exports = router;