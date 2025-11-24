# 🚀 Time Stat – Student Attendance Tracking System (Backend API)

This repository contains the backend API for the **Time Stat – Student Attendance Tracking System**.  
This API is responsible for managing student attendance, handling data persistence (using TiDB/MySQL), and providing utility endpoints for PDF and Excel data exports.

---

## 💻 Frontend Setup (Prerequisite)

Before starting the backend, ensure you have set up the corresponding frontend application:

- **Repository Link:** [Frontend Repository](#)
- **Follow the Frontend README**:
  1. Clone the repository.
  2. Install dependencies.
  3. Configure the frontend `.env` file.

---

## ⚙️ Backend Configuration

### 1️⃣ Environment Variables (.env)

Create a file named `.env` at the root of your backend project directory and populate it with the required configuration:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `CLOUDINARY_API_KEY` | Your Cloudinary API Key (for image uploads) | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API Secret | `aBcDeFgHiJkLmNoPqRsTuvWx` |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary Cloud Name | `my-image-cloud` |
| `DATABASE_URL` | Connection string for your MySQL/TiDB database | `mysql://user:pass@host:port/dbname` |
| `ORIGIN` | The URL of your running frontend application | `http://localhost:5173` |
| `PORT` | The port the backend server will listen on | `3000` |
| `SECRET_KEY` | A strong, random key for signing JWTs | `a-very-secret-key-123` |

---

### 2️⃣ Database Setup

The backend uses **Prisma** as the ORM.  
Execute the following command to synchronize your database schema:

```bash
# Push the schema from your Prisma models to your connected database
npx prisma db push
Note: Check prisma.txt or the project README for any additional specific Prisma commands if provided.

📦 Installation and Running
Follow these steps to get the API running locally:

1️⃣ Install Dependencies

npm install


2️⃣ Start the Server (Development Mode)


npm run dev
```
