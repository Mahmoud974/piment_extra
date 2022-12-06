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
  Sauce.findOne({ _id: req.params.id })

    .then((sauce) => {
      // Récupèrer les informations modifiées grâce à une condition

      const sauceObject = req.file
        ? // Si le fichier image existe, on traite les strings et la nouvelle image
          {
            //Récupérer les chaines de caractères qui sont dans la requête et on parse en objet
            ...JSON.parse(req.body.sauce),
            // Modifier l'url de l'image
            imageUrl: `${req.protocol}://${req.get("host")}/images/${
              req.file.filename
            }`,
            //Traiter les autres élements du corps de la requête, lorsque celui ci n'est pas trouvé
          }
        : { ...req.body };

      // Modifier lorsque l'utilisateur correspondant

      // Envoyer un message d' erreur 403
      if (sauce.userId !== req.auth.userId) {
        res.status(403).json({ error: "Unauthorized request" });
      } else {
        // Mettre à jour la sauce dans la base de donnée, on compare

        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
          .catch((error) => res.status(400).json({ error }));
      }
    })
    // si aucune sauce trouvée, on envoi erreur
    .catch((error) => res.status(500).json({ error }));
};

/**
 * Supprimer la sauce selectionner
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (!sauce) {
      res.status(404).json({ error: new Error("Cette sauce n'existe pas") });
    }
    //Comparer l'utilisateur si l'utilisateur obtient l'autorisation
    if (sauce.userId !== req.auth.userId) {
      res.status(403).json({
        error: new Error("Unauthorized request"),
      });
    } else {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    }
  });
};

/**
 * Liker ou Disliker la sauce selectionnée
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.choiceSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (!sauce) {
      return res.status(404).json({
        error: new Error("Cette sauce n'existe pas"),
      });
    }

    const userLikeIndex = sauce.usersLiked.findIndex(
      (userId) => userId == req.body.userId
    );

    const userDislikeIndex = sauce.usersDisliked.findIndex(
      (userId) => userId == req.body.userId
    );
    if (req.body.like === 1) {
      if (userLikeIndex !== -1) {
        return res.status(500).json({
          error: new Error("Le client a déjà liké cette sauce"),
        });
      }
      if (userDislikeIndex !== -1) {
        sauce.usersDisliked.splice(userDislikeIndex, 1);
        sauce.dislikes--;
      }
      sauce.usersLiked.push(req.body.userId);
      sauce.likes++;
    }
    if (req.body.like === -1) {
      if (userDislikeIndex !== -1) {
        return res.status(500).json({
          error: new Error("Le client a déjà disliké cette sauce"),
        });
      }
      if (userLikeIndex !== -1) {
        sauce.usersLiked.splice(userLikeIndex, 1);
        sauce.likes--;
      }
      sauce.usersDisliked.push(req.body.userId);
      sauce.dislikes++;
    }
    if (req.body.like === 0) {
      if (userDislikeIndex !== -1) {
        sauce.usersDisliked.splice(userDislikeIndex, 1);
        sauce.dislikes--;
      } else if (userLikeIndex !== -1) {
        sauce.usersLiked.splice(userLikeIndex, 1);
        sauce.likes--;
      }
    }
    Sauce.updateOne({ _id: req.params.id }, sauce).then(() => {
      res.status(200).json({ message: "Avis enregistré !" });
    });
  });
};
