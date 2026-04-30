# TaskFlow — Team Task Manager

A full-stack web application where users can create projects, assign tasks, and track progress with role-based access control (Admin/Member).

## 🚀 Features

- **Authentication**: Secure signup/login with JWT tokens and bcrypt password hashing
- **Project Management**: Create, update, and delete projects
- **Team Management**: Add/remove team members by email with role assignment
- **Task Management**: Create, assign, and track tasks with status (TODO → In Progress → Done), priority (Low/Medium/High), and due dates
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full CRUD on tasks, manage members, edit/delete project
  - **Member**: View project & tasks, update status of assigned tasks
- **Dashboard**: Aggregate stats, project progress, overdue tasks, recent activity
- **Responsive Design**: Works on desktop, tablet, and mobile

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt |
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (Custom Design System) |
| Deployment | Railway |

## 📦 Project Structure

```
├── server/                  # Express API
│   ├── prisma/schema.prisma # Database schema
│   ├── src/
│   │   ├── index.js         # Entry point
│   │   ├── middleware/       # Auth & RBAC
│   │   ├── routes/           # API routes
│   │   ├── controllers/      # Business logic
│   │   └── utils/            # Validation
│   └── package.json
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/           # Dashboard, Projects, etc.
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth state management
│   │   └── api/             # Axios API client
│   └── package.json
└── README.md
```

## 🛠️ Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database

### 1. Clone the repository
```bash
git clone <repo-url>
cd ETHARA
```

### 2. Setup Backend
```bash
cd server
cp .env.example .env
# Edit .env with your database URL and JWT secret
npm install
npx prisma migrate dev --name init
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get profile |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/members` | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/project/:projectId` | List tasks |
| POST | `/api/tasks/project/:projectId` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| PATCH | `/api/tasks/:id/status` | Update status |
| DELETE | `/api/tasks/:id` | Delete task |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get stats |

## 🚀 Deployment (Railway)

1. Push code to GitHub
2. Create a new Railway project
3. Add a PostgreSQL service
4. Add backend service (root dir: `server`, start: `npm start`)
5. Add frontend service (root dir: `client`, build: `npm run build`)
6. Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`
7. Deploy!

## 📝 License
MIT
