const express = require("express");
const router = express.Router();
const saucesCtrl = require("../controller/sauces");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

//Diriger les routes selon les verbes HTTP
router.get("/", auth, saucesCtrl.getAllSauce);
router.get("/:id", auth, saucesCtrl.getOneSauce);
router.post("/", auth, multer, saucesCtrl.createSauce);
router.put("/:id", auth, multer, saucesCtrl.modifySauce);
router.delete("/:id", auth, saucesCtrl.deleteSauce);
router.post("/:id/like", auth, saucesCtrl.choiceSauce);
module.exports = router;
