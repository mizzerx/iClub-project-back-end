import mongoose, { Schema } from 'mongoose';

const commentSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  club: {
    type: Schema.Types.ObjectId,
    ref: 'clubs',
    required: true,
  },
});

const Comment = mongoose.model('comments', commentSchema);
export default Comment;
