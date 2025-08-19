const mongoose = require('mongoose');


const leaveSchema = new mongoose.Schema({
  employeeId: {
    type: String, // Changed from ObjectId to String
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  appliedOn: { type: Date, default: Date.now },
  leaveType: { type: String, required: true }
});

// Index for performance
leaveSchema.index({ employeeId: 1, startDate: 1, endDate: 1, status: 1 });

module.exports = mongoose.model('Leave', leaveSchema);