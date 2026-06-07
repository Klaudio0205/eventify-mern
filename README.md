# Eventify

Eventify is a MERN full-stack platform for live events and ticket booking. The application allows users to browse events, reserve tickets, manage their tickets, leave reviews, and interact with role-based dashboards for organizers and administrators.

## Project Overview

The platform was developed as a web course project and follows a full-stack MERN architecture:

- **MongoDB** for database storage
- **Express.js** and **Node.js** for the REST API
- **React** for the frontend interface
- **Redux Toolkit + RTK Query** for state management and API communication
- **JWT authentication** for protected routes
- **bcrypt password hashing** for secure user passwords

## Main Features

- User registration and login
- JWT-based authentication
- Role-based authorization: Admin, Organizer, User
- Event listing with search, filters, sorting, and pagination
- Event details page with banner, venue, agenda, rules, gallery, rating, and countdown
- Ticket booking system
- Ticket types: Regular, VIP, Student
- Seat selection for seated events
- Quantity selector for standing events
- Double booking prevention for occupied seats
- My Tickets page
- Reviews and ratings
- Favorites
- Organizer dashboard
- Admin dashboard with statistics and analytics
- CSV export for organizer attendees
- Seed script with demo users, events, bookings, reviews, categories, and venues
- Postman collection for API testing

## User Roles

### User

A user can browse events, filter/search events, book tickets, view their tickets, cancel bookings, add favorites, and leave reviews.

### Organizer

An organizer can manage their own events, view reservations for those events, check attendees, and export attendee data as CSV.

### Admin

An admin can manage users, events, categories, and view global dashboard statistics such as total users, total events, bookings, revenue, popular categories, and top organizers.

## Technologies Used

### Frontend

- React
- React Router
- Redux Toolkit
- RTK Query
- Vite
- CSS
- lucide-react

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- dotenv
- cors
- morgan

## Project Structure

```text
eventify-mern/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── seed.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── api/
│   │   │   └── auth/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── DEMO_ACCOUNTS.md
├── Eventify_Postman_Collection.json
├── Eventify_Postman_Environment.json
├── package.json
└── README.md
```

## Installation

Clone the repository:

```bash
git clone https://github.com/Klaudio0205/eventify-mern.git
cd eventify-mern
```

Install backend and frontend dependencies:

```bash
npm run install-all
```

Or install them separately:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Environment Variables

Create a `.env` file inside `backend` based on `backend/.env.example`:

```env
PORT=5050
MONGO_URI=mongodb://127.0.0.1:27017/eventify
JWT_SECRET=eventify_secret_key
CLIENT_URL=http://localhost:5175
```

Create a `.env` file inside `frontend` based on `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5050/api
```

The real `.env` files are intentionally ignored by git.

## Seed Data

The backend includes a seed script for demo data:

```bash
cd backend
npm run seed
```

The seed data includes demo users, organizers, admin account, categories, venues, events, bookings, and reviews.

## Running the Project

Start backend and frontend together from the root folder:

```bash
npm run dev
```

Or run them separately:

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Open the application in the browser:

```text
http://localhost:5175
```

Backend API runs at:

```text
http://localhost:5050/api
```

## Demo Accounts

More details are available in `DEMO_ACCOUNTS.md`.

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@eventify.test | Admin123! |
| Organizer | organizer1@eventify.test | Organizer123! |
| Organizer | organizer2@eventify.test | Organizer123! |
| User | user1@eventify.test | User123! |
| User | user2@eventify.test | User123! |

## API Endpoints

### Auth

```text
POST /api/auth/register
POST /api/auth/login
```

### Events

```text
GET    /api/events
GET    /api/events/:id
POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id
GET    /api/events/:id/attendees
```

### Bookings

```text
GET    /api/bookings
POST   /api/bookings
PUT    /api/bookings/:id
DELETE /api/bookings/:id
GET    /api/bookings/dashboard
```

### Reviews

```text
GET    /api/reviews
POST   /api/reviews
PUT    /api/reviews/:id
DELETE /api/reviews/:id
```

### Categories

```text
GET    /api/categories
POST   /api/categories
GET    /api/categories/:id
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Users

```text
GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

### Favorites

```text
GET    /api/favorites
POST   /api/favorites
DELETE /api/favorites/:eventId
```

## Postman Testing

The repository includes Postman files:

```text
Eventify_Postman_Collection.json
Eventify_Postman_Environment.json
```

Import both files in Postman, select `Eventify Local Environment`, and run the collection.

The collection tests:

- Login for User/Admin/Organizer
- JWT protected routes
- Event listing
- Event details
- Booking creation
- My Tickets
- Seat booking
- Double booking prevention
- Admin dashboard
- Organizer dashboard
- Category CRUD

## Academic Requirements Checklist

| Requirement | Status |
| --- | --- |
| React Hooks | Completed |
| React Router | Completed |
| Redux Toolkit | Completed |
| RTK Query | Completed |
| Node.js + Express | Completed |
| MongoDB + Mongoose | Completed |
| JWT Authentication | Completed |
| bcrypt Password Hashing | Completed |
| CRUD GET/POST/PUT/DELETE | Completed |
| Protected Routes | Completed |
| Role-Based Authorization | Completed |
| Backend routes/models/controllers/middlewares | Completed |
| `.env` and `.env.example` | Completed |
| `.gitignore` | Completed |
| Seed Script | Completed |
| Booking System | Completed |
| Seat Selection | Completed |
| Organizer Dashboard | Completed |
| Admin Dashboard | Completed |
| Postman API Testing | Completed |

## Notes

This project is designed to run locally. GitHub hosts the source code, while the application itself requires MongoDB, backend, and frontend servers to be started on the local machine.
