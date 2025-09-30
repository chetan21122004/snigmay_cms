📝 Project Context: Snigmay Pune FC – Attendance & Fee Management System

🎯 Objective

To design and develop a web-based system for Snigmay Pune FC to efficiently manage its football training operations. This includes centralized handling of attendance, student records, fee tracking, and role-based control across multiple training centers.

🏟️ Organization Overview

Snigmay Pune FC operates football coaching centers in three locations:

Kharadi

Viman Nagar

Hadapsar

Each center hosts multiple batches, coaches, students, and administrative staff. The system is intended to bring operational efficiency, transparency, and ease of tracking across all levels.

👥 User Roles and Control Levels

The system will support five roles, each with specific permissions:

1. Super Admin

Full access to all modules and data across all centers.

Can manage users, roles, centers, attendance, and fee records.

2. Club Manager

Access to view and manage attendance and financials across all centers.

Cannot delete users.

3. Head Coach

Can view and manage attendance and fee data across all centers.

Can oversee batch performance and fee status.

4. Coach

Access limited to their assigned center(s) only.

Can manage attendance and view/update fee details for students in their batch.

5. Center Manager

Access limited to their own center.

Can track student attendance and update/manage fee statuses.

Assists in operational coordination at the center level.
Assign coaches to specific batches.


📋 Core Functionalities

🔐 Authentication & Role Management

Secure login for all roles.

Role-based dashboard visibility and actions.

Each user is assigned a role and optionally linked to a center.

Center & Batch Management

Ability to manage multiple centers.

Creation and organization of batches under each center.

Assign coaches to specific batches.

Student Management

Add/edit/remove student records.

Assign students to specific batches and centers.

Track age, contact, guardian info, and center association.

🕒 Attendance Management

Coaches and managers mark attendance daily.

Admins and head coaches can view attendance reports filtered by:

Date

Batch

Center

Student

Attendance marked as Present / Absent / Late (optional)

💸 Fee Management

Maintain student-wise fee structure and dues.

Record payments, payment modes, and receipts.

Generate reports by:

Center

Batch

Student

Payment Status (Paid / Due / Overdue)

📊 Reporting and Filters

Attendance Reports

By center, batch, date, or student

Fee Reports

By center, batch, student, payment date, and due status

User-wise usage tracking (optional for audit purposes)

🔒 Data Access & Security

Role-based data visibility

Each coach/center manager can access data only for their assigned center.

Higher-level roles can access aggregated and full-system views.

📈 Future Scope (Optional/Not in MVP)

SMS/email fee reminders to parents.

Attendance notifications.

Parent login for viewing student performance.

Analytics dashboard for player tracking and training reports.
