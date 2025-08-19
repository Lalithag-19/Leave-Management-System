// src/App.jsx
import { useState, useEffect } from "react";
import "./style.css";

const API_URL = "http://localhost:5000/api";

// ---------------- Status Badge ----------------
function StatusBadge({ status }) {
  const colors = {
    pending: "badge pending",
    approved: "badge approved",
    rejected: "badge rejected",
  };
  return <span className={colors[status]}>{status.toUpperCase()}</span>;
}

// ---------------- Dashboard ----------------
function Dashboard({ stats, employees, loading, onDelete, onEdit }) {
  return (
    <div className="dashboard">
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h2>{stats.totalEmployees}</h2>
          <p>👥 TOTAL EMPLOYEES</p>
        </div>
        <div className="stat-card">
          <h2>{stats.pendingRequests}</h2>
          <p>⏳ PENDING REQUESTS</p>
        </div>
        <div className="stat-card">
          <h2>{stats.approvedRequests}</h2>
          <p>✅ APPROVED REQUESTS</p>
        </div>
        <div className="stat-card">
          <h2>{stats.rejectedRequests}</h2>
          <p>❌ REJECTED REQUESTS</p>
        </div>
      </div>

      {/* Employee Directory */}
      <section className="employee-directory">
        <h2>👥 Employee Directory</h2>
        {loading ? (
          <p>Loading employees...</p>
        ) : employees.length === 0 ? (
          <p>No employees found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>EMPLOYEE</th>
                <th>DEPARTMENT</th>
                <th>POSITION</th>
                <th>JOIN DATE</th>
                <th>LEAVE BALANCE</th>
                <th>EMPLOYEE ID</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id}>
                  <td>
                    <strong>{emp.name}</strong>
                    <br />
                    <small>{emp.email}</small>
                  </td>
                  <td>
                    <span className="badge">{emp.department}</span>
                  </td>
                  <td>{emp.position || "N/A"}</td>
                  <td>
                    {emp.joiningDate
                      ? new Date(emp.joiningDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <div>
                      📅 Annual:{" "}
                      <strong>
                        {emp.annualLeaveUsed || 0}/{emp.annualLeaveQuota || 20}
                      </strong>
                    </div>
                  </td>
                  <td>
                    <span className="badge employee-id">{emp.employeeId}</span>
                  </td>
                  <td>
                    <button className="btn-secondary" onClick={() => onEdit(emp)}>✏️ Edit</button>
                    <br />
                    <button className="btn-danger" onClick={() => onDelete(emp._id)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

// ---------------- Add Employee ----------------
function AddEmployeeForm({ onEmployeeAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    joiningDate: "",
    annualLeaveQuota: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setMessage("✅ Employee added successfully!");
        onEmployeeAdded();
        setFormData({
          name: "",
          email: "",
          department: "",
          position: "",
          joiningDate: "",
          annualLeaveQuota: "",
        });
      } else {
        setMessage("❌ Failed to add employee.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setMessage("⚠️ Error adding employee.");
    }
  };

  return (
    <div>
      {message && <p className="alert">{message}</p>}
      <form onSubmit={handleSubmit} className="form-grid">
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required />
        <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" required />
        <input name="department" value={formData.department} onChange={handleChange} placeholder="Department" required />
        <input name="position" value={formData.position} onChange={handleChange} placeholder="Position" />
        <input name="joiningDate" type="date" value={formData.joiningDate} onChange={handleChange} required />
        <input name="annualLeaveQuota" type="number" value={formData.annualLeaveQuota} onChange={handleChange} min="0" placeholder="total no of leaves" required />
        <button type="submit" className="btn-primary">➕ Add Employee</button>
      </form>
    </div>
  );
}

// ---------------- Apply Leave ----------------
function ApplyLeaveForm({ onLeaveApplied, employees, onEmployeesUpdated }) {
  const [formData, setFormData] = useState({
    employeeId: "",
    leaveType: "",
    startDate: "",
    endDate: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Find the employee by employeeId
    const employee = employees.find(emp => emp.employeeId === formData.employeeId);
    if (!employee) {
      alert("Employee not found.");
      return;
    }

    const joiningDate = new Date(employee.joiningDate);
    const startDate = new Date(formData.startDate);
    const today = new Date();
    today.setHours(0,0,0,0); // Ignore time for today

    if (startDate < joiningDate) {
      alert("Leave start date cannot be before the employee's joining date.");
      return;
    }
    if (startDate < today) {
      alert("Leave start date cannot be before today.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/leaves/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setMessage("✅ Leave applied successfully!");
        onLeaveApplied();
        setFormData({ employeeId: "", leaveType: "", startDate: "", endDate: "" });
        if (onEmployeesUpdated) onEmployeesUpdated(); // <-- Add this line
      } else {
        setMessage("❌ Failed to apply leave.");
      }
    } catch (err) {
      console.error("Error applying leave:", err);
      setMessage("⚠️ Error applying leave.");
    }
  };

  return (
    <div>
      {message && <p className="alert">{message}</p>}
      <form onSubmit={handleSubmit} className="form-grid">
        <input name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="Employee ID" required />
        <select name="leaveType" value={formData.leaveType} onChange={handleChange} required>
          <option value="">Select Leave Type</option>
          <option value="annual">Annual Leave</option>
          <option value="sick">Sick Leave</option>
          <option value="casual">Casual Leave</option>
          <option value="maternity">Maternity Leave</option>
        </select>
        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
        <button type="submit" className="btn-primary">📝 Apply Leave</button>
      </form>
    </div>
  );
}

// ---------------- Manage Leaves ----------------
function ManageLeaves({ leaveRequests, onStatusChange }) {
  return (
    <div className="form-section">
      <h2>📄 Manage Leave Requests</h2>
      {leaveRequests.length === 0 ? (
        <p>No leave requests found.</p>
      ) : (
        <table className="manage-leaves-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Leave Type</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((req) => (
              <tr key={req._id}>
                <td>{req.employeeId}</td>
                <td>{req.leaveType}</td>
                <td>
                  {new Date(req.startDate).toLocaleDateString()} → {new Date(req.endDate).toLocaleDateString()}
                </td>
                <td><StatusBadge status={req.status} /></td>
                <td>
                  {req.status === "pending" && (
                    <>
                      <button className="btn-approve" onClick={() => onStatusChange(req._id, "approved")}>✅ Approve</button>
                      <button className="btn-reject" onClick={() => onStatusChange(req._id, "rejected")}>❌ Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ---------------- Edit Employee Prompt ----------------
function EditEmployeePrompt({ show, employee, onClose, onSave }) {
  const [form, setForm] = useState(employee || {});

  useEffect(() => {
    setForm(employee || {});
  }, [employee]);

  if (!show || !employee) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Edit Employee</h2>
        <form onSubmit={handleSubmit}>
          <input name="name" value={form.name || ""} onChange={handleChange} placeholder="Name" required />
          <input name="email" value={form.email || ""} onChange={handleChange} placeholder="Email" required />
          <input name="department" value={form.department || ""} onChange={handleChange} placeholder="Department" required />
          <input name="position" value={form.position || ""} onChange={handleChange} placeholder="Position" required />
          <button type="submit" className="btn-primary">Save</button>
          <button type="button" className="btn-secondary" onClick={onClose} style={{marginLeft: 8}}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

// ---------------- Main App ----------------
function App() {
  // Load active tab from localStorage
  const [activeTab, setActiveTab] = useState(localStorage.getItem("activeTab") || "dashboard");
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  });
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
    fetchStats();
    fetchLeaveRequests();
  }, []);

  // Save tab change
  const changeTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("activeTab", tab);
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/employees`);
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/leaves/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/leaves`);
      const data = await res.json();
      setLeaveRequests(data);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/leaves/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchLeaveRequests();
        fetchStats();
        fetchEmployees(); // <-- Add this line
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      const res = await fetch(`${API_URL}/employees/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchEmployees();      // Refresh employee list
        fetchLeaveRequests();  // Refresh leave requests
        fetchStats();          // Refresh dashboard stats
      } else {
        alert("Failed to delete employee.");
      }
    } catch (err) {
      alert("Error deleting employee.");
    }
  };

  const handleEdit = (emp) => {
    setSelectedEmployee(emp);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedEmp) => {
    setEditModalOpen(false);
    try {
      const res = await fetch(`${API_URL}/employees/${updatedEmp._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEmp),
      });
      if (res.ok) {
        fetchEmployees(); // Refresh list
      } else {
        alert("Failed to update employee.");
      }
    } catch (err) {
      alert("Error updating employee.");
    }
  };

  return (
    <>
      <div className="app">
        <header>
          <h1>Leave Management System</h1>
          <p>Streamline your leave management process</p>
        </header>

        {/* Navigation */}
        <nav>
          <button onClick={() => changeTab("dashboard")} className={activeTab === "dashboard" ? "active" : ""}>📊 Dashboard</button>
          <button onClick={() => changeTab("add-employee")} className={activeTab === "add-employee" ? "active" : ""}>👤 Add Employee</button>
          <button onClick={() => changeTab("apply-leave")} className={activeTab === "apply-leave" ? "active" : ""}>📝 Apply for Leave</button>
          <button onClick={() => changeTab("manage-leaves")} className={activeTab === "manage-leaves" ? "active" : ""}>📄 Manage Leaves</button>
        </nav>

        {/* Content */}
        <main>
          {activeTab === "dashboard" && (
            <Dashboard
              stats={stats}
              employees={employees}
              loading={loading}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
          {activeTab === "add-employee" && (
            <div className="form-section">
              <h2>👤 Add Employee</h2>
              <AddEmployeeForm onEmployeeAdded={fetchEmployees} />
            </div>
          )}
          {activeTab === "apply-leave" && (
            <div className="form-section">
              <h2>📝 Apply for Leave</h2>
              <ApplyLeaveForm
                onLeaveApplied={fetchLeaveRequests}
                employees={employees}
                onEmployeesUpdated={fetchEmployees}
              />
            </div>
          )}
          {activeTab === "manage-leaves" && (
            <ManageLeaves leaveRequests={leaveRequests} onStatusChange={handleStatusChange} />
          )}
        </main>
      </div>
      <EditEmployeePrompt
        show={editModalOpen}
        employee={selectedEmployee}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveEdit}
      />
    </>
  );
}

export default App;