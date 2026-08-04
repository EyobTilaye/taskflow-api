# Database Design

## Overview

TaskFlow is a **multi-tenant** project management platform.

A single user can belong to multiple organizations, and each organization owns its own projects, tasks, members, and activity logs.

---

# Core Design Principles

- Multi-tenant architecture
- Normalized relational database
- Explicit relationships
- Soft deletes where appropriate
- UUID primary keys
- Auditability through activity logs

---

# Entities

## User

Represents a person who can log into the system.

### Responsibilities

- Authentication
- Personal profile
- Membership in one or more organizations

---

## Organization

Represents a company, team, or workspace.

Every project belongs to exactly one organization.

---

## Membership

Represents the relationship between a User and an Organization.

A user can belong to multiple organizations.

Stores:

- Role
- Join date

---

## Project

Represents a collection of tasks.

Every project belongs to one organization.

---

## Task

Represents a unit of work inside a project.

A task stores:

- Creator
- Assignee
- Status
- Priority
- Due date

Tasks belong to exactly one project.

---

## Comment

Discussion attached to a task.

Each comment has:

- Author
- Content
- Timestamp

---

## Label

Labels categorize tasks.

Examples:

- Backend
- Frontend
- Bug
- Feature
- Documentation
- Urgent

A label can belong to many tasks.

A task can have many labels.

---

## ActivityLog

Stores important actions performed in the system.

Examples:

- Task created
- Task assigned
- Project archived
- Member invited

Provides audit history.

---

# Relationships

User
→ has many Memberships

Organization
→ has many Memberships

Organization
→ has many Projects

Project
→ has many Tasks

Task
→ has many Comments

Task
→ has many Labels

Label
→ belongs to many Tasks

User
→ creates many Tasks

User
→ can be assigned many Tasks

User
→ writes many Comments

Organization
→ has many Activity Logs

---

# Enums

## MembershipRole

- OWNER
- ADMIN
- MANAGER
- MEMBER
- GUEST

---

## TaskStatus

- TODO
- IN_PROGRESS
- IN_REVIEW
- DONE
- CANCELLED

---

## TaskPriority

- LOW
- MEDIUM
- HIGH
- URGENT

---

## ProjectStatus

- ACTIVE
- COMPLETED
- ARCHIVED

---

# Index Strategy

## User

Unique:

- email

---

## Membership

Composite Unique:

- (userId, organizationId)

---

## Project

Indexes:

- organizationId
- status

---

## Task

Indexes:

- projectId
- assigneeId
- creatorId
- status
- priority
- dueDate

---

# Deletion Strategy

## Soft Delete

- Task
- Project
- Comment

Reason:

Users should be able to recover accidentally deleted data.

---

## Hard Delete

- Label (if unused)
- ActivityLog (never deleted under normal operation)

---

# Future Entities

Not part of Version 1.

- Attachments
- Notifications
- Calendar Events
- AI Assistant
- Time Tracking