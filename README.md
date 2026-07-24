# SofiaTech Task Management Platform

A **full-stack task management web application** developed during my internship at SofiaTech (May-August 2024).

## 🎯 Project Overview

This platform streamlines project and task management within software engineering teams, featuring real-time collaboration, role-based access control, and an intuitive Kanban interface.

### ✨ Key Features
- **👥 User Management**: Admin, Manager, and User roles with differentiated permissions
- **📊 Project Management**: Create, organize, and track projects efficiently
- **✅ Task Management**: Full task lifecycle with real-time notifications
- **📋 Kanban Interface**: Visual task board for seamless workflow
- **🔐 Secure Authentication**: JWT-based authentication with role-based access
- **🔔 Real-time Notifications**: Instant updates on task changes

---

## 🛠 Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: PostgreSQL
- **API**: RESTful API
- **Validation**: Class-validator & Pipes

### Frontend
- **Framework**: Angular 14+
- **Styling**: CSS/Bootstrap/Tailwind
- **State Management**: RxJS Observables
- **HTTP Client**: Angular HttpClient

---

## 📁 Project Structure

```
SofiaTech-TaskManagement/
├── task-manager-back/          # Backend (NestJS)
│   ├── src/
│   │   ├── auth/              # JWT authentication & strategies
│   │   ├── users/             # User management & roles
│   │   ├── projects/          # Project CRUD operations
│   │   ├── tasks/             # Task management & notifications
│   │   ├── config/            # Database & env configuration
│   │   └── main.ts
│   ├── package.json
│   └── .env.example
│
├── taskManager/                # Frontend (Angular)
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Reusable UI components
│   │   │   ├── services/      # HTTP & business logic services
│   │   │   ├── pages/         # Page components (Dashboard, Kanban, etc.)
│   │   │   ├── models/        # TypeScript interfaces
│   │   │   └── guards/        # Route & auth guards
│   │   ├── assets/
│   │   └── main.ts
│   ├── angular.json
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 16+ and npm
- **PostgreSQL** 12+
- **Angular CLI** installed globally

### Backend Setup

```bash
cd task-manager-back

npm install
```

**Create `.env` file:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/sofiatech_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h
PORT=3000
NODE_ENV=development
```

**Start the backend:**
```bash
npm run start:dev
```

✅ Server running on `http://localhost:3000`

### Frontend Setup

```bash
cd taskManager

npm install
```

**Update API URL in `src/environments/environment.ts`:**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

**Start Angular dev server:**
```bash
ng serve
```

✅ Open browser to `http://localhost:4200`

---

## 🎓 Key Technical Achievements

✅ **Authentication & Authorization**
- Implemented JWT-based authentication with secure password hashing
- Role-based access control (RBAC) with different permission levels

✅ **Real-time Features**
- Real-time task notifications using WebSockets/Server-Sent Events
- Instant UI updates across multiple users

✅ **Database Design**
- Normalized PostgreSQL schema for efficient data management
- Optimized queries for performance

✅ **Agile Development**
- Followed Scrum methodology with 2-week sprints
- 3 complete releases delivered on schedule
- Daily standups and sprint reviews

✅ **API Design**
- RESTful API with proper HTTP status codes
- Input validation and error handling
- Comprehensive error messages for debugging

---

## 📊 Development Metrics

| Metric | Value |
|--------|-------|
| **Duration** | 2 months (July-August 2024) |
| **Releases** | 3 complete releases |
| **Lines of Code** | ~8,000+ (backend + frontend) |
| **Test Coverage** | Unit tests for critical components |
| **Code Review** | Peer reviews before merging |

---

## 🔄 Git Workflow & Collaboration

- **Branch Strategy**: Feature branches with pull requests
- **Commit Convention**: Descriptive commit messages following Git conventions
- **Code Review**: Peer reviews ensuring code quality before merge
- **Tools**: Git, GitHub for version control & collaboration

---

## 🏆 Professional Impact

✅ Delivered a **production-ready** task management platform
✅ **100% uptime** during internal testing phase
✅ **Zero critical bugs** in final release
✅ **Positive feedback** from internal stakeholders and team

---

## 🎯 Learnings & Growth

Through this project, I gained:
- Deep understanding of full-stack web development
- Hands-on experience with enterprise-level frameworks (NestJS)
- Practical knowledge of JWT authentication & RBAC
- Real-world Agile & Scrum methodology
- Collaborative development in a professional environment
- Problem-solving & debugging skills

---

## 🤝 Team & Supervision

**Internship Details:**
- **Company**: SofiaTech, Tunisia
- **Department**: Software Engineering
- **Duration**: July - August 2024
- **Supervisor**: Professional guidance & mentorship

---

## 📧 Contact & Links

- **GitHub**: [github.com/Mariem-Lameri25](https://github.com/Mariem-Lameri25)
- **Email**: mariem.lameri@esprit.tn
- **LinkedIn**: [linkedin.com/in/lameri-mariem](https://linkedin.com/in/lameri-mariem)

---

## 📝 License

This project is private and created for educational/professional purposes.

---

## 🙏 Acknowledgments

Special thanks to the SofiaTech team for the incredible learning opportunity and mentorship throughout the internship!
