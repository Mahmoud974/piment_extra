const express = require("express");
const router = express.Router();
const userCtrl = require("../controller/user");

//Diriger les routes d'authentification avec la methode POST
router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);

module.exports = router;
