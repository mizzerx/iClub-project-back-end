import mongoose, { Schema } from 'mongoose';

const recentsSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  activityName: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
});

const Recents = mongoose.model('recents', recentsSchema);
export default Recents;
