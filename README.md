<div align="center">
  <h1 align="center">🏫 EduSphere - Student Management System</h1>
  <p align="center">
    A modern, high-performance, and secure system for managing students, teachers, and school operations.
    <br />
    <a href="#features"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="#">View Demo</a>
    ·
    <a href="#">Report Bug</a>
    ·
    <a href="#">Request Feature</a>
  </p>
</div>

<!-- ABOUT THE PROJECT -->
## 📝 About The Project

**EduSphere** (formerly NewEduSystem) is a comprehensive web application designed to streamline and centralize the management of educational institutions. It provides dedicated interfaces for both **Students** and **Teachers**, offering features such as timetable management, user authentication, profile management, and more.

Built with a robust tech stack, the system ensures high scalability, top-tier security, and an excellent user experience.

### 🚀 Key Features

*   🔐 **Secure Authentication**: Role-based Access Control (RBAC) utilizing secure JWT, bcryptjs password hashing, and advanced CORS/Helmet protection.
*   👥 **User Management**: Dedicated portals and management tools for both students and teachers.
*   📅 **Advanced Timetables**: Dynamic timetable integration with EXCEL/WORD export functionality.
*   🎵 **Media Integration**: Built-in support for importing and playing YouTube music links (bypassing bot detection).
*   📊 **Analytics Dashboard**: Interactive charts using Recharts.
*   ⚡ **Modern UI/UX**: Fully responsive, accessible, and highly aesthetic interface built with TailwindCSS and Lucide React.
*   🛡️ **Security Hardened**: Protected against common vulnerabilities, implement strict rate-limiting, and sanitized inputs.

### 🛠 Built With

**Frontend:**
*   ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) **React 19**
*   ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) **Vite**
*   ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) **TypeScript**
*   ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) **Tailwind CSS v4**

**Backend:**
*   ![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) **NestJS 11**
*   ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white) **Prisma ORM**
*   ![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) **PostgreSQL**

<!-- GETTING STARTED -->
## ⚙️ Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [PostgreSQL](https://www.postgresql.org/) database running locally or via Docker.
*   `npm` package manager

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/your-username/NewEduSystem.git
    cd NewEduSystem
    ```

2.  **Setup the Backend**
    ```sh
    cd backend
    npm install
    # Copy the example env file and update with your PostgreSQL credentials
    cp .env.example .env
    npx prisma generate
    npx prisma db push
    npm run start:dev
    ```

3.  **Setup the Frontend**
    ```sh
    # In a new terminal tab/window
    cd frontend
    npm install
    cp .env.example .env
    npm run dev
    ```

<!-- CONTRIBUTING -->
## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## ✉️ Contact

Project Link: [https://github.com/your-username/NewEduSystem](https://github.com/your-username/NewEduSystem)
