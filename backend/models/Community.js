import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  }
}, {
  timestamps: true
});

const Community = mongoose.model('Community', communitySchema);
export default Community;
