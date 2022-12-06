const bcrypt = require("bcrypt");
const User = require("../models/User");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const mailValidator = require("email-validator");
const passwordSchema = require("../models/PasswordValidate");

/**
 * S'inscrire pour les nouveaux utilisateurs
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

exports.signup = (req, res, next) => {
  if (!mailValidator.validate(req.body.email)) {
    //S'assurer que l'email respecte le schema
    const validEmail = (email) => {
      let regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
        testRegex = regex.test(email);
      testRegex
        ? next()
        : res.status(400).json({ message: "Le mail n'est pas conforme !" });
    };
    validEmail(req.body.email);

    res.status(400).json({ message: "Le mail n'est pas conforme !" });
  } else if (!passwordSchema.validate(req.body.password)) {
    //S'assurer que le MDP respecte le schema

    res.status(400).json({
      message:
        "Le mot de passe doit comporter 10 caractères, minimum un chiffre, avec une majuscule et une minuscule.",
    });
  } else {
    bcrypt
      //Hasher le MDP
      .hash(req.body.password, 10)
      .then((hash) => {
        const user = new User({
          email: req.body.email,
          password: hash,
        });
        user
          .save()
          .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
          .catch((error) => res.status(400).json({ error }));
      })
      .catch((error) => res.status(501).json({ error }));
  }
};
/**
 * Se connecter pour les nouveaux utilisateurs
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              `${process.env.MDP_JWT_SECRET}`,
              {
                expiresIn: "24h",
              }
            ),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
