# TaskFlow API - System Design Document

> Version: 1.0
> Author: Eyob
> Status: Design Phase

---

# 1. Project Overview

## Vision

TaskFlow is a multi-tenant project management platform where organizations can manage projects, tasks, members, and collaboration in a secure and scalable way.

The backend follows modern backend engineering practices:

- REST API
- Feature-based architecture
- Clean Architecture principles
- Repository Pattern
- Service Layer
- Prisma ORM
- PostgreSQL
- Docker

---

# 2. Project Goals

This project has two goals.

## Product Goal

Build a production-ready project management platform.

## Learning Goal

Demonstrate professional backend engineering skills including:

- API Design
- Database Design
- Authentication
- Authorization
- Business Logic
- Testing
- Docker
- CI/CD
- Clean Code
- Documentation

---

# 3. Core Features (Version 1)

Authentication

- Register
- Login
- Refresh Token
- Logout

Organizations

- Create organization
- Invite members
- Manage members

Projects

- Create project
- Update project
- Archive project

Tasks

- Create task
- Assign task
- Update task
- Delete task

Comments

- Comment on task

Labels

- Categorize tasks

Activity Log

- Record important events

---

# 4. Future Features

Not included in Version 1.

- Notifications
- File Uploads
- Calendar
- AI Assistant
- Email Service
- Analytics
- Time Tracking

---

# 5. High-Level Architecture

Client
│
▼
Express Routes
│
▼
Controllers
│
▼
Services
│
▼
Repositories
│
▼
Prisma ORM
│
▼
PostgreSQL

Each layer has one responsibility.

---

# 6. Why This Architecture?

## Routes

Purpose

Map HTTP endpoints to controllers.

Routes should never contain business logic.

---

## Controllers

Purpose

Handle HTTP requests and responses.

Responsibilities

- Read request
- Validate request
- Call service
- Return response

Controllers should never talk directly to the database.

---

## Services

Purpose

Contain business logic.

Examples

- Can this user create a project?
- Can this member assign tasks?
- Is this project archived?

Services coordinate the application.

---

## Repositories

Purpose

Perform database operations.

Examples

- Find project by ID
- Create task
- Update user

Repositories know Prisma.

Services do not.

---

## Prisma

Purpose

Translate repository operations into SQL.

---

## PostgreSQL

Stores application data.

---

# 7. Multi-Tenant Design

One user may belong to many organizations.

Example

Eyob

├── Startup
│ Owner
└── Freelance Team
Admin

Therefore:

User

↓

Membership

↓

Organization

Instead of

User

↓

Organization

This gives flexibility and scalability.

---

# 8. Core Entities

User

Represents a person using the platform.

---

Organization

Represents a company or team.

---

Membership

Connects users and organizations.

Stores roles.

---

Project

Collection of related tasks.

---

Task

Represents work to be completed.

Stores:

- Creator
- Assignee
- Status
- Priority
- Due Date

---

Comment

Discussion on tasks.

---

Label

Flexible tags.

Examples

- Bug
- Backend
- Frontend
- Urgent

---

Activity Log

Audit history.

Examples

- Task Created
- Member Invited
- Project Archived

---

# 9. Why creatorId and assigneeId?

Instead of

Task

userId

We use

creatorId

assigneeId

Reason

A generic userId has no meaning.

Questions like

Who created this?

Who is responsible?

cannot be answered.

Explicit relationships improve clarity.

---

# 10. Why Labels?

Without labels

Task

category

Only one category.

With labels

Task

Backend

Urgent

Bug

Authentication

A task may have multiple labels.

This is a Many-to-Many relationship.

---

# 11. Relationships

User

1 → Many Memberships

Organization

1 → Many Memberships

Organization

1 → Many Projects

Project

1 → Many Tasks

Task

1 → Many Comments

Task

Many → Many Labels

User

1 → Many Created Tasks

User

1 → Many Assigned Tasks

---

# 12. Enums

MembershipRole

OWNER

ADMIN

MANAGER

MEMBER

GUEST

---

TaskStatus

TODO

IN_PROGRESS

IN_REVIEW

DONE

CANCELLED

---

TaskPriority

LOW

MEDIUM

HIGH

URGENT

---

ProjectStatus

ACTIVE

ARCHIVED

COMPLETED

---

# 13. Business Rules

Only authenticated users may access protected routes.

Only organization members may access organization resources.

Only Owners and Admins may invite members.

Only Managers, Admins, and Owners may create projects.

Members may create tasks.

Guests cannot modify data.

Archived projects cannot receive new tasks.

Deleted tasks are soft deleted.

---

# 14. Permission Matrix

| Action              | Owner | Admin | Manager | Member |   Guest   |
| ------------------- | :---: | :---: | :-----: | :----: | :-------: |
| Create Organization |  ✅   |  ❌   |   ❌    |   ❌   |    ❌     |
| Invite Members      |  ✅   |  ✅   |   ❌    |   ❌   |    ❌     |
| Remove Members      |  ✅   |  ✅   |   ❌    |   ❌   |    ❌     |
| Create Project      |  ✅   |  ✅   |   ✅    |   ❌   |    ❌     |
| Archive Project     |  ✅   |  ✅   |   ❌    |   ❌   |    ❌     |
| Create Task         |  ✅   |  ✅   |   ✅    |   ✅   |    ❌     |
| Assign Task         |  ✅   |  ✅   |   ✅    |   ❌   |    ❌     |
| Comment             |  ✅   |  ✅   |   ✅    |   ✅   | Read Only |

---

# 15. API Design Principles

Base URL

/api/v1

Use nouns instead of verbs.

Good

/projects

/tasks

Bad

/createProject

Always return JSON.

Always use HTTP status codes correctly.

---

# 16. Error Response

Example

{
"success": false,
"message": "Project not found",
"errors": []
}

---

# 17. Success Response

{
"success": true,
"data": {}
}

---

# 18. Database Design Principles

- UUID primary keys
- Foreign keys
- Composite indexes where appropriate
- Soft deletes
- Audit logging
- Normalized schema

---

# 19. Soft Delete Strategy

Task

deletedAt

Project

deletedAt

Reason

Allow recovery of accidentally deleted data.

---

# 20. Development Workflow

Every feature follows the same lifecycle.

1. Design
2. Review
3. Implement
4. Test
5. Document
6. Commit
7. Push
8. Code Review

No feature is complete until all eight steps are finished.

---

# 21. Folder Structure

src

config/

modules/

shared/

app.ts

server.ts

Every feature contains:

controller/

service/

repository/

routes/

dto/

schemas/

types/

---

# 22. Project Roadmap

Phase 1

Foundation

Phase 2

Authentication

Phase 3

Organizations

Phase 4

Projects

Phase 5

Tasks

Phase 6

Comments

Phase 7

Labels

Phase 8

Activity Logs

Phase 9

Testing

Phase 10

Deployment

---

# 23. Engineering Principles

- Keep controllers thin.
- Keep business logic in services.
- Repositories only access the database.
- Prefer composition over duplication.
- Design before coding.
- Document architectural decisions.
- Add dependencies only when needed.
- Build features incrementally.
- Write code that your future self can understand.

---

# 24. Definition of Done

A feature is complete only when:

- Requirements documented
- Database updated (if needed)
- API implemented
- Validation added
- Tests written
- Documentation updated
- Code reviewed
- Merged into main
