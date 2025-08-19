# Leave Management System

A full-stack web application for managing employee leave requests, approvals, and balances.

---

## Table of Contents

- [Setup Steps](#setup-steps)
- [Assumptions](#assumptions)
- [Edge Cases Handled](#edge-cases-handled)
- [Potential Improvements](#potential-improvements)
- [API Endpoints](#api-endpoints)
- [Sample Input/Output](#sample-inputoutput)
- [Screenshots](#screenshots)
- [High-Level Design (HLD)](#high-level-design-hld)

---

## Setup Steps

### 1. Clone the repository

```sh
git clone https://github.com/Lalithag-19/Leave-Management-System.git
cd Leave-Management-System
```

### 2. Backend Setup

```sh
cd backend
npm install
```
- Create a `.env` file with your MongoDB connection string:
  ```
  MONGODB_URI=your_mongodb_connection_string
  ```
- Start the backend server:
  ```sh
  npm start
  ```
  The backend runs on [http://localhost:5000](http://localhost:5000).

### 3. Frontend Setup

```sh
cd ../leave-frontend
npm install
npm run dev
```
The frontend runs on [http://localhost:5173](http://localhost:5173).

---

## Assumptions

- Each employee has a unique, auto-generated employee ID based on department.
- Leave balance is tracked as a single quota per employee (no leave types).
- Only admin can approve/reject leave requests.
- Deleting an employee also deletes their leave requests.
- All dates are in ISO format (YYYY-MM-DD).
- No authentication is implemented (for demo purposes).

---

## Edge Cases Handled

- **Applying for leave before joining date:** Not allowed.
- **Applying for leave before today:** Not allowed.
- **Applying for more days than available balance:** Not allowed.
- **Overlapping leave requests:** Not allowed (pending/approved leaves cannot overlap).
- **Employee not found:** Returns error.
- **Invalid dates (e.g., end date before start date):** Returns error.
- **Deleting employee:** Also deletes all their leave requests.
- **Leave requests for deleted employees:** Not shown in UI.
- **Leave balance cannot go negative.**
- **Leave cannot be applied for zero days.**

### Edge Cases to be Handled (Future Improvements)

- **Festive/public holidays:** Leaves overlapping with holidays should not be counted or should be flagged.
- **Weekends:** Optionally, weekends may not count as leave days.
- **Prohibited periods:** Certain dates (e.g., blackout periods) may be blocked for leave.
- **Half-day leaves:** Support for partial day leaves.
- **Leave cancellation:** Allow employees to cancel pending/approved leaves.
- **Bulk leave approval/rejection.**

---

## Potential Improvements

- Add authentication and role-based access (admin/employee).
- Support for multiple leave types (sick, casual, etc.).
- Calendar integration for better leave visualization.
- Notification system (email/SMS) for leave status updates.
- Export leave data as CSV/PDF.
- Mobile-friendly UI.
- Configurable leave quotas and holidays.
- Audit logs for leave actions.

---

## API Endpoints

### Employee

| Method | Endpoint                  | Description           |
|--------|---------------------------|-----------------------|
| GET    | /api/employees            | List all employees    |
| POST   | /api/employees            | Add new employee      |
| PUT    | /api/employees/:id        | Edit employee         |
| DELETE | /api/employees/:id        | Delete employee       |

#### Sample Input (POST /api/employees)
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "department": "HR",
  "position": "Manager",
  "joiningDate": "2024-01-15"
}
```
#### Sample Output
```json
{
  "message": "Employee added successfully",
  "employee": {
    "employeeId": "HR-001",
    "name": "Alice",
    "email": "alice@example.com",
    "department": "HR",
    "position": "Manager",
    "joiningDate": "2024-01-15",
    "totalLeaveBalance": 18,
    "leaveUsed": 0
  }
}
```

---

### Leave

| Method | Endpoint                        | Description                |
|--------|---------------------------------|----------------------------|
| POST   | /api/leaves/apply               | Apply for leave            |
| PATCH  | /api/leaves/:id/status          | Approve/Reject leave       |
| GET    | /api/leaves                     | List all leave requests    |
| GET    | /api/leaves/balance/:employeeId | Get leave balance          |
| GET    | /api/leaves/stats               | Get leave stats            |

#### Sample Input (POST /api/leaves/apply)
```json
{
  "employeeId": "HR-001",
  "startDate": "2024-07-01",
  "endDate": "2024-07-03"
}
```
#### Sample Output
```json
{
  "message": "Leave applied successfully",
  "leave": {
    "employeeId": "HR-001",
    "startDate": "2024-07-01",
    "endDate": "2024-07-03",
    "status": "pending"
  }
}
```

#### Sample Output (GET /api/leaves/balance/HR-001)
```json
{
  "employeeId": "HR-001",
  "totalLeaveBalance": 18,
  "leaveUsed": 3,
  "leaveRemaining": 15
}
```

---

## Screenshots

<img width="1914" height="906" alt="image" src="https://github.com/user-attachments/assets/5b6eaea7-e3f9-476e-96b8-55da10835b4c" />


---

## High-Level Design (HLD)

### Class Diagram (Pseudocode)

```plaintext
+-------------------+         +-------------------+
|    Employee       |         |      Leave        |
+-------------------+         +-------------------+
| employeeId        |<------->| employeeId        |
| name              |         | startDate         |
| email             |         | endDate           |
| department        |         | status            |
| position          |         | appliedOn         |
| joiningDate       |         +-------------------+
| totalLeaveBalance |
| leaveUsed         |
+-------------------+
```

### Pseudocode for Leave Application

```plaintext
function applyLeave(employeeId, startDate, endDate):
    if startDate < today or startDate < employee.joiningDate:
        return error "Invalid start date"
    if endDate < startDate:
        return error "End date before start date"
    if requestedDays > (employee.totalLeaveBalance - employee.leaveUsed):
        return error "Not enough leave balance"
    if overlapsWithExistingLeave(employeeId, startDate, endDate):
        return error "Overlapping leave"
    create leave request with status 'pending'
```

---

## License

MIT

---

## Author
