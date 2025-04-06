// models/message.model.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Message= mongoose.model('Message', messageSchema);
 export default Message