import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from '../utils/jwt';
import Recents from './recents';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    roles: {
      type: [String],
      default: ['user'],
    },
    phone: {
      type: String,
    },
    clubs: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'clubs',
        },
      ],
    },
    works: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'works',
        },
      ],
    },
    recents: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'recents',
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (error) {
    throw error;
  }
};

userSchema.methods.generateToken = function (isAdmin) {
  const token = jwt.sign({ id: this._id, admin: isAdmin }, '1d');
  return token;
};

userSchema.methods.saveLog = async function (action, target) {
  try {
    const recent = new Recents({
      type: target,
      activityName: action,
      time: Date.now(),
      user: this._id,
    });

    await recent.save();
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model('users', userSchema);
export default User;
