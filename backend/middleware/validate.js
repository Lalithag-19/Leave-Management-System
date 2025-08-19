const Joi = require('joi');

// Validate add employee
const validateEmployee = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    department: Joi.string().min(2).required(),
    joiningDate: Joi.date().iso().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Validate apply leave
const validateLeave = (req, res, next) => {
  const schema = Joi.object({
    employeeId: Joi.string().required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).required(),
    leaveType: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

module.exports = { validateEmployee, validateLeave };