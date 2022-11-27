const Sauce = require("../models/Sauce");
const fs = require("fs");

/**
 * Exporter toutes la listes des sauces
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => res.status(400).json({ error }));
};
/**
 * Exporter une page sauce via l'ID de la sauce selectionner
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};
/**
 * Créer une sauce sur le formulaire
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);

  delete sauceObject._id;

  const sauce = new Sauce({
    ...sauceObject,
    likes: 0,
    dislikes: 0,
    // Crée l'URL d'une 'image
    //Exemeple: http://localhost:3000/images/nom
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  // Ajouter la sauce dans la base de donnée via la fonction save()
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
    .catch((error) => res.status(400).json({ error }));
};

/**
 * Modifier la sauce selectionnée
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
    .catch((error) => res.status(400).json({ error }));
};

/**
 * Supprimer la sauce selectionner
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Obtenir le nom du fichier
      const filename = sauce.imageUrl.split("/images/")[1];

      // Supprimer le fichier précis via l'id
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

/**
 * Liker ou Disliker la sauce selectionnée
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.choiceSauce = (req, res, next) => {
  // Liker la sauce selon l'utilisateur
  if (req.body.like === 1) {
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $inc: { likes: req.body.like++ },
        $push: { usersLiked: req.body.userId },
      }
    )
      .then((sauce) =>
        res.status(200).json({ message: "Like a été ajouter !" })
      )
      .catch((error) => res.status(400).json({ error }));
  } else if (req.body.like === -1) {
    console.log(req.body);
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $inc: { dislikes: req.body.like++ * -1 },
        $push: { usersDisliked: req.body.userId },
      }
    )
      .then((sauce) =>
        res.status(200).json({ message: "Dislike a été ajouter !" })
      )
      .catch((error) => res.status(400).json({ error }));
  } else {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        if (sauce.usersLiked.includes(req.body.userId)) {
          Sauce.updateOne(
            { _id: req.params.id },
            { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } }
          )
            .then(() => {
              res.status(200).json({ message: "Like a été supprimer !" });
            })
            .catch((error) => res.status(400).json({ error }));
        } else if (sauce.usersDisliked.includes(req.body.userId)) {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $pull: { usersDisliked: req.body.userId },
              $inc: { dislikes: -1 },
            }
          )
            .then(() => {
              res.status(200).json({ message: "Dislike a été supprimer !" });
            })
            .catch((error) => res.status(400).json({ error }));
        }
      })
      .catch((error) => res.status(400).json({ error }));
  }
};
