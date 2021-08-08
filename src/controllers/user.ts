import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import logging from '../config/logging';
import User from '../models/user';
import signJWT from '../functions/signJWT';

const NAMESPACE = 'User';

const validateToken = (req: Request, res: Response) => {
  logging.info(NAMESPACE, 'Token validated, user authorized.');

  return res.status(200).json({
    message: 'Token(s) validated',
  });
};

const signup = (req: Request, res: Response) => {
  const { username, password } = req.body;

  bcryptjs.hash(password, 10, (hashError, hash) => {
    if (hashError) {
      return res.status(401).json({
        message: hashError.message,
        error: hashError,
      });
    }

    const _user = new User({
      _id: new mongoose.Types.ObjectId(),
      username,
      password: hash,
    });

    return _user
      .save()
      .then((user) => {
        return res.status(201).json({
          user,
        });
      })
      .catch((error) => {
        return res.status(500).json({
          message: error.message,
          error,
        });
      });
  });
};

const login = (req: Request, res: Response) => {
  const { username, password } = req.body;

  User.find({ username })
    .exec()
    .then((users) => {
      if (users.length !== 1) {
        return res.status(401).json({
          message: 'Unauthorized. Please check your credentials',
        });
      }

      bcryptjs.compare(password, users[0].password, (error, result) => {
        if (error) {
          return res.status(401).json({
            message: 'Password Mismatch',
          });
        } else if (result) {
          signJWT(users[0], (_error, token) => {
            if (_error) {
              return res.status(500).json({
                message: _error.message,
                error: _error,
              });
            } else if (token) {
              return res.status(200).json({
                message: 'Auth successful',
                token: token,
                user: users[0],
              });
            }
          });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

export default { validateToken, signup, login };
