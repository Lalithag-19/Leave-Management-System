const Employee = require('../models/Employee');

module.exports = async function calculateLeaveBalance(employeeId) {
  // Find the employee by custom employeeId
  const employee = await Employee.findOne({ employeeId });
  if (!employee) {
    throw new Error('Employee not found');
  }

  // Calculate remaining leave
  const used = employee.leaveUsed || 0;
  const total = employee.totalLeaveBalance || 0;
  const remaining = total - used;

  return {
    totalLeaveBalance: total,
    leaveUsed: used,
    leaveRemaining: remaining < 0 ? 0 : remaining
  };
};