# 🎬 Movie API (Challenge 2)

A scalable RESTful API built with NestJS to manage movie catalogs and user interactions. Beyond standard CRUD capabilities, the system implements complex business rules to maintain data consistency, ensuring secure user registration and referential integrity within personal movie lists and ratings..

Developed with **TypeScript** and a robust **SQL** database, the architecture adheres strictly to **Clean Code** to ensure maintainability and scalability.

<br> </br>

# 📋 Table of Contents
* [Features](#-features)
* [Getting Started](#-getting-started)
* [Prerequisites](#-prerequisites)
* [Installation](#-installation)
* [Running Tests](#-running-tests)
* [Deployment](#-deployment)
* [Docker](#-docker)
* [Built With](#-built-with)
* [Authors](#-authors)
* [License](#-license)
* [Acknowledgments](#-acknowledgments)

---
<br> </br>

# ✨ FEATURES

## 🔐 AUTH & USERS

This section documents the endpoints related to user authentication and management.

---
### 🔑 Login
**POST** `/auth/login`

Authenticates the user to access protected routes.

**Request Body**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | string | **Yes** | An email registered in the database |
| `password` | string | **Yes** | The correct password for the given email |

**Responses**
| Code | Description |
| :--- | :--- |
| `200` | Authenticated successfully |
| `401` | Unauthorized |
| `404` | Email not found |

**Request Example**
```json
{
  "email": "user@email.com",
  "password": "123456"
}
```

**Response Example**
```json
{
  "user": {
    "id": 1,
    "name": "user",
    "email": "user@email.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 👤 Create User
**POST** `/users`

Creates a new user with an encrypted password.

**Request Body**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | **Yes** | User full name |
| `email` | string | **Yes** | User email address (must be unique) |
| `password` | string | **Yes** | User password |

**Responses**
| Code | Description |
| :--- | :--- |
| `201` | Created successfully |
| `400` | Bad request (Validation error) |

**Request Example**
```json
{
  "name": "Example User",
  "email": "user@email.com",
  "password": "123456"
}
```

**Response Example**
```json
{
  "id": 1,
  "name": "Example User",
  "email": "user@email.com",
  "password": "$2b$10$UykW6VaTwjhJB1x9nEvlI.EklKVSxl0PCli/A1N/hnYLjXNmP.IO."
}
```

---

### 👥 List Users
**GET** `/users`

Returns all users in the database.

**Responses**
| Code | Description |
| :--- | :--- |
| `200` | A list of all users |

**Response Example**
```json
[
  {
    "id": 1,
    "name": "Example User",
    "email": "user@email.com"
  }
]
```

---

### 👤 Get User by ID
**GET** `/users/{id}`

Retrieves a specific user by their ID.

**Route Parameters**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | number | **Yes** | User ID in the database |

**Responses**
| Code | Description |
| :--- | :--- |
| `200` | User found |
| `404` | User not found |

**Response Example**
```json
{
  "id": 1,
  "name": "Example User",
  "email": "user@email.com",
  "password": "$2b$10$UykW6VaTwjhJB1x9nEvlI.EklKVSxl0PCli/A1N/hnYLjXNmP.IO."
}
```
---
### ❓ Forgot Password
**POST** `/users/forget`

Initiates the password recovery process by sending an email containing the reset instructions. In the development environment, it returns the link to the mocked email (Ethereal).

**Request Body**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | string | **Yes** | User registered email address |

**Responses**

| Code | Description |
| :--- | :--- |
| `201` | Recovery email sent successfully |
| `404` | Email not found |

**Request Example**

```json
{
  "email": "user@email.com"
}
```

**Response Example**

```json
{
  "messageId": "<e9892df5-e583-8ff4-184b-1525aee1260c@movies.com>",
  "previewUrl": "[https://ethereal.email/message/aXu0J4Fu3sRn3E5KaXzjjJSkaEEGR6](https://ethereal.email/message/aXu0J4Fu3sRn3E5KaXzjjJSkaEEGR6)..."
}
```

---
### 🔄 Reset Password
**PATCH** `/users/reset`

Resets the user's password using a valid recovery token. This endpoint verifies if the provided token matches the email and validates the signature before updating the password.

**Request Body**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | string | **Yes** | User email address |
| `token` | string | **Yes** | Valid JWT recovery token |
| `password` | string | **Yes** | New password |

**Responses**
| Code | Description |
| :--- | :--- |
| `200` | Password changed successfully (Returns updated user) |
| `400` | Invalid Token, Expired Token or Email mismatch |

**Request Example**
```json
{
  "email": "user@email.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "password": "newPassword123"
}
```

**Response Example**

```json
{
  "id": 1,
  "name": "Example User",
  "email": "user@email.com",
  "password": "$2b$10$NewHash..."
}
```
---

### 🔒 Update User
**PATCH** `/users`

Updates the authenticated user's password.
* **Authentication:** Required (`Bearer token`)

**Headers**
| Header | Value |
| :--- | :--- |
| `Authorization` | Bearer `<token>` |

**Request Body**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `password` | string | **Yes** | New password |

**Responses**
| Code | Description |
| :--- | :--- |
| `200` | User updated successfully |
| `401` | Unauthorized |

**Request Example**
```json
{
  "password": "newPassword123"
}
```

---

### 🔒 Remove User
**DELETE** `/users`

Deletes the authenticated user from the database.
* **Authentication:** Required (`Bearer token`)

**Headers**
| Header | Value |
| :--- | :--- |
| `Authorization` | Bearer `<token>` |

**Responses**
| Code | Description |
| :--- | :--- |
| `200` | Removed successfully |
| `401` | Unauthorized |

**Response Example**
```json
{
  "deletedUserID": 12
}
```
<br> </br>
## 🎬 MOVIES CATALOG

This section documents the endpoints for managing the movie catalog.

---

### 🌍 List Movies
**GET** `/movies`

Lists movies with support for pagination, filtering, and sorting.
* **Access:** Public (No authentication required)

**Query Parameters**
| Parameter | Type | Description | Options |
| :--- | :--- | :--- | :--- |
| `page` | number | Page number for pagination | - |
| `title` | string | Filter by movie title | - |
| `genre` | string | Filter by genre | - |
| `releaseYear` | number | Filter by release year | - |
| `orderBy` | string | Sort the results | `title`, `oldest`, `newest`, `highest`, `lowest` |

**Responses**
| Code | Description |
| :--- | :--- |
| `200` | Returns a list of movies (default: first 10) |

**Request Example**
```http
GET /movies?title=Inception&genre=Sci-Fi&orderBy=newest
```

---

### 🌍 Get Movie by ID
**GET** `/movies/{id}`

Retrieves details of a specific movie.
* **Access:** Public (No authentication required)

**Route Parameters**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | number | **Yes** | The ID of the movie to retrieve |

**Responses**
| Code | Description |
| :--- | :--- |
| `200` | Returns the movie details |
| `404` | Movie not found |

**Response Example**
```json
{
  "id": 1,
  "title": "Inception",
  "description": "A thief who steals corporate secrets...",
  "releaseYear": 2010,
  "duration": 8880,
  "genre": "Sci-Fi",
  "avgRating": 8.8
}
```

---

### 🔒 Create Movie
**POST** `/movies`

Creates a new movie in the catalog.
* **Authentication:** Required (`Bearer token`)

**Request Body**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | string | **Yes** | The title of the movie |
| `description` | string | **Yes** | A description of the movie |
| `releaseYear` | number | **Yes** | Release year (1800 - Current Year) |
| `duration` | number | **Yes** | Duration in seconds |
| `genre` | string | **Yes** | The specific genre(s) |

**Responses**
| Code | Description |
| :--- | :--- |
| `201` | Created successfully (Returns movie with ID) |
| `400` | Bad Request (Validation error) |

**Request Example**
```json
{
  "title": "Interstellar",
  "description": "A team of explorers travel through a wormhole...",
  "releaseYear": 2014,
  "duration": 10140,
  "genre": "Sci-Fi"
}
```

---

### 🔒 Update Movie (Full)
**PUT** `/movies/{id}`

Updates **all** fields of a movie.
* **Authentication:** Required (`Bearer token`)

**Route Parameters**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | number | **Yes** | The ID of the movie to update |

**Request Body**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | string | **Yes** | The title of the movie |
| `description` | string | **Yes** | A description of the movie |
| `releaseYear` | number | **Yes** | Release year (1800 - Current Year) |
| `duration` | number | **Yes** | Duration in seconds |
| `genre` | string | **Yes** | The specific genre(s) |

**Responses**
| Code | Description |
| :--- | :--- |
| `200` | Movie updated successfully |
| `404` | Movie not found |

**Request Example**
```json
{
  "title": "Interstellar (Remastered)",
  "description": "Updated description...",
  "releaseYear": 2014,
  "duration": 10140,
  "genre": "Sci-Fi"
}
```

---

### 🔒 Update Movie (Partial)
**PATCH** `/movies/{id}`

Updates specific fields of a movie.
* **Authentication:** Required (`Bearer token`)

**Route Parameters**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | number | **Yes** | The ID of the movie to update |

**Request Body**
*(All fields are optional, send only what you want to change)*

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `title` | string | The title of the movie |
| `description` | string | A description of the movie |
| `releaseYear` | number | Release year (1800 - Current Year) |
| `duration` | number | Duration in seconds |
| `genre` | string | The specific genre(s) |

**Responses**
| Code | Description |
| :--- | :--- |
| `200` | Movie updated successfully |
| `404` | Movie not found |

**Request Example**
```json
{
  "description": "New description only"
}
```

---

### 🔒 Delete Movie
**DELETE** `/movies/{id}`

Removes a movie from the catalog.
* **Authentication:** Required (`Bearer token`)

**Route Parameters**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | number | **Yes** | The ID of the movie to delete |

**Responses**
| Code | Description |
| :--- | :--- |
| `200` | Movie deleted (Returns the deleted ID) |
| `404` | Movie not found |

**Response Example**
```json
{
  "deletedMovieId": 1
}
```
<br> </br>
## 📝 PERSONAL LIST

This module allows authenticated users to manage their own private collection of movies.

> 🔒 **Note:** All endpoints in this section require a valid Bearer Token in the `Authorization` header.

---

### ➕ Add to List
**POST** `/personal-list`

Adds a movie from the general catalog to the user's personal list.

**Request Body**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `movieId` | number | **Yes** | ID of the movie to add |

**Responses**
| Code | Description |
| :--- | :--- |
| `201` | Movie successfully added |
| `400` | Movie not found in catalog |
| `409` | Movie already exists in your personal list |

**Request Example**
```json
{
  "movieId": 1
}
```

---

### 📜 List Personal Movies
**GET** `/personal-list`

Retrieves all movies added by the authenticated user with full details and pagination.

**Query Parameters**
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `page` | number | Optional. The page number to retrieve (starts at 0). Example: /personal-list?page=1  |

**Responses**
| Code | Description |
| :--- | :--- |
| `200` | Returns the list with metadata |

**Response Example (200)**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Inception",
      "description": "...",
      "releaseYear": 2010,
      "genre": "Sci-Fi",
      "duration": 8880,
      "avgRating": 0,
      "totalRatings": 0
    }
  ],
  "meta": {
    "total": 1,
    "page": 0,
    "lastPage": 0
  }
}
```

---

### ❌ Remove from List
**DELETE** `/personal-list/{movieId}`

Removes a specific movie from the user's personal list.

**Route Parameters**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `movieId` | number | **Yes** | ID of the movie to remove |

**Responses**
| Code | Description |
| :--- | :--- |
| `200` | Removed successfully |

**Response Example (200)**
```json
{
  "id": 1,
  "userId": 1,
  "movieId": 1
}
```
---

### 🧠 Applied Business Rules

* **Safety:** Users can only manage their own lists.
* **Integrity:** Prevents duplicate entries (returns `409 Conflict`).
* **Architecture:** Uses DTOs for validation and Mappers for data transformation.
* **Monitoring:** Operations logged via NestJS Logger.

<br></br>
# ⭐ RATINGS SYSTEM

This module manages the lifecycle of user movie ratings. It implements strict **data integrity rules**, ensuring that movie statistics (such as `avgRating` and `totalRatings`) are automatically synchronized with submitted scores.

> 🔒 **Note:** All endpoints in this section require a valid Bearer Token in the `Authorization` header.

---

### 📝 Rate a Movie
**POST** `/ratings`

Assigns a score to a movie. The system automatically detects if the user has already rated the movie: if so, it updates the existing rating; otherwise, it creates a new one.

**Request Body**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `movieId` | number | **Yes** | ID of the movie to rate |
| `score` | number | **Yes** | Value between 0 and 10 (decimals allowed) |

**Responses**
| Code | Description |
| :--- | :--- |
| `201` | Rating created/updated successfully |
| `400` | Invalid score (must be 0-10) or Movie not found |

**Request Example**
```json
{
  "movieId": 10,
  "score": 9.5
}
```

---

### 📜 List My Ratings
**GET** `/ratings`

Retrieves all ratings made by the authenticated user with pagination support.

**Query Parameters**
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `page` | number | Page number (starts at 1) |

**Responses**
| Code | Description |
| :--- | :--- |
| `200` | Returns the list of ratings with metadata |

**Response Example (200)**
```json
{
  "data": [
    {
      "id": 15,
      "score": 9,
      "userId": 1,
      "movieId": 10,
      "movie": {
        "title": "Inception",
        "releaseYear": 2010
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "lastPage": 1
  }
}
```

---

### 🔄 Update a Rating
**PATCH** `/ratings/{id}`

Updates a specific rating score. This action triggers a recalculation of the movie's average rating.

**Route Parameters**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | number | **Yes** | ID of the rating to update |

**Request Body**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `score` | number | **Yes** | New score (0-10) |

**Responses**
| Code | Description |
| :--- | :--- |
| `200` | Rating updated successfully |
| `403` | Forbidden (Rating belongs to another user) |
| `404` | Rating not found |

**Request Example**
```json
{
  "score": 10
}
```

---

### ❌ Delete Rating
**DELETE** `/ratings/{id}`

Removes a rating and automatically updates the movie's statistics.

**Route Parameters**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | number | **Yes** | ID of the rating to remove |

**Responses**
| Code | Description |
| :--- | :--- |
| `200` | Removed successfully |
| `403` | Forbidden (Rating belongs to another user) |

**Response Example**
```json
{
  "deletedRatingId": 15
}
```

---

### 🧠 Applied Business Rules

* **Smart Logic:** Prevents duplicate ratings for the same movie by the same user.
* **Atomic Calculation:** Updates to ratings (create, update, delete) trigger an automatic recalculation of the movie's average score within a transaction.
* **Access Control:** Users can only modify or delete their own ratings.
* **Validation:** Scores must be strictly between 0 and 10.

<br></br>

# 📂 IMPORT & EXPORT

This module handles the bulk processing of user data. It allows users to export their movies and ratings to **JSON** or **CSV** formats (sent via email) and import new movies into their lists.

> 🔒 **Note:** All endpoints in this section require a valid Bearer Token in the `Authorization` header.

---

### 📤 Export Movies
**GET** `/files/export/movies`

Generates a file containing the authenticated user's personal movie list and sends it via email.

**Query Parameters**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `format` | string | No | Output format: `json` or `csv` (Default: `json`) |

**Responses**
| Code | Description |
| :--- | :--- |
| `200` | Process started (File sent to email) |

**Response Example**
```json
{
  "file": "movies-abc123.json",
  "sentTo": "user@email.com",
  "format": "json"
}
```

---

### 📤 Export Ratings
**GET** `/files/export/ratings`

Generates a file containing all ratings created by the authenticated user and sends it via email.

**Query Parameters**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `format` | string | No | Output format: `json` or `csv` (Default: `json`) |

**Responses**
| Code | Description |
| :--- | :--- |
| `200` | Process started (File sent to email) |

**Response Example**
```json
{
  "file": "ratings-abc456.csv",
  "sentTo": "user@email.com",
  "format": "csv"
}
```

---

### 📥 Import Movies
**POST** `/files/import/movies`

Imports movies from a file into the authenticated user's personal list. The system validates the data and prevents duplicate associations.

**Request Body (Multipart/Form-Data)**
| Key | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `file` | file | **Yes** | A valid `.json` or `.csv` file |

**Data Validation (DTO)**
The imported file must contain the following fields:
* `title` (string)
* `description` (string)
* `releaseYear` (number: 1800 - Current)
* `duration` (integer)
* `genre` (string)

**Responses**
| Code | Description |
| :--- | :--- |
| `201` | Import successful |
| `400` | Validation failed or Invalid file format |

**Response Example**
```json
{
  "imported": 5
}
```

---

###

---
<br> </br>

## 🚀 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### 🛠️ Prerequisites

Ensure you have the following tools installed:

* **Node.js** `v22.12.0`
* **npm**
* **Docker & Docker Compose** (Required for the database)

### 🔧 Installation

Follow these steps to set up the environment:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/jgpeixoto/AT3-MoviesAPI2.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd AT3-MoviesAPI2
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Environment Variables Configuration:**
    Copy the `.env.example` file to `.env` and configure your database credentials and secret keys:
    * Linux/Mac: `cp .env.example .env`
    * Windows: `copy .env.example .env`
    
    > **Note:** Ensure the `DATABASE_URL` in `.env` matches the credentials defined in `docker-compose.yml`.

5.  **Start the Database:**
    Use Docker Compose to start the PostgreSQL service:
    ```bash
    docker-compose up -d
    ```

6.  **Run Prisma Migrations:**
    Once the database is running, apply the migrations to create the tables and generate the Prisma Client:
    ```bash
    npx prisma migrate dev
    ```

7.  **Start the application:**
    ```bash
    # Development mode
    npm run start:dev
    ```

---

## ⚙️ Running Tests

The project includes unit test coverage as required by the challenge.

### 🔩 Unit Tests

To run the full test suite:
```bash
npm run test
```

### ⌨️ Test Coverage

To check the code coverage percentage:
```bash
npm run test:cov
```

---

## 📦 Deployment

Scripts configured for the application lifecycle:

1.  **Build the project:**
    ```bash
    npm run build
    ```

2.  **Run in production mode:**
    ```bash
    npm run start:prod
    ```

---


## 🐳 Docker

The project uses Docker exclusively to host the **PostgreSQL Database**. This ensures a consistent database environment without requiring a local Postgres installation.

### 📂 Configuration

* **`docker-compose.yml`**: Configures the PostgreSQL service, ports, and volume persistence required by the API.

### 🚀 Starting the Database

Before running the application, you must start the database container. Make sure **Docker Desktop** is running and execute:

```bash
docker-compose up -d
```

> ⚠️ **Note:** Once the database is running, you can start the application locally using `npm run start:dev`.

### 🎮 Useful Commands

| Action | Command | Description |
| :--- | :--- | :--- |
| **Start DB** | `docker-compose up -d` | Starts the PostgreSQL container in the background. |
| **Stop DB** | `docker-compose stop` | Pauses the database without losing data. |
| **Clean DB** | `docker-compose down` | Stops and removes the container (data may be lost if volumes aren't persistent). |

---

## 🛠️ Built With

Mandatory tools and patterns used in development:

* <kbd>NestJS</kbd> - Backend Framework.
* <kbd>TypeScript</kbd> - Main Language with strict typing.
* <kbd>Prisma</kbd> - Modern ORM & Type-safe database client.
* <kbd>SQL</kbd> - Relational Database logic.
* <kbd>JWT</kbd> - Authentication Standard.

## ✒️ Authors

* **[Cesar Terra]** - *Development, Organization & Documentation* - [GitHub](https://github.com/Cesar-Chaves-Terra)
* **[Gabriel Gemelli]** - *Development, Organization & Documentation* - [GitHub](https://github.com/Gabriel-Henrique-Gemelli)
* **[João Peixoto]** - *Development, Organization & Documentation* - [GitHub](https://github.com/jgpeixoto)
* **[Ryan Fonseca]** - *Development, Organization & Documentation* - [GitHub](https://github.com/ryanfonseca-dev)
* **[Stephane B. Souza]** - *Development, Organization & Documentation* - [GitHub](https://github.com/stBruna)


## 📄 License

This project is part of a technical evaluation program.

## 🎁 Acknowledgments

Special thanks to the instruction team and Scrum Master for their support:

* Ariel Souza
* Antonio Carvalho
* Tadeu Sureto
* Ana Clara Barros

---
