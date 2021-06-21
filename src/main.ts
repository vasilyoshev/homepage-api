import mongoose, { Error } from 'mongoose';
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import passportLocal from 'passport-local';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import User from './models/User';
import { IUser } from './interfaces/IUser';
import { IDatabaseUser } from './interfaces/IDatabaseUser';

const LocalStrategy = passportLocal.Strategy;

const url =
  'mongodb://DobriJS:KjhbzhE0OrEIDVPu@cluster0-shard-00-00.uzivy.mongodb.net:27017,cluster0-shard-00-01.uzivy.mongodb.net:27017,cluster0-shard-00-02.uzivy.mongodb.net:27017/WidgetsApp?ssl=true&replicaSet=atlas-nvmpe9-shard-0&authSource=admin&retryWrites=true&w=majority';

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

passport.use(
  new LocalStrategy((username: string, password: string, done) => {
    User.findOne({ username: username }, (err, user: IDatabaseUser) => {
      if (err) throw err;
      if (!user) return done(null, false);
      bcrypt.compare(password, user.password, (err, result: boolean) => {
        if (err) throw err;
        if (result === true) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    });
  }),
);

passport.serializeUser((user: IDatabaseUser, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: string, done) => {
  User.findById({ id }, (err, user: IDatabaseUser) => {
    const userInformation: IUser = {
      username: user.username,
      id: user.id,
    };
    done(err, userInformation);
  });
});

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
  User.findOne({ username }, async (err, doc: IDatabaseUser) => {
    if (err) throw err;
    if (doc) res.send('User Already Exists');
    if (!doc) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        password: hashedPassword,
      });
      await newUser.save();
      res.send('success');
    }
  });
});

app.post('/login', passport.authenticate('local'), (req, res) => {
  res.send('success');
});

app.listen(4000, () => {
  console.log('Server Started!');
});
