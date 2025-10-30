# [🚀 User Task Management System](https://user-task-management-qjc6.onrender.com/)

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-D23C2A?style=flat&logo=ejs&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=flat&logo=json-web-tokens&logoColor=white)  
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)  
![Last Commit](https://img.shields.io/github/last-commit/vipinishere/user-task-management)

A **role-based task management application** built with **Node.js, Express, MongoDB, and EJS**.  
It supports **CEO, Admin, and User roles**, task assignments, and includes **JWT authentication, CORS, Helmet security**, and **global error handling**.

---

## Live Project

## [Website](https://user-task-management-qjc6.onrender.com/)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [API Endpoints / Usage](#api-endpoints--usage)
- [Screenshots / Demo](#screenshots--demo)
- [Contribution](#contribution)
- [License](#license)
- [Optional Extras](#optional-extras)

---

## Features

- 🔐 **JWT Authentication** for secure login
- 👤 **Role-based Access Control**: CEO, Admin, User
- 📋 **CRUD Operations** for tasks
- 🛡️ **Security**: CORS, Helmet
- ⚡ **Global Error Handling** with centralized error page
- ✅ **Assign tasks** to users (Admin/CEO)
- 📊 **View dashboard** for tasks based on roles

---

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB + Mongoose
- **Frontend**: EJS templating
- **Security**: JWT, CORS, Helmet
- **Error Handling**: Global middleware for errors

---

## Project Structure

```bash
user-task-management/
├── config/      # Database Connection & Constants
├── controllers/      # Business logic for auth, tasks, users
├── middlewares/      # Auth, role-based access, error handling
├── models/           # MongoDB Schemas (User, Task)
├── public/           # Public files
├── routes/           # Route definitions
├── utils/            # Helper functions
├── views/            # EJS templates
├── app.js            # Express app configuration
├── server.js         # Server entry point
└── .env              # Environment variables

---

```

## Installation & Setup

1. **Clone the repository**

```bash
git clone https://github.com/your-username/user-task-management.git
cd user-task-management
```

2. **Install Dependancies**

```bash
npm install
```

3. **Setup environment veriable in .env**

```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

4. **Run Server**

```bash
npm start
```

5. **Access the App**

Open http://localhost:5000 in your browser

---

## API Endpoints / Usage

| Method | Endpoint       | Description         | Access Role |
| ------ | -------------- | ------------------- | ----------- |
| POST   | /auth/register | Register a new user | Public      |
| POST   | /auth/login    | Login & get JWT     | Public      |
| GET    | /tasks         | Get own tasks       | User        |
| POST   | /tasks         | Create new task     | User/Admin  |
| PUT    | /tasks/:id     | Update a task       | User/Admin  |
| DELETE | /tasks/:id     | Delete a task       | User/Admin  |
| GET    | /users         | Get all users       | Admin/CEO   |
| POST   | /tasks/assign  | Assign task to user | Admin/CEO   |
| GET    | /all-tasks     | Get all tasks       | CEO         |
| GET    | /all-users     | Get all users       | CEO         |

> Optional: You can use **Postman** or **Insomnia** to test these endpoints.

## Screenshots / Demo

> Add visual references for different roles and key features

### CEO Dashboard

![CEO Dashboard](path-to-ceo-dashboard.png)

### Admin Dashboard

![Admin Dashboard](path-to-admin-dashboard.png)

### User Dashboard

![User Dashboard](path-to-user-dashboard.png)

> Optional: You can add GIFs to show task creation or assignment.

## Contribution

1. Fork the repository
2. Create a new branch: `feature/your-feature-name`
3. Commit your changes
4. Push the branch
5. Open a Pull Request

> Optional:

- Follow consistent code formatting and linting rules
- Provide clear commit messages
- Include screenshots if you add new UI features

## License

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for more details.
