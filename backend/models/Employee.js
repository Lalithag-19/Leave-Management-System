const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true }, // Auto-generated ID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  position: { type: String, required: true }, // <-- Added position field
  joiningDate: { type: Date, required: true },
  totalLeaveBalance: { type: Number, default: 18 }
});

module.exports = mongoose.model('Employee', employeeSchema);