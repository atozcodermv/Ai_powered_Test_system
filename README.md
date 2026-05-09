# Smart_Exam

## Introduction
**Smart_Exam** is a comprehensive and secure AI-powered EdTech web application designed to facilitate seamless online examinations. It provides a robust platform for educational institutions to conduct, manage, and monitor exams digitally. The application solves the problem of traditional, paper-based testing by offering a scalable digital alternative that includes advanced proctoring, AI-based question generation, and real-time communication. By bridging the gap between teachers and students, Smart_Exam ensures academic integrity and simplifies the assessment process.

## Key Features
- **Role-Based Access Control:** Distinct roles and dashboards for Admins, Teachers, and Students.
- **Exam Management:** Create, schedule, and manage both Multiple Choice Questions (MCQ) and Descriptive exams.
- **AI Integration:** Features an AI Chatbot and AI-driven automated question generation, powered by Google GenAI (Gemini).
- **Grading & Results System:** Automated evaluation for MCQs and structured interfaces for descriptive grading. Students can easily track their performance over time.
- **Real-Time Notifications & Chat:** Built-in messaging and alert system using WebSockets (StompJS).
- **Proctoring & Anti-Cheating Monitoring:** Intelligent tab-switching detection that automatically submits the exam and logs the cheating incident if a student navigates away from the test window.
- **Media Support:** Secure image and file uploads via Cloudinary.
- **Automated Emails:** Registration, OTPs, and alerts integrated with the Brevo API.

## Project Structure Overview
The project is split into two distinct repositories/directories for the frontend and backend:
- **`Smart_Exam` (Frontend):** Contains the React application. Built with Create React App, Material UI, Bootstrap, and Chart.js for building a responsive, interactive user interface.
- **`SmartExam` (Backend):** Contains the Spring Boot 3 Java application. Provides RESTful APIs, handles business logic, security (JWT), database interactions (MySQL), and AI/WebSocket integrations.

## Technologies Used
### Frontend
- **React 18** & React Router DOM
- **Material UI (MUI)** & **Bootstrap**
- **Axios** (API communication)
- **Chart.js** (Data visualization)
- **StompJS / SockJS** (WebSockets)

### Backend
- **Java 21** & **Spring Boot 3.2.2**
- **Spring Security** & **JWT** (Authentication)
- **Spring Data JPA** & **MySQL** (Database)
- **Spring AI (Google GenAI)**
- **Spring WebSocket**
- **Spring Mail (Brevo API)**
- **Cloudinary** (Media storage)
- **Docker** (Containerization)

## Startup/Setup Guide
### Prerequisites
- Node.js & npm
- Java 21 & Maven
- MySQL Server

### Backend Setup (SmartExam)
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Configure the environment variables. Update the `.env` file or `src/main/resources/application.properties` with your credentials:
   ```env
   # Database
   DB_URL=jdbc:mysql://localhost:3306/exam_portal
   DB_USERNAME=your_db_username
   DB_PASSWORD=your_db_password

   # Gemini AI
   GEMINI_API_KEY=your_gemini_api_key

   # Cloudinary
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_SECRET=your_cloudinary_secret
   # AWS Rekognition
   aws.rekognition.access-key=${AWS_REKOGNITION_ACCESS_KEY}
   aws.rekognition.secret-key=${AWS_REKOGNITION_SECRET_KEY}
   aws.rekognition.region=${AWS_REGION}

   # Email (Brevo)
   MAIL_USERNAME=your_brevo_email
   MAIL_PASSWORD=your_brevo_smtp_key

server.port=${PORT:8080}
   ```
3. Build and run the backend server:
   ```bash
   ./mvnw spring-boot:run
   ```
   *Note: The backend runs on `http://localhost:8080` by default. Swagger documentation is available at `/swagger-ui.html`.*

### Frontend Setup (Smart_Exam)
1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```
   *Note: The frontend will be available at `http://localhost:3000`.*

## Usage Instructions
1. **Sign Up/Log In:** Users register as a Teacher or Student. Authentication is handled safely via JWT.
2. **Teacher Dashboard:** Teachers can create courses, generate AI-based questions, schedule exams, and review descriptive submissions.
3. **Student Dashboard:** Students can enroll in courses, attempt active exams with proctored monitoring, and view their grades and feedback.
4. **Chat/Notifications:** Users can utilize the built-in chat for support and queries.

## Author
This project was created by **Gaurav Verma**.
