# Permissions Matrix: Role-Based Access Control (RBAC)

## 1. Portals & Roles
The system separates users into two portal types:
1. **Staff Portal (`portal_type: "staff"`)**:
   - `super_admin`: Full system access, user administration, system logs.
   - `principal`: Comprehensive school oversight, result publication, attendance overrides.
   - `correspondent`: Executive reports, financial oversight, circular broadcast.
   - `school_admin`: School setup, academic years, student admissions, staff assignments.
   - `teacher`: Attendance marking, marks entry for assigned subjects/classes.
   - `accountant`: Fee structures, payments, receipts, collection reports.
   - `non_teaching`: Departmental tasks, limited internal features.
   - `driver`: Transport logs, route assignments.

2. **Parent & Student Portal (`portal_type: "parent_student"`)**:
   - `parent`: Access only to linked children (attendance, published results, fee dues/receipts).
   - `student`: Self-service access to own profile, timetable, attendance, published results.

---

## 2. Permission Access Table

| Module / Operation | super_admin | principal | school_admin | teacher | accountant | parent | student |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Manage Users & Roles** | Full | None | None | None | None | None | None |
| **School Setup (Academic Years, Classes)** | Full | Read | Full | Read | Read | None | None |
| **Student Admissions & Enquiries** | Full | Read | Full | None | None | Public (Enquiry) | None |
| **Student Records (CRUD)** | Full | Read | Full | None | None | None | None |
| **Student Attendance Marking** | Full | Override | Override | Assigned Only | None | None | None |
| **Staff Attendance & Leaves** | Full | Approve | Manage | Self | None | None | None |
| **Timetable Configuration** | Full | Read | Full | Read (Own) | None | Read (Child) | Read (Own) |
| **Marks Entry** | Full | Read | Read | Assigned Only | None | None | None |
| **Result Approval & Publication** | Full | Approve | Approve | None | None | None | None |
| **View Published Results** | Full | Full | Full | Assigned | None | Linked Child | Own Only |
| **Fee Setup & Invoicing** | Full | Read | None | None | Full | None | None |
| **Payment Posting & Receipts** | Full | Read | None | None | Full | None | None |
| **View Fee Dues & Receipts** | Full | Read | None | None | Full | Linked Child | Own Only |
| **Publish Circulars** | Full | Full | Full | None | None | None | None |
| **View Circulars** | Full | Full | Full | Staff Only | Staff Only | Audience Filter | Audience Filter |
| **Audit Logs Access** | Full | Read | None | None | None | None | None |
