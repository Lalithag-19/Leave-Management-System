const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const calculateLeaveBalance = require('../utils/calculateLeaveBalance');
// Apply for leave
exports.applyLeave = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, leaveType } = req.body;

    const employee = await Employee.findOne({ employeeId: req.body.employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ message: 'End date cannot be before start date' });
    }

    if (start < new Date(employee.joiningDate)) {
      return res.status(400).json({ message: 'Cannot take leave before joining date' });
    }

    const durationInDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    if (durationInDays <= 0) {
      return res.status(400).json({ message: 'Invalid leave duration' });
    }

    const balanceInfo = await calculateLeaveBalance(employeeId);
    if (durationInDays > balanceInfo.availableBalance) {
      return res.status(400).json({ message: 'Insufficient leave balance' });
    }

    // Check for overlapping leaves
    const overlap = await Leave.findOne({
      employeeId,
      status: { $in: ['approved', 'pending'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlap) {
      return res.status(400).json({ message: 'Leave overlaps with an existing request' });
    }

    const leave = new Leave({
      employeeId,
      startDate,
      endDate,
      leaveType,
      status: 'pending'
    });
    await leave.save();

    res.status(201).json({ message: 'Leave applied successfully', leave });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Approve or reject leave
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "approved" or "rejected"' });
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be updated' });
    }

    leave.status = status;
    await leave.save();

    // --- LEAVE BALANCE UPDATE LOGIC ---
    if (status === "approved") {
      const employee = await Employee.findOne({ employeeId: leave.employeeId });
      if (employee) {
        const days =
          (new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24) + 1;
        employee.leaveUsed = (employee.leaveUsed || 0) + days;
        await employee.save();
      }
    }
    // --- END LEAVE BALANCE UPDATE LOGIC ---

    res.json({ message: `Leave ${status}`, leave });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get leave balance
exports.getLeaveBalance = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // CHANGE: Find by custom employeeId, not MongoDB _id
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const balance = await calculateLeaveBalance(employeeId);

    res.json({
      employeeId,
      ...balance
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};