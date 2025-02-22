# Edu-Task-Hub (Backend)

## Description
Edu-Task-Hub's backend is powered by Express.js and MongoDB, handling authentication, task management, and real-time synchronization. The backend ensures that user tasks are securely stored and updated in real-time.

## Technologies Used
- **Backend:** Express.js, Node.js, MongoDB
- **Authentication:** Firebase Authentication (Google Sign-In)
- **Real-Time Sync:** MongoDB Change Streams / WebSockets / Optimistic UI Updates

## API Endpoints
- `POST /tasks` – Add a new task
- `GET /tasks` – Retrieve all tasks for the logged-in user
- `PUT /tasks/:id` – Update task details (title, description, category)
- `DELETE /tasks/:id` – Delete a task

## Installation
### Prerequisites
- Node.js & npm installed
- MongoDB set up

### Setup
```sh
cd backend
npm install
npm start