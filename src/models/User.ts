import mongoose from 'mongoose';

const user = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  password: String,
});

export default mongoose.model('User', user);
