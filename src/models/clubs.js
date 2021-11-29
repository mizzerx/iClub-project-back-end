import mongoose, { Schema } from 'mongoose';

const clubsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    avatar: {
      type: String,
    },
    clubAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    inviteCode: {
      type: String,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
    membersQuantity: {
      type: Number,
      default: 0,
    },
    works: [
      {
        type: Schema.Types.ObjectId,
        ref: 'works',
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'comments',
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Clubs = mongoose.model('clubs', clubsSchema);
export default Clubs;
