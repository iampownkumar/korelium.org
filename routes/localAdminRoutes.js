//adding routes to the localadmincontroller 
const express = require('express');
const router=express.Router();
const localadmincontroller=require('../controllers/localAdminController');
const authenticateToken=require('../middleware/authMiddleware');

router.post('/',authenticateToken,localadmincontroller.createLocalAdmin);
module.exports=router;
