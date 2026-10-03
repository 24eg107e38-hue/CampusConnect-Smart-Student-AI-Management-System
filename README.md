# CampusConnect – Smart Student Management and Performance Analysis System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.1-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

**CampusConnect** is an enterprise-grade, full-stack college management web application designed to modernize university administration and elevate student academic success. Going far beyond traditional CRUD databases, CampusConnect incorporates an intelligent **Rule-Based Student Performance Analyzer**, **Smart Attendance Risk Alerts**, deadline-aware **Assignment Management**, multi-stage **Leave Workflows**, and role-tailored dashboards powered by interactive **Chart.js** data visualizations.

---

## 🏛️ System Architecture & Highlights

```
                                 ┌─────────────────────────┐
                                 │   Frontend Web Client   │
                                 │  (HTML5 / CSS3 / ES6)   │
                                 │ Responsive Dashboards   │
                                 └────────────┬────────────┘
                                              │ REST (JSON) / JWT Bearer
                                              ▼
                                 ┌─────────────────────────┐
                                 │  Spring Web MVC Layer   │
                                 │ Controllers & Validation│
                                 └────────────┬────────────┘
                                              │
                      ┌───────────────────────┼───────────────────────┐
                      ▼                       ▼                       ▼
            ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
            │ Performance Engine│   │ Attendance Alert  │   │ JWT Auth Security │
            │ (Rule Analysis)   │   │ (<75% Threshold)  │   │ (PBKDF2 SHA-256)  │
            └─────────┬─────────┘   └─────────┬─────────┘   └─────────┬─────────┘
                      │                       │                       │
                      └───────────────────────┼───────────────────────┘
                                              ▼
                                 ┌─────────────────────────┐
                                 │ Spring Data JPA Services│
                                 │  Business Logic Layer   │
                                 └────────────┬────────────┘
                                              │ Hibernate ORM
                                              ▼
                                 ┌─────────────────────────┐
                                 │    MySQL Database       │
                                 │    campusconnect_db     │
                                 └─────────────────────────┘
```

---

## 🌟 Key Functional Modules

### 1. 🎓 Student Portal (`student-dashboard.html`)
* **Live Academic Dossier**: View comprehensive student profiles, roll numbers, department associations, and semester details.
* **Smart Attendance Monitor & Alert Banner**: Immediate visual alert flagged whenever attendance drops below **75%**, calculating required makeup sessions.
* **Interactive Marks & Semester Breakdown**: Track Internal assessments, Assignment scores, Midterms, Final Exam scores, percentage, and letter grades.
* **Assignment Lifecycle**: Overview of assigned coursework, countdown badges (*"Due in 2 days"*, *"Overdue"*), submission interface with GitHub/Cloud link support, and faculty feedback.
* **Leave Application Center**: Submit medical, academic, or personal leave requests with date pickers, reason, and track status (`PENDING`, `APPROVED`, `REJECTED`).
* **Academic Goal Tracker**: Set Target CGPA and Semester Objectives with interactive visual completion progress bars.
* **Achievements Showcase**: Log hackathon wins, research papers, and certifications with proof URLs awaiting faculty verification.
* **Targeted Notice Board**: Filtered announcements delivered specifically to the student's department and academic year.
* **Smart Performance Analyzer Tab**: Multi-metric index score with qualitative standing, strengths, improvement areas, and rule-based study suggestions.

### 2. 👩‍🏫 Faculty Portal (`faculty-dashboard.html`)
* **Instructor Command Center**: Metrics overview covering total department students, average class attendance, students at risk (<75%), and pending reviews.
* **Student Directory & Advanced Filter**: Search students by name, roll number, department, year, attendance ranges, and performance status.
* **One-Click Performance Dossier**: Inspect any student's complete academic health profile via modal popup.
* **Daily Classroom Attendance Marking**: Batch attendance logger with date selector, subject selector, and one-click "Mark All Present" toggle.
* **Academic Marks Management**: Direct grade sheet entry for CS501, CS502, CS503 with auto-computed totals and letter grades.
* **Assignment Creation & Submission Review**: Publish assignments with deadline tracking; review student submissions and record marks with feedback.
* **Leave Approval Engine**: Review pending student leaves with approve/reject decisions and instructor remarks.
* **Notice Publisher**: Post department-specific announcements.

### 3. 🛡️ Administrator Portal (`admin-dashboard.html`)
* **Institutional Executive Dashboard**: Real-time campus-wide metrics: Total Enrolled Students, Total Faculty Staff, Academic Departments, and Active User Accounts.
* **Visual Institutional Analytics**:
  * *Department Attendance Comparison* (Bar chart with threshold indicators)
  * *Student Enrollment Distribution* (Doughnut chart by branch)
* **Student Roster Management**: Institutional student search, full profile dossier inspection, and safe deletion.
* **Faculty Staff Management**: Add new faculty members with automatic user account generation, designation assignment, and specialization indexing.
* **Department Management**: Add and modify academic branches (CSE, ECE, AI&DS, MECH, IT).
* **Campus-Wide Broadcast Notice Board**: Issue institutional directives with priority badges (`URGENT`, `HIGH`, `NORMAL`).
* **User Security & Access Control**: View all registered credentials across roles with 1-click **Enable / Disable** account toggles.
* **Critical Attendance Warning Report**: Scans all students campus-wide and flags those below 75% for intervention.

---

## 🧠 Smart Performance Analyzer Algorithm

The **PerformanceService** evaluates each student through an automated composite scoring algorithm:

$$\text{Performance Score} = (0.25 \times \text{Attendance \%}) + (0.50 \times \text{Academic Marks \%}) + (0.25 \times \text{Assignment Completion \%})$$

### Qualitative Performance Categories:
* **Excellent (90% – 100%)**: Eligible for advanced honors electives and merit scholarship programs.
* **Good (75% – 89.9%)**: Solid academic foundation; recommendations focus on competitive projects and publications.
* **Average (60% – 74.9%)**: Passing standard; guided towards peer study groups and faculty office hours.
* **Needs Improvement (< 60%)**: Triggers automated academic warnings, mandatory tutoring, and intervention sessions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend Framework** | Spring Boot 4.1.1, Spring Web MVC, Spring Data JPA |
| **Language & Runtime** | Java 21 LTS |
| **Persistence / ORM** | Hibernate 6.x, MySQL Connector/J |
| **Database** | MySQL 8.0+ / 9.0+ |
| **Security & Auth** | PBKDF2 with HMAC-SHA256 (12,000 iterations), RFC 7519 standard JWT |
| **Input Validation** | Jakarta Validation API (`jakarta.validation-api:3.1.1`), Hibernate Validator |
| **Frontend UI** | HTML5, CSS3 (Modern custom design system, Flexbox, CSS Grid), Vanilla ES6 JavaScript |
| **Data Visualization** | Chart.js 4.4 |
| **Build & Tooling** | Apache Maven 3.9+ |

---

## 📋 REST API Reference

All protected endpoints require an `Authorization: Bearer <token>` header obtained from `/api/auth/login`.

### Authentication & Public (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new student account | Public |
| `POST` | `/api/auth/login` | Authenticate user and issue JWT token | Public |
| `GET` | `/api/auth/departments` | Get available departments for registration | Public |

### Dashboard Metrics (`/api/dashboard`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/student/{id}` | Complete metrics, alerts, notices, and goals for student | Student / Faculty / Admin |
| `GET` | `/api/dashboard/faculty` | Department aggregate stats, pending leaves & submissions | Faculty / Admin |
| `GET` | `/api/dashboard/admin` | Campus-wide counts, department attendance & distribution | Admin |

### Student Directory & Profile (`/api/students`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/students` | Search students (by query, dept, year, attendance, status) | Faculty / Admin |
| `GET` | `/api/students/{id}` | Get student profile details by ID | Authenticated |
| `GET` | `/api/students/user/{userId}` | Get student record by User ID | Authenticated |
| `PUT` | `/api/students/{id}` | Update student profile information | Student / Admin |
| `DELETE` | `/api/students/{id}` | Remove student and associated records | Admin |

### Performance Analyzer (`/api/performance`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/performance/student/{studentId}` | Calculate composite score, status, strengths, & advice | Authenticated |

### Attendance Management (`/api/attendance`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/attendance/student/{id}/overview` | Overall percentage, present count, & <75% alert status | Authenticated |
| `GET` | `/api/attendance/student/{id}/subject-wise`| Subject-by-subject attendance percentages | Authenticated |
| `POST` | `/api/attendance/batch` | Record classroom attendance for multiple students | Faculty / Admin |

### Marks Management (`/api/marks`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/marks/student/{studentId}` | Get all semester exam marks for a student | Authenticated |
| `POST` | `/api/marks` | Record or update marks with automatic grade computation | Faculty / Admin |

### Assignments & Submissions (`/api/assignments`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/assignments` | List all assignments with remaining days / overdue tag | Authenticated |
| `POST` | `/api/assignments` | Create new course assignment | Faculty / Admin |
| `POST` | `/api/assignments/{id}/submit` | Submit coursework with file/link attachment | Student |
| `GET` | `/api/assignments/{id}/submissions` | View student submissions for an assignment | Faculty / Admin |
| `PUT` | `/api/assignments/submissions/{id}/grade` | Grade submission and leave instructor feedback | Faculty / Admin |

### Leave Management (`/api/leaves`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/leaves/student/{studentId}` | View leave application history | Student / Faculty / Admin |
| `GET` | `/api/leaves/pending` | View all pending departmental leave requests | Faculty / Admin |
| `POST` | `/api/leaves` | Apply for academic/medical leave | Student |
| `PUT` | `/api/leaves/{id}/review` | Review leave request (`APPROVED` / `REJECTED`) | Faculty / Admin |

### Goals & Achievements (`/api/goals`, `/api/achievements`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/goals/student/{studentId}` | Fetch student goals and target percentages | Authenticated |
| `POST` | `/api/goals` | Create academic goal | Student |
| `PUT` | `/api/goals/{id}/progress` | Update goal current value and progress | Student |
| `GET` | `/api/achievements/student/{studentId}`| Fetch verified and pending student achievements | Authenticated |
| `POST` | `/api/achievements` | Add co-curricular accomplishment with proof URL | Student |
| `PUT` | `/api/achievements/{id}/verify` | Verify student achievement | Faculty / Admin |

### Notices & Broadcasts (`/api/notices`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notices` | Get all campus notices | Authenticated |
| `GET` | `/api/notices/student/{studentId}` | Get personalized notices for student branch & year | Student |
| `POST` | `/api/notices` | Publish targeted or campus-wide notice | Faculty / Admin |
| `DELETE` | `/api/notices/{id}` | Delete announcement | Admin |

### Administration & Security (`/api/admin`, `/api/faculty`, `/api/departments`)
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
| **Student (At-Risk)** | `rahul.sharma@campusconnect.edu` | `Student@123` | B.Tech CSE (Year 3), **64% Attendance** (Triggers Alert banner & intervention advice) |
| **Student (High Honor)** | `priya.patel@campusconnect.edu` | `Student@123` | B.Tech CSE (Year 3), **92% Attendance**, High GPA, Verified Achievements |
| **Faculty Member** | `faculty.cse@campusconnect.edu` | `Faculty@123` | Dr. Robert Vance, Professor & HoD Computer Science |
| **System Admin** | `admin@campusconnect.edu` | `Admin@123` | Campus Administrator, full system command center access |

> 💡 **Quick Login**: The login screen (`login.html`) includes 1-click **Demo Login** buttons to automatically fill credentials for any role!

---

## 🚀 Setup & Installation Guide

### Prerequisites
* **Java Development Kit (JDK)**: Version 21 LTS installed and on `PATH`
* **Apache Maven**: Version 3.9+ installed and on `PATH`
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

### 3. Build & Run Application
From the project root directory, run:
```bash
mvn spring-boot:run -o
```
*(Use the `-o` offline flag if working in an isolated environment with pre-cached dependencies).*

When the application boots:
* Hibernate will automatically create all tables.
* `DataInitializer` will automatically seed the initial departments, subjects, faculty, students, attendance, marks, and notices.

### 4. Access the Application
Open your web browser and navigate to:
* **Landing Page**: [http://localhost:8080/](http://localhost:8080/)
* **Sign In Portal**: [http://localhost:8080/login.html](http://localhost:8080/login.html)
* **Student Registration**: [http://localhost:8080/register.html](http://localhost:8080/register.html)
* **Student Dashboard**: [http://localhost:8080/student-dashboard.html](http://localhost:8080/student-dashboard.html)
* **Faculty Dashboard**: [http://localhost:8080/faculty-dashboard.html](http://localhost:8080/faculty-dashboard.html)
* **Admin Command Center**: [http://localhost:8080/admin-dashboard.html](http://localhost:8080/admin-dashboard.html)

---

## 📂 Project Directory Structure

```
student-management/
├── pom.xml                                     # Maven project build descriptor
├── README.md                                   # Complete system documentation
└── src/
    └── main/
        ├── java/com/example/campusconnect/
        │   ├── CampusConnectApplication.java    # Spring Boot entry point
        │   ├── config/
        │   │   ├── DataInitializer.java        # Database pre-seeding runner
        │   │   ├── JwtAuthInterceptor.java     # Route security & token gate
        │   │   ├── JwtTokenProvider.java       # RFC 7519 HMAC-SHA256 JWT utility
        │   │   ├── PasswordEncoder.java        # NIST PBKDF2 password hasher
        │   │   ├── RequireRole.java            # Role authorization annotation
        │   │   └── WebMvcConfig.java           # CORS & interceptor registration
        │   ├── controller/                     # 15 Spring REST Controllers
        │   │   ├── AdminController.java
        │   │   ├── AchievementController.java
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
        │   ├── entity/                         # JPA / Hibernate Entities
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
            ├── application.properties          # Database & JPA configuration
            └── static/                         # Responsive Web Frontend
                ├── css/
                │   ├── style.css               # Core design system, cards, tables, modals
                │   └── auth.css                # Authentication forms and portal cards
                ├── js/
                │   ├── api.js                  # Fetch client, JWT interceptor, toasts
                │   ├── chart.min.js            # Offline Chart.js library
                │   ├── student-dashboard.js    # Student portal controller
                │   ├── faculty-dashboard.js    # Faculty portal controller
                │   └── admin-dashboard.js      # Admin command center controller
                ├── index.html                  # Responsive modern landing page
                ├── login.html                  # Role-based login with demo fillers
                ├── register.html               # Student registration portal
                ├── student-dashboard.html      # 10-tab Student Portal
                ├── faculty-dashboard.html      # 8-tab Faculty Portal
                └── admin-dashboard.html        # 7-tab Admin Command Center
```

---

## 🔒 Security & Industry Standards

* **Password Protection**: Standards-compliant PBKDF2 with HMAC-SHA256, 12,000 hashing rounds, cryptographically random salt, and timing-attack resistant verification. Passwords are never stored in plain text.
* **Token Authentication**: Stateless JSON Web Tokens (RFC 7519) carrying encrypted cryptographic claims and expiration metadata, automatically injected via `api.js` request interceptors.
* **Role-Based Access Control**: Strict multi-level role enforcement via `@RequireRole` annotations and the `JwtAuthInterceptor` protecting administrative and faculty actions.
* **Injection Prevention**: Hibernate parameterized queries prevent SQL injection across all dynamic search filters.

---

## 📄 License
This project is licensed under the MIT License.
