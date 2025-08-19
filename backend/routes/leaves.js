const express = require('express');
const {
  applyLeave,
  updateLeaveStatus,
  getLeaveBalance
} = require('../controllers/leaveController');
const { validateLeave } = require('../middleware/validate');
const Employee = require('../models/Employee'); // ← Don't forget this!
const Leave = require('../models/Leave'); 
const router = express.Router();

router.post('/apply', validateLeave, applyLeave);
router.patch('/:id/status', updateLeaveStatus);
router.get('/balance/:employeeId', getLeaveBalance);
router.get('/stats', async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const pendingRequests = await Leave.countDocuments({ status: 'pending' });
    const approvedRequests = await Leave.countDocuments({ status: 'approved' });
    const rejectedRequests = await Leave.countDocuments({ status: 'rejected' });

    res.json({
      totalEmployees,
      pendingRequests,
      approvedRequests,
      rejectedRequests
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Failed to load statistics' });
  }
});

// GET /api/leaves - Return all leave requests as an array
router.get('/', async (req, res) => {
  try {
    const leaves = await Leave.find();
    res.json(leaves); // <-- Return an array!
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;