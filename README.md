# MoveNest

MoveNest is a full-stack moving organization web application designed to simplify the packing and moving process. Users can organize belongings by room, manage boxes and inventory, track packing progress, and document item conditions through photos.

The application combines a React frontend, Express.js backend, and SQLite database to provide an organized interface with persistent data storage.

## Tech Stack

- **Frontend:** React, TypeScript
- **Backend:** Node.js, Express.js
- **Database:** SQLite, SQL
- **Tools:** Git, GitHub, npm

## Key Features

- **Room Management:** Organize belongings into rooms for easier inventory tracking.
- **Box Organization:** Manage boxes and associate them with specific rooms.
- **Inventory Tracking:** Keep track of items throughout the packing process.
- **Packing Progress:** Monitor packing status across rooms and boxes.
- **Photo Documentation:** Document item conditions through photos for moving-related records.
- **Data Persistence:** Store and retrieve moving inventory through backend APIs and a SQLite database.

## Technical Implementation

MoveNest follows a modular full-stack architecture that separates the user interface, application logic, and database operations.

- **Frontend:** Developed with React and TypeScript using reusable components, page-level views, and shared application state.
- **Backend:** Built with Node.js and Express.js, organizing HTTP routes, request controllers, and database services into separate modules.
- **Database:** Uses SQLite and SQL to persist application data, with a schema defined in `Backend/src/db/schema.sql`.
- **API Integration:** Connects frontend services to backend HTTP endpoints for application data retrieval and updates.

## Project Architecture

```text
React + TypeScript Frontend
           |
           v
    Frontend API Client
           |
           v
   Express.js Backend
           |
           v
     Routes / Controllers
           |
           v
     Database Services
           |
           v
      SQLite Database
```

## Requirements

- Node.js 20 or newer
- npm

## Run Locally

Clone the repository and navigate to the project directory.

Install dependencies from the repository root:

```sh
npm install
npm install --prefix Frontend
npm install --prefix Backend
```

Start the frontend and API together:

```sh
npm run dev:all
```

Open `http://localhost:5173` to access the application.

The API runs at `http://localhost:4000` and exposes `GET /api/health` for a health check.

The local SQLite database is created at `Database/movenest.db` from `Backend/src/db/schema.sql`. The database file is ignored by Git.

## Useful Commands

```sh
npm run build       # Build the frontend
npm run build:all   # Build the frontend and backend
npm run lint        # Run frontend lint checks
npm run start:server # Start the backend server
```

## Project Structure

```text
MoveNest/
├── Frontend/
│   └── src/
│       ├── pages/        # Page-level views
│       ├── components/   # Reusable UI and modal components
│       ├── context/      # Shared application state and API mutations
│       └── services/     # Frontend API client
├── Backend/
│   └── src/
│       ├── routes/       # HTTP route definitions
│       ├── controllers/  # Request handlers
│       ├── services/     # Database operations
│       └── db/           # SQLite connection and schema
└── Database/             # Local runtime database files
```

## Engineering Highlights

- Developed a full-stack application using React, TypeScript, Express.js, and SQLite.
- Organized backend functionality into separate routing, controller, and service layers for maintainability.
- Implemented persistent storage to retain moving inventory across application sessions.
- Used reusable frontend components and centralized state management to organize application functionality.

## Future Improvements

- Implement secure user authentication and account management.
- Expand inventory search and filtering capabilities.
- Improve packing progress visualization.
- Prepare the application for production deployment.

## Production Considerations

The local application currently uses a browser-stored user ID sent in the `x-user-id` header.

Before production deployment, the application requires:

- Secure authentication and authorization.
- Environment-based secret management.
- A production-ready database hosting and backup strategy.
- A configured CORS origin and additional security controls.
