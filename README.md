## Backend Overview

The backend of the Academic Feedback Management System is designed to be secure, scalable, and modular.  
It follows a RESTful architecture and separates concerns using a controller–service–model pattern to ensure maintainability and clarity.

---

## Backend Responsibilities

- Handle authentication and authorization using Passport.js
- Manage role-based access for Admin and Faculty
- Provide REST APIs for subjects, faculties, feedback, and reports
- Ensure anonymous and single-time feedback submission
- Perform data validation and error handling
- Generate AI-based feedback summaries
- Serve structured analytics data for dashboards

---

## Backend Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose ODM)
- Passport.js for authentication
- Express middleware for validation and security

---

## API Design

The backend exposes RESTful APIs organized by feature modules:

- `/api` - starting all APIs with this
- `/login` – Authentication and session handling
- `/faculty` – Faculty management and subject assignment
- `/admin` – Subject creation and management
- `/superadmin` – Feedback submission and retrieval
- `/dashboard` – Aggregated feedback analytics and summaries
- `/student` - for feedback for submission

All protected routes are secured using role-based middleware.

---

## Authentication & Authorization

- Passport.js handles user authentication
- Session-based authentication with secure cookies
- Role-based access control ensures:
  - Only Admins can manage faculties and subjects
  - Faculty can only access their own feedback
  - Students remain anonymous in feedback records

---

## Data Security & Integrity

- Student identity is never stored with feedback responses
- One-feedback-per-student-per-subject enforcement
- Centralized error handling middleware

---

## Backend Architecture Highlights

- MVC-style project structure
- Modular routing and controllers
- Reusable middleware for authentication and authorization
- Scalable MongoDB schema design
- Clean separation between business logic and routing

---

## Backend Folder Structure

/server
├── controllers
├── routes
├── models
├── middleware
├── config
└── server.js

## Starting the Backend Server Locally

Follow the steps below to run the Node.js backend server on your local machine.

### Prerequisites

- Node.js (v16 or higher recommended)
- MongoDB (local instance or MongoDB Atlas)
- npm (comes with Node.js)

### Steps to Start the Server

1. Navigate to the backend directory:

````bash
cd server


### Install Backend Dependencies

Install all required backend packages:
```bash
npm install
````

## Create a .env file inside the server directory and add the following:

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

## Start the Development Server

### Run the backend server in development mode:

```bash
npm run dev
```

## Start the Server in Production Mode

### Run the backend server in production mode:

```
npm start
```

You should see a confirmation message in the console indicating that the server has started successfully and the database connection is established.
