import mongoose, { Error } from 'mongoose';
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import UserSchema from './models/User';
import { User } from './interfaces/User';

const url =
  'mongodb://DobriJS:Slayer198900@cluster0-shard-00-00.uzivy.mongodb.net:27017,cluster0-shard-00-01.uzivy.mongodb.net:27017,cluster0-shard-00-02.uzivy.mongodb.net:27017/WidgetsApp?ssl=true&replicaSet=atlas-nvmpe9-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(
  url,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err: Error) => {
    if (err) throw err;
    console.log('Connected To MongoDB');
  },
);

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(
  session({
    secret: 'alibaba',
    resave: true,
    saveUninitialized: true,
  }),
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.post('/signup', async (req, res) => {
  const { username, password } = req?.body;
  if (
    !username ||
    !password ||
    typeof username !== 'string' ||
    typeof password !== 'string'
  ) {
    res.send('Improper Values');
    return;
  }
  UserSchema.findOne({ username }, async (err: Error, doc: User) => {
    if (err) throw err;
    if (doc) res.send('User Already Exists');
    if (!doc) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new UserSchema({
        username,
        password: hashedPassword,
      });
      await newUser.save();
      res.send('Success');
    }
  });
});

app.listen(4000, () => {
  console.log('Server Started!');
});
