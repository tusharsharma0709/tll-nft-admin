var express = require('express');
var mint = require("../controllers/mintController");

const router = express.Router();

//add mint
router.post('/create-mint',mint.AddMint);
//get mint
router.get('/get-mint/:id', mint.GetMint);


module.exports = router
