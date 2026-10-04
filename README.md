# CampusConnect – Smart Student Management and Performance Analysis System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.1-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring%20Security-6.4.1-green.svg)](https://spring.io/projects/spring-security)
[![Spring AI](https://img.shields.io/badge/Spring%20AI-Ready-blue.svg)](https://spring.io/projects/spring-ai)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-blue.svg)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

**CampusConnect** is an enterprise-grade, full-stack college management web application designed to modernize university administration and elevate student academic success. Going far beyond traditional CRUD databases, CampusConnect incorporates an intelligent **Spring AI Cognitive Engine**, **Rule-Based Performance Analysis**, **Smart Attendance Risk Alerts**, deadline-aware **Assignment Management**, multi-stage **Leave Workflows**, and dual-interface options: a modern **React 18 SPA** and a lightweight **Vanilla Web Frontend**.

---

## 🏛️ System Architecture

```
                               ┌──────────────────────────────────────────────────┐
                               │               User Web Browsers                  │
                               │  React 18 SPA (Port 3000) / Vanilla (Port 8080)   │
                               └────────────────────────┬─────────────────────────┘
                                                        │ HTTP / REST / JWT Bearer
                                                        ▼
                               ┌──────────────────────────────────────────────────┐
                               │           Spring Security 6 Filter Chain         │
                               │ CORS Filter · Stateless Session · Token Gate     │
                               └────────────────────────┬─────────────────────────┘
                                                        │
                                                        ▼
                               ┌──────────────────────────────────────────────────┐
                               │              Spring Web REST Controllers         │
                               │ Auth · Student · Faculty · Admin · AI Engine     │
                               └───────────┬────────────┬────────────┬────────────┘
                                           │            │            │
            ┌──────────────────────────────┘            │            └──────────────────────────────┐
            ▼                                           ▼                                           ▼
┌───────────────────────┐                   ┌───────────────────────┐                   ┌───────────────────────┐
│ Spring AI & Cognitive │                   │ Attendance & Academic │                   │ Performance Analyzer  │
│  Assistant / Planner  │                   │ Alerts (<75% Warning) │                   │ (3-Factor Composite)  │
└───────────┬───────────┘                   └───────────┬───────────┘                   └───────────┬───────────┘
            │                                           │                                           │
            └──────────────────────────────┬────────────┴───────────────────────────────────────────┘
                                           │
                                           ▼
                               ┌──────────────────────────────────────────────────┐
                               │          Spring Data JPA Service Layer           │
                               │              Hibernate 6 ORM Layer               │
                               └────────────────────────┬─────────────────────────┘
                                                        │
                                                        ▼
                               ┌──────────────────────────────────────────────────┐
                               │         MySQL 8.0+ Relational Database           │
                               │        campusconnect_db (HikariCP Pool)          │
                               └──────────────────────────────────────────────────┘
```

---

## 🌟 Key Modules & AI Features

### 1. 🤖 AI Student Assistant (`AiAssistantWidget`)
* **Context-Aware Dialogue**: The assistant dynamically queries the student's live records—including overall and subject-wise attendance %, exam marks, GPA, and pending assignment deadlines.
* **Intelligent Guidance**: Delivers instant academic troubleshooting, exam preparation tips, timetable optimization, and campus protocol advice.
* **Suggested Action Pills**: Quick prompts for attendance risk calculations, upcoming assignments, and performance summaries.

### 2. 📅 AI Study Plan Generator (`AiStudyPlanModal`)
* **Cognitive Load Distribution**: Generates a tailored 7-day study timetable distributing user-selected daily study hours (1–8 hours) based on actual subject performance and attendance deficits.
* **Subject Prioritization Matrix**: Identifies critical subjects with urgency ratings (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and recommended weekly hour allocations.
* **Pomodoro Integration**: Breaks study sessions into focused 45-minute sprint blocks with 15-minute scheduled rest intervals.

### 3. 📊 AI Performance Explanation Engine (`AiPerformanceExplanationModal`)
* **3-Factor Score Breakdown**: Deconstructs student performance according to university weighting:
  $$\text{Composite Score} = (0.25 \times \text{Attendance \%}) + (0.50 \times \text{Exam Marks \%}) + (0.25 \times \text{Coursework \%})$$
* **Factor Diagnostics**: Individual status flags, actual vs maximum contribution scores, and critical alerts (e.g., `<75%` attendance debarment warnings).
* **Score Trajectory & Upside Projection**: Calculates maximum potential score achievable with a 30-day intervention.
* **Actionable 30-Day Recovery Roadmap**: Step-by-step milestones (Day 1–7, Day 8–15, Day 16–22, Day 23–30) to improve academic standing.
* **Dual-Mode Engine**: Operates natively using the built-in database heuristic cognitive engine without requiring external API keys, while also supporting external LLMs (OpenAI/Gemini) if `AI_API_KEY` is provided.

### 4. 🎓 Comprehensive Student Portal (`StudentDashboard`)
* **Profile & Dossier**: Complete enrollment details, roll numbers, department, and semester.
* **Attendance Risk Alert**: Visual warning banner when attendance drops below 75%, calculating exact classes required to restore eligibility.
* **Marks & Grade Ledger**: Breakdown of internal marks, midterms, assignments, totals, percentages, and letter grades.
* **Coursework & Submissions**: View assignment briefs, countdown timers (*"Due in 2 days"*), submit GitHub/cloud links, and view grades/feedback.
* **Leave Management**: Apply for medical, academic, or personal leave with date pickers; real-time status tracker (`PENDING`, `APPROVED`, `REJECTED`).
* **Academic Goal Tracker**: Set Target CGPA and semester goals with visual progress bars.
* **Achievements Showcase**: Submit verified hackathon awards, papers, and certifications with proof URLs.
* **Personalized Notice Board**: Filtered announcements delivered to student branch and year.

### 5. 👩‍🏫 Faculty Command Center (`FacultyDashboard`)
* **Departmental Health Metrics**: Total department students, class attendance averages, students at risk (<75%), and pending reviews.
* **Student Directory & Search**: Real-time multi-parameter search by name, roll number, department, year, attendance, and status.
* **Batch Attendance Logger**: Date selector, subject picker, and one-click "Mark All Present" toggle.
* **Marks & Grade Entry**: Direct grade sheet entry with automatic grade computation.
* **Assignment Management**: Publish assignments and review/grade student submissions.
* **Leave Review**: One-click approvals and rejections with instructor remarks.

### 6. 🛡️ Administrator Command Center (`AdminDashboard`)
* **Institutional Executive Dashboard**: Real-time metrics across campus: Enrolled Students, Faculty Roster, Departments, and User Accounts.
* **Faculty Roster Management**: Add new faculty members with automatic credentials generation and designation assignment.
* **Department Management**: Add and modify academic branches (CSE, ECE, AI&DS, MECH, IT).
* **Campus-Wide Broadcast Notice Board**: Issue announcements with priority badges (`URGENT`, `HIGH`, `NORMAL`).
* **User Security Control**: Enable / Disable user accounts with one click.
* **Campus Attendance Audit**: Instant view of all students below 75% attendance across all departments.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend Framework** | Spring Boot 4.1.1, Spring Web MVC, Spring Data JPA |
| **Security Layer** | Spring Security 6.4.1, Stateless Session, RFC 7519 JWT, PBKDF2 HMAC-SHA256 |
| **AI & Cognitive Engine** | Spring AI Architecture, Heuristic Academic Reasoner, Optional LLM Integration |
| **Language & Runtime** | Java 21 LTS |
| **Persistence / ORM** | Hibernate 6.x, MySQL Connector/J |
| **Database** | MySQL 8.0+ / 9.0+ with HikariCP Connection Pool |
| **Modern React Frontend** | React 18.3, Vite 5.4, Lucide Icons, Custom Design System |
| **Vanilla Web Frontend** | HTML5, CSS3 (Custom Responsive System), ES6 JavaScript, Chart.js 4.4 |
| **Containerization** | Docker, Docker Compose, Nginx Alpine, Eclipse Temurin 21 JRE |
| **Build & Tooling** | Apache Maven 3.9+, Node.js 20+ / 24+, npm 10+ |

---

## 📋 REST API Reference

All protected endpoints require an `Authorization: Bearer <token>` header obtained from `/api/auth/login`.

### 1. Spring AI Cognitive Services (`/api/ai`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/assistant/chat` | Context-aware AI Student Assistant chat dialogue | Student |
| `POST` | `/api/ai/study-plan` | Generate personalized 7-day Pomodoro study timetable | Student |
| `GET` | `/api/ai/performance-explanation/my` | AI Performance analysis & 30-day recovery roadmap for logged-in student | Student |
| `GET` | `/api/ai/performance-explanation/student/{id}` | AI Performance analysis for specific student | Faculty / Admin |

### 2. Authentication & Public (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new student account | Public |
| `POST` | `/api/auth/login` | Authenticate user and issue JWT token | Public |
| `GET` | `/api/auth/departments` | Get available departments for registration | Public |

### 3. Dashboard Metrics (`/api/dashboard`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/student/{id}` | Complete metrics, alerts, notices, and goals for student | Student / Faculty / Admin |
| `GET` | `/api/dashboard/faculty` | Department aggregate stats, pending leaves & submissions | Faculty / Admin |
| `GET` | `/api/dashboard/admin` | Campus-wide counts, department attendance & distribution | Admin |

### 4. Student Directory & Profiles (`/api/students`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/students` | Search students (by query, dept, year, attendance, status) | Faculty / Admin |
| `GET` | `/api/students/{id}` | Get student profile details by ID | Authenticated |
| `GET` | `/api/students/user/{userId}` | Get student record by User ID | Authenticated |
| `PUT` | `/api/students/{id}` | Update student profile information | Student / Admin |
| `DELETE` | `/api/students/{id}` | Remove student and associated records | Admin |

### 5. Attendance Management (`/api/attendance`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/attendance/student/{id}/overview` | Overall percentage, present count, & <75% alert status | Authenticated |
| `GET` | `/api/attendance/student/{id}/subject-wise`| Subject-by-subject attendance percentages | Authenticated |
| `POST` | `/api/attendance/batch` | Record classroom attendance for multiple students | Faculty / Admin |

### 6. Marks Management (`/api/marks`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/marks/student/{studentId}` | Get all semester exam marks for a student | Authenticated |
| `POST` | `/api/marks` | Record or update marks with automatic grade computation | Faculty / Admin |

### 7. Assignments & Submissions (`/api/assignments`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/assignments` | List all assignments with remaining days / overdue tag | Authenticated |
| `POST` | `/api/assignments` | Create new course assignment | Faculty / Admin |
| `POST` | `/api/assignments/{id}/submit` | Submit coursework with file/link attachment | Student |
| `GET` | `/api/assignments/{id}/submissions` | View student submissions for an assignment | Faculty / Admin |
| `PUT` | `/api/assignments/submissions/{id}/grade` | Grade submission and leave instructor feedback | Faculty / Admin |

### 8. Leave Management (`/api/leaves`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/leaves/student/{studentId}` | View leave application history | Student / Faculty / Admin |
| `GET` | `/api/leaves/pending` | View all pending departmental leave requests | Faculty / Admin |
| `POST` | `/api/leaves` | Apply for academic/medical leave | Student |
| `PUT` | `/api/leaves/{id}/review` | Review leave request (`APPROVED` / `REJECTED`) | Faculty / Admin |

### 9. Goals & Achievements (`/api/goals`, `/api/achievements`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/goals/student/{studentId}` | Fetch student goals and target percentages | Authenticated |
| `POST` | `/api/goals` | Create academic goal | Student |
| `PUT` | `/api/goals/{id}/progress` | Update goal current value and progress | Student |
| `GET` | `/api/achievements/student/{studentId}`| Fetch verified and pending student achievements | Authenticated |
| `POST` | `/api/achievements` | Add co-curricular accomplishment with proof URL | Student |
| `PUT` | `/api/achievements/{id}/verify` | Verify student achievement | Faculty / Admin |

### 10. Notices & Broadcasts (`/api/notices`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notices` | Get all campus notices | Authenticated |
| `GET` | `/api/notices/student/{studentId}` | Get personalized notices for student branch & year | Student |
| `POST` | `/api/notices` | Publish targeted or campus-wide notice | Faculty / Admin |
| `DELETE` | `/api/notices/{id}` | Delete announcement | Admin |

### 11. Administration & Security (`/api/admin`, `/api/faculty`, `/api/departments`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | List all system user credentials and statuses | Admin |
| `PUT` | `/api/admin/users/{id}/toggle-status` | Enable or disable user account access | Admin |
| `GET` | `/api/faculty` | Get faculty roster | Authenticated |
| `POST` | `/api/faculty` | Register faculty member and create login account | Admin |
| `DELETE` | `/api/faculty/{id}` | Remove faculty member | Admin |
| `GET` | `/api/departments` | List all academic departments | Authenticated |
| `POST` | `/api/departments` | Create academic department | Admin |
| `PUT` | `/api/departments/{id}` | Update department details | Admin |
| `DELETE` | `/api/departments/{id}` | Delete department | Admin |

---

## 🔑 Pre-Configured Demo Credentials

The database is pre-seeded with realistic demonstration data, including courses, faculty staff, realistic student attendance records (including an immediate `<75%` attendance alert demonstration), assignment submissions, and achievements.

| Role | Email Address | Password | Profile Highlights |
| :--- | :--- | :--- | :--- |
| **Student (At-Risk)** | `rahul.sharma@campusconnect.edu` | `Student@123` | B.Tech CSE (Year 3), **64% Attendance** (Triggers Alert banner, AI Assistant study plans & 30-day recovery roadmap) |
| **Student (High Honor)** | `priya.patel@campusconnect.edu` | `Student@123` | B.Tech CSE (Year 3), **92% Attendance**, High GPA, Verified Achievements |
| **Faculty Member** | `faculty.cse@campusconnect.edu` | `Faculty@123` | Dr. Robert Vance, Professor & HoD Computer Science |
| **System Admin** | `admin@campusconnect.edu` | `Admin@123` | Campus Administrator, full system command center access |

> 💡 **Quick Login**: Both the React login page and vanilla login screen feature 1-click **Demo Login** buttons to automatically authenticate as any role!

---

## 🚀 Running the Project Locally

### Prerequisites
* **Java Development Kit (JDK)**: Version 21 LTS
* **Apache Maven**: Version 3.9+
* **Node.js**: Version 20+ or 24+ with npm
* **MySQL Server**: Version 8.0 or higher running on port `3306`

### 1. Database Setup
Create the MySQL database:
```sql
CREATE DATABASE IF NOT EXISTS campusconnect_db;
```

### 2. Configure Database Credentials
Edit `src/main/resources/application.properties` if your MySQL password differs from `root`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/campusconnect_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root
```

### 3. Start the Spring Boot Backend
From the root directory:
```bash
mvn spring-boot:run
```
*(Or use `mvn spring-boot:run -o` if running offline with pre-cached dependencies).*

When the backend boots:
* Hibernate automatically creates all relational tables.
* `DataInitializer` seeds departments, courses, faculty, students, attendance, and assignments.
* Spring Security secures all endpoints with JWT bearer authentication.

### 4. Start the Modern React Frontend
Open a second terminal in the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
The React SPA will launch at: **http://localhost:3000/** (proxying API calls to backend port `8080`).

To build the React production bundle:
```bash
npm run build
```

### 5. Accessing Both Frontends
* **React 18 SPA (Primary Modern UI)**: [http://localhost:3000/](http://localhost:3000/)
* **Vanilla Static Frontend**: [http://localhost:8080/](http://localhost:8080/)
  * Sign In Portal: [http://localhost:8080/login.html](http://localhost:8080/login.html)
  * Student Registration: [http://localhost:8080/register.html](http://localhost:8080/register.html)
  * Student Dashboard: [http://localhost:8080/student-dashboard.html](http://localhost:8080/student-dashboard.html)
  * Faculty Dashboard: [http://localhost:8080/faculty-dashboard.html](http://localhost:8080/faculty-dashboard.html)
  * Admin Dashboard: [http://localhost:8080/admin-dashboard.html](http://localhost:8080/admin-dashboard.html)

---

## 🐳 Production Deployment with Docker

CampusConnect is fully containerized and production-ready with Docker and Docker Compose.

### 1. Architecture
* **`mysql`**: Official MySQL 8.0 image with healthchecks and persistent storage volume (`mysql_data`).
* **`backend`**: Multi-stage Dockerfile compiling Java 21 Spring Boot JAR using Maven and running on lightweight `eclipse-temurin:21-jre-alpine` with HikariCP connection pooling and production tuning (`application-prod.properties`).
* **`frontend`**: Multi-stage Dockerfile building the React 18 SPA with Vite and serving via `nginx:alpine`, with automatic reverse proxy routing for `/api/`.

### 2. Deploy with Docker Compose
To launch the complete full-stack environment with a single command:
```bash
docker-compose up --build -d
```

### 3. Verify Containers
```bash
docker-compose ps
```

### 4. Production URLs
* **React Full-Stack Application**: [http://localhost:3000/](http://localhost:3000/)
* **Backend REST API**: [http://localhost:8080/api](http://localhost:8080/api)
* **MySQL Database**: `localhost:3306`

To shut down the deployment:
```bash
docker-compose down
```

---

## 📂 Project Directory Structure

```
student-management/
├── pom.xml                                     # Maven project build descriptor
├── Dockerfile                                  # Multi-stage Spring Boot 3 + Java 21 Dockerfile
├── docker-compose.yml                          # Full-stack orchestrator (MySQL, Backend, Frontend)
├── README.md                                   # Comprehensive project documentation
├── frontend/                                   # React 18 SPA (Vite + Nginx)
│   ├── package.json                            # React dependencies & build scripts
│   ├── vite.config.js                          # Vite dev server & proxy config
│   ├── nginx.conf                              # Production Nginx reverse proxy
│   ├── Dockerfile                              # Multi-stage React + Nginx Dockerfile
│   ├── index.html                              # React SPA HTML entry point
│   └── src/
│       ├── main.jsx                            # React root bootstrap
│       ├── App.jsx                             # Role-based dashboard router
│       ├── index.css                           # Modern design system & CSS utility classes
│       ├── context/
│       │   └── AuthContext.jsx                 # User state, JWT store, login/logout
│       ├── services/
│       │   └── api.js                          # Axios HTTP client & AI endpoints
│       ├── components/
│       │   ├── Navbar.jsx                      # Top navigation bar
│       │   ├── Sidebar.jsx                     # Collapsible side navigation
│       │   ├── AiAssistantWidget.jsx           # Floating AI chatbot drawer
│       │   ├── AiStudyPlanModal.jsx            # 7-day Pomodoro AI study schedule
│       │   └── AiPerformanceExplanationModal.jsx # 3-factor score & 30-day roadmap
│       └── pages/
│           ├── LandingPage.jsx                 # Public landing page
│           ├── LoginPage.jsx                   # Role-based login with 1-click demos
│           ├── RegisterPage.jsx                # Student registration page
│           ├── StudentDashboard.jsx            # Full 10-tab Student Portal
│           ├── FacultyDashboard.jsx            # 8-tab Faculty Command Center
│           └── AdminDashboard.jsx              # 7-tab Admin Command Center
└── src/
    └── main/
        ├── java/com/example/campusconnect/
        │   ├── CampusConnectApplication.java    # Spring Boot application entry point
        │   ├── config/
        │   │   ├── DataInitializer.java        # Pre-seeding realistic campus database records
        │   │   ├── JwtAuthInterceptor.java     # Route security & token gate
        │   │   ├── JwtTokenProvider.java       # RFC 7519 HMAC-SHA256 JWT utility
        │   │   ├── PasswordEncoder.java        # Spring Security PBKDF2 password encoder
        │   │   ├── RequireRole.java            # Role authorization annotation
        │   │   ├── SecurityConfig.java         # Spring Security 6 SecurityFilterChain & CORS
        │   │   └── WebMvcConfig.java           # CORS & interceptor registration
        │   ├── controller/                     # 16 REST API Controllers
        │   │   ├── AdminController.java
        │   │   ├── AchievementController.java
        │   │   ├── AiController.java           # Spring AI Assistant, Planner, Explanation
        │   │   ├── AssignmentController.java
        │   │   ├── AttendanceController.java
        │   │   ├── AuthController.java
        │   │   ├── DashboardController.java
        │   │   ├── DepartmentController.java
        │   │   ├── FacultyController.java
        │   │   ├── GoalController.java
        │   │   ├── LeaveController.java
        │   │   ├── MarksController.java
        │   │   ├── NoticeController.java
        │   │   ├── PerformanceController.java
        │   │   ├── StudentController.java
        │   │   └── SubjectController.java
        │   ├── dto/                            # Strongly-typed Data Transfer Objects
        │   │   ├── AiChatDto.java              # Chat request / message / response
        │   │   ├── StudyPlanDto.java           # Weekly timetable & priority subjects
        │   │   ├── PerformanceExplanationDto.java # 3-factor details & 30-day roadmap
        │   │   ├── ApiResponse.java
        │   │   ├── AttendanceSummaryDto.java
        │   │   ├── DashboardStatsDto.java
        │   │   ├── FacultyDto.java
        │   │   ├── LoginRequest.java
        │   │   ├── LoginResponse.java
        │   │   ├── NoticeDto.java
        │   │   ├── PerformanceAnalysisDto.java
        │   │   ├── RegisterRequest.java
        │   │   └── StudentDto.java
        │   ├── entity/                         # 14 JPA / Hibernate Entities
        │   │   ├── AcademicGoal.java
        │   │   ├── Achievement.java
        │   │   ├── Assignment.java
        │   │   ├── AssignmentSubmission.java
        │   │   ├── Attendance.java
        │   │   ├── Department.java
        │   │   ├── Faculty.java
        │   │   ├── LeaveRequest.java
        │   │   ├── Marks.java
        │   │   ├── Notice.java
        │   │   ├── Role.java
        │   │   ├── Student.java
        │   │   ├── Subject.java
        │   │   └── User.java
        │   ├── exception/                      # Centralized Exception Handling
        │   │   ├── BadRequestException.java
        │   │   ├── DuplicateResourceException.java
        │   │   ├── ErrorResponse.java
        │   │   ├── GlobalExceptionHandler.java
        │   │   ├── ResourceNotFoundException.java
        │   │   └── UnauthorizedException.java
        │   ├── repository/                     # 11 Spring Data JPA Repositories
        │   └── service/                        # Business Logic & Intelligence Engines
        │       ├── AchievementService.java
        │       ├── AiService.java              # Spring AI Cognitive Engine Interface
        │       ├── AiServiceImpl.java          # Heuristic Reasoner & External LLM bridge
        │       ├── AssignmentService.java
        │       ├── AttendanceService.java
        │       ├── AuthService.java
        │       ├── DashboardService.java
        │       ├── DepartmentService.java
        │       ├── FacultyService.java
        │       ├── GoalService.java
        │       ├── LeaveService.java
        │       ├── MarksService.java
        │       ├── NoticeService.java
        │       ├── PerformanceService.java
        │       ├── StudentService.java
        │       └── SubjectService.java
        └── resources/
            ├── application.properties          # Development configuration (H2/MySQL)
            ├── application-prod.properties     # Production tuning, HikariCP, environment variables
            └── static/                         # Responsive Web Frontend (Vanilla fallback)
                ├── css/
                │   ├── style.css
                │   └── auth.css
                ├── js/
                │   ├── api.js
                │   ├── chart.min.js
                │   ├── student-dashboard.js
                │   ├── faculty-dashboard.js
                │   └── admin-dashboard.js
                ├── index.html
                ├── login.html
                ├── register.html
                ├── student-dashboard.html
                ├── faculty-dashboard.html
                └── admin-dashboard.html
```

---

## 🔒 Security & Standards Compliance

* **Spring Security 6 Integration**: Complete `SecurityFilterChain` configuring CORS policy, stateless REST session management, CSRF disabling for token-based APIs, and role-based access gates.
* **Standards-Compliant Password Hashing**: PBKDF2 with HMAC-SHA256, 12,000 hashing rounds, cryptographically random salt, and timing-attack resistant verification.
* **Stateless JWT Tokens**: RFC 7519 standard tokens carrying encrypted subject and expiration claims, validated on every API request.
* **SQL Injection Prevention**: Hibernate parameterized queries prevent SQL injection across all dynamic search filters and sorting queries.
* **Production Hardening**: Non-root container execution (`appuser`), connection leak detection, and HTTP response compression.

---

## 📄 License
This project is licensed under the MIT License.
