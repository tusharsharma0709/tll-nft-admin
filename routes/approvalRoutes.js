var express = require('express');
var approval = require("../controllers/approvalControllers");

const router = express.Router();

//add approval request
router.post('/create-app-request', approval.AddApproval);
//get particular approval requests
router.get('/get-app-request/:id', approval.GetApproval);
//get all approval request
router.get('/get-list', approval.getList);
//update status
router.get('/update-status/:id', approval.UpdateStatus);

module.exports = router;