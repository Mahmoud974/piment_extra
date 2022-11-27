const multer = require("multer");

/**
 * Déclarer les formats d'image sur un objet
 */
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
/**
 * Stocker les images dans le dossier
 */
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(".")[0].split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});
/**
 * Choisir l'image selectionner envoyerr une requete
 * @param {*} req
 * @param {*} file
 * @param {*} callback
 */
const fileFilter = (req, file, callback) => {
  const extension = MIME_TYPES[file.mimetype];
  if (extension === "jpg" || extension === "png" || extension === "webp") {
    callback(null, true);
  } else {
    callback("Mauvais format", false);
  }
};

module.exports = multer({
  storage,
  limits: { fileSize: 104857600 },
  fileFilter,
}).single("image");
