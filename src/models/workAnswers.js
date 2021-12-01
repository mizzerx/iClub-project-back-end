import mongoose, { Schema } from 'mongoose';

const WorkAnswersSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    work: {
      type: Schema.Types.ObjectId,
      ref: 'works',
    },
    docmentLink: {
      type: String,
      default: '',
    },
    comments: {
      type: String,
      default: '',
    },
    answer: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

const WorkAnswers = mongoose.model('work_answers', WorkAnswersSchema);
export default WorkAnswers;
