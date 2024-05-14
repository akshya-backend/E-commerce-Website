const express=require('express');
const { updateProfile, changePic, profile, createInvoice } = require('../controller/userController');
const { upload } = require('../confiq/multerConfiq');
const router=express.Router()


// routes
router.get("/profile",profile);
router.put("/updateProfile",updateProfile);
router.post("/updateProfilePic",upload.single('file'),changePic)
router.post("/invoice",createInvoice);

module.exports = router;
