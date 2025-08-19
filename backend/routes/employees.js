const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { addEmployee, deleteEmployee } = require('../controllers/employeeController');

// GET all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add new employee
router.post('/', addEmployee);

// PUT update employee by ID
router.put('/:id', async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Employee not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE employee by ID
router.delete('/:id', deleteEmployee);

module.exports = router;