import mongoose, { Schema } from 'mongoose';

const WorkAnswersSchema = new Schema({
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
});

const WorkAnswers = mongoose.model('work_answers', CourseWorksSchema);
export default WorkAnswers;
