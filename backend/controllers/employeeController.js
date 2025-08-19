const Counter = require('../models/Counter');
const Employee = require('../models/Employee');
const Leave = require('../models/Leave');

// Add new employee
exports.addEmployee = async (req, res) => {
  try {
    const { name, email, department, position, joiningDate } = req.body;

    if (!name || !email || !department || !position || !joiningDate) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Find all used sequence numbers in the department
    const employeesInDept = await Employee.find({ department }).select('employeeId');
    const usedNumbers = employeesInDept
      .map(e => parseInt(e.employeeId.split('-')[1], 10))
      .filter(n => !isNaN(n));

    // Find the smallest unused number
    let newSeq = 1;
    while (usedNumbers.includes(newSeq)) {
      newSeq++;
    }

    // Generate employeeId
    const employeeId = `${department.toUpperCase()}-${String(newSeq).padStart(3, '0')}`;

    // (Optional) Update Counter for the department if needed
    await Counter.findByIdAndUpdate(
      department,
      { $max: { seq: newSeq } },
      { upsert: true }
    );

    const employee = new Employee({
      employeeId,
      name,
      email,
      department,
      position,
      joiningDate: new Date(joiningDate)
    });

    await employee.save();
    res.status(201).json({
      message: 'Employee added successfully',
      employee
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add this controller
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { name, email, department, position, joiningDate } = req.body;
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    let employeeId = employee.employeeId;

    // If department changed, generate a new employeeId for the new department
    if (department && department !== employee.department) {
      // 1. Find all used sequence numbers in the new department
      const employeesInDept = await Employee.find({ department }).select('employeeId');
      const usedNumbers = employeesInDept
        .map(e => parseInt(e.employeeId.split('-')[1], 10))
        .filter(n => !isNaN(n));

      // 2. Find the smallest unused number
      let newSeq = 1;
      while (usedNumbers.includes(newSeq)) {
        newSeq++;
      }

      // 3. Generate new employeeId
      employeeId = `${department.toUpperCase()}-${String(newSeq).padStart(3, '0')}`;

      // 4. (Optional) Update Counter for the new department if needed
      await Counter.findByIdAndUpdate(
        department,
        { $max: { seq: newSeq } },
        { upsert: true }
      );
    }

    // Update fields
    employee.name = name;
    employee.email = email;
    employee.department = department;
    employee.position = position;
    employee.joiningDate = joiningDate;
    employee.employeeId = employeeId;

    await employee.save();
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete employee by ID
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    // Find employee by MongoDB _id
    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    // Delete all leaves for this employee (by custom employeeId)
    await Leave.deleteMany({ employeeId: employee.employeeId });
    res.json({ message: 'Employee and related leaves deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};