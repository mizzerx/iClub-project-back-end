import mongoose, { Schema } from 'mongoose';

const WorksSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  workAnswers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'work_answers',
    },
  ],
  handedIn: [
    {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
  ],
  unHandedIn: [
    {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
  ],
  time: {
    type: Date,
    default: Date.now,
  },
  club: {
    type: Schema.Types.ObjectId,
    ref: 'clubs',
  },
});

const Works = mongoose.model('works', WorksSchema);
export default Works;
