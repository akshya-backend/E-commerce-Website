const express = require("express");
const { getLogin, getSignup, newRegistration, logout, postLogin, forgetPassword, sendLink, getResetPassword, postResetPassword } = require("../controller/authController");
const router = express.Router();

router.get("/login", getLogin)
router.get("/signup", getSignup)
router.post("/newRegistration",newRegistration)
router.get("/logOut", logout)
router.post("/postlogin", postLogin)
router.get("/forgetPassword",forgetPassword)
router.post("/sendLink", sendLink)
router.get("/getReset/:id/:token",getResetPassword)
router.post("/getReset/:id/:token",postResetPassword)


module.exports = router;
