package com.example.campusconnect.config;

import com.example.campusconnect.entity.*;
import com.example.campusconnect.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import com.example.campusconnect.config.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private MarksRepository marksRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private AssignmentSubmissionRepository submissionRepository;

    @Autowired
    private LeaveRequestRepository leaveRepository;

    @Autowired
    private AcademicGoalRepository goalRepository;

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (departmentRepository.count() > 0) {
            return; // Already initialized
        }

        // 1. Departments
        Department cse = departmentRepository.save(new Department("CSE", "Computer Science & Engineering", "Department of Computer Science & Engineering"));
        Department ece = departmentRepository.save(new Department("ECE", "Electronics & Communication Engineering", "Department of Electronics & Communication"));
        Department aids = departmentRepository.save(new Department("AIDS", "Artificial Intelligence & Data Science", "Department of AI and Data Science"));
        Department mech = departmentRepository.save(new Department("MECH", "Mechanical Engineering", "Department of Mechanical Engineering"));
        Department it = departmentRepository.save(new Department("IT", "Information Technology", "Department of Information Technology"));

        // 2. Subjects
        Subject dbms = subjectRepository.save(new Subject("CS501", "Database Management Systems", cse, 3, 5, 4));
        Subject os = subjectRepository.save(new Subject("CS502", "Operating Systems", cse, 3, 5, 4));
        Subject cn = subjectRepository.save(new Subject("CS503", "Computer Networks", cse, 3, 5, 3));
        Subject se = subjectRepository.save(new Subject("CS504", "Software Engineering", cse, 3, 5, 3));
        Subject cloud = subjectRepository.save(new Subject("CS505", "Cloud Computing & DevOps", cse, 3, 5, 3));

        Subject dsp = subjectRepository.save(new Subject("EC301", "Digital Signal Processing", ece, 2, 3, 4));
        Subject mpmc = subjectRepository.save(new Subject("EC302", "Microprocessors & Microcontrollers", ece, 2, 3, 4));

        // 3. Admin User
        User adminUser = new User();
        adminUser.setEmail("admin@campusconnect.edu");
        adminUser.setPassword(passwordEncoder.encode("Admin@123"));
        adminUser.setFullName("Campus Administrator");
        adminUser.setPhoneNumber("+1 800-555-0199");
        adminUser.setRole(Role.ROLE_ADMIN);
        adminUser.setActive(true);
        userRepository.save(adminUser);

        // 4. Faculty Users
        User fac1User = new User();
        fac1User.setEmail("faculty.cse@campusconnect.edu");
        fac1User.setPassword(passwordEncoder.encode("Faculty@123"));
        fac1User.setFullName("Dr. Robert Vance");
        fac1User.setPhoneNumber("+1 555-0144");
        fac1User.setRole(Role.ROLE_FACULTY);
        fac1User.setActive(true);
        userRepository.save(fac1User);

        Faculty fac1 = facultyRepository.save(new Faculty(
                fac1User, "FAC001", cse, "Professor & HoD", "Ph.D in Distributed Systems", "Database Systems & Cloud"
        ));

        User fac2User = new User();
        fac2User.setEmail("faculty.math@campusconnect.edu");
        fac2User.setPassword(passwordEncoder.encode("Faculty@123"));
        fac2User.setFullName("Dr. Sarah Connor");
        fac2User.setPhoneNumber("+1 555-0177");
        fac2User.setRole(Role.ROLE_FACULTY);
        fac2User.setActive(true);
        userRepository.save(fac2User);

        Faculty fac2 = facultyRepository.save(new Faculty(
                fac2User, "FAC002", cse, "Associate Professor", "Ph.D in Computer Networks", "Network Security"
        ));

        // 5. Student Users
        // Student 1: Rahul Sharma (Attendance configured at ~68% to trigger Smart Alert)
        User stu1User = new User();
        stu1User.setEmail("rahul.sharma@campusconnect.edu");
        stu1User.setPassword(passwordEncoder.encode("Student@123"));
        stu1User.setFullName("Rahul Sharma");
        stu1User.setPhoneNumber("+1 555-0111");
        stu1User.setRole(Role.ROLE_STUDENT);
        stu1User.setActive(true);
        userRepository.save(stu1User);

        Student stu1 = new Student(stu1User, "STU2024001", cse, "B.Tech Computer Science", 3, LocalDate.of(2023, 8, 1));
        stu1.setAddress("42 University Avenue, Tech Park");
        stu1 = studentRepository.save(stu1);

        // Student 2: Priya Patel (High performer, ~92% attendance)
        User stu2User = new User();
        stu2User.setEmail("priya.patel@campusconnect.edu");
        stu2User.setPassword(passwordEncoder.encode("Student@123"));
        stu2User.setFullName("Priya Patel");
        stu2User.setPhoneNumber("+1 555-0122");
        stu2User.setRole(Role.ROLE_STUDENT);
        stu2User.setActive(true);
        userRepository.save(stu2User);

        Student stu2 = new Student(stu2User, "STU2024002", cse, "B.Tech Computer Science", 3, LocalDate.of(2023, 8, 1));
        stu2.setAddress("15 Oak Ridge Blvd, Silicon City");
        stu2 = studentRepository.save(stu2);

        // Student 3: Alex Smith (ECE Year 2)
        User stu3User = new User();
        stu3User.setEmail("alex.smith@campusconnect.edu");
        stu3User.setPassword(passwordEncoder.encode("Student@123"));
        stu3User.setFullName("Alex Smith");
        stu3User.setPhoneNumber("+1 555-0133");
        stu3User.setRole(Role.ROLE_STUDENT);
        stu3User.setActive(true);
        userRepository.save(stu3User);

        Student stu3 = new Student(stu3User, "STU2024003", ece, "B.Tech Electronics & Comm", 2, LocalDate.of(2024, 8, 1));
        stu3 = studentRepository.save(stu3);

        // 6. Attendance Seeding
        // Rahul: 25 classes total, 17 present, 8 absent = 68.0% (Triggers alert!)
        LocalDate baseDate = LocalDate.now().minusDays(30);
        Subject[] cseSubjects = {dbms, os, cn, se, cloud};
        for (int i = 0; i < 25; i++) {
            LocalDate date = baseDate.plusDays(i);
            Subject sub = cseSubjects[i % cseSubjects.length];

            // Rahul: absent on some days
            String rahulStatus = (i % 3 == 0) ? "ABSENT" : "PRESENT";
            attendanceRepository.save(new Attendance(stu1, sub, date, rahulStatus, rahulStatus.equals("ABSENT") ? "Unexcused" : "Attended"));

            // Priya: present almost all
            String priyaStatus = (i == 7 || i == 19) ? "ABSENT" : "PRESENT";
            attendanceRepository.save(new Attendance(stu2, sub, date, priyaStatus, "Regular"));
        }

        // Alex attendance in ECE
        for (int i = 0; i < 15; i++) {
            LocalDate date = baseDate.plusDays(i);
            Subject sub = (i % 2 == 0) ? dsp : mpmc;
            String alexStatus = (i % 5 == 0) ? "ABSENT" : "PRESENT";
            attendanceRepository.save(new Attendance(stu3, sub, date, alexStatus, "Class"));
        }

        // 7. Marks Seeding
        // Rahul Marks:
        // DBMS: 16/20, 8/10, 24/30, 32/40 = 80 (Grade A)
        marksRepository.save(new Marks(stu1, dbms, 5, 16.0, 8.0, 24.0, 32.0));
        // OS: 14/20, 7/10, 20/30, 28/40 = 69 (Grade C)
        marksRepository.save(new Marks(stu1, os, 5, 14.0, 7.0, 20.0, 28.0));
        // CN: 12/20, 6/10, 18/30, 22/40 = 58 (Grade D)
        marksRepository.save(new Marks(stu1, cn, 5, 12.0, 6.0, 18.0, 22.0));
        // SE: 17/20, 9/10, 26/30, 34/40 = 86 (Grade A)
        marksRepository.save(new Marks(stu1, se, 5, 17.0, 9.0, 26.0, 34.0));
        // Cloud: 15/20, 8/10, 22/30, 30/40 = 75 (Grade B)
        marksRepository.save(new Marks(stu1, cloud, 5, 15.0, 8.0, 22.0, 30.0));

        // Priya Marks (Top performer)
        marksRepository.save(new Marks(stu2, dbms, 5, 19.0, 10.0, 28.0, 38.0)); // 95 A+
        marksRepository.save(new Marks(stu2, os, 5, 18.0, 9.5, 27.0, 37.0));   // 91.5 A+
        marksRepository.save(new Marks(stu2, cn, 5, 18.5, 9.0, 26.0, 36.0));   // 89.5 A
        marksRepository.save(new Marks(stu2, se, 5, 19.0, 10.0, 29.0, 39.0));  // 97 A+

        // 8. Assignments Seeding
        Assignment a1 = assignmentRepository.save(new Assignment(
                "Database Indexing & B-Trees Analysis",
                "Implement and analyze B+ Tree indexing performance compared to sequential scans in MySQL.",
                dbms, cse, 3, LocalDate.now().plusDays(2), 10, fac1
        ));

        Assignment a2 = assignmentRepository.save(new Assignment(
                "Process Scheduling Algorithms Simulation",
                "Simulate Round Robin, Shortest Job First, and Priority Scheduling algorithms in Java.",
                os, cse, 3, LocalDate.now().plusDays(5), 10, fac1
        ));

        Assignment a3 = assignmentRepository.save(new Assignment(
                "Socket Programming & TCP Handshake",
                "Build a multi-client chat server using Java socket programming and demonstrate 3-way handshake.",
                cn, cse, 3, LocalDate.now().minusDays(1), 10, fac2
        ));

        // 9. Submissions
        // Rahul submitted a3, but a1 and a2 are pending
        submissionRepository.save(new AssignmentSubmission(
                a3, stu1, "https://github.com/rahul-sharma/socket-chat-server-java - Implemented TCP multi-threaded chat server."
        ));

        // Priya submitted a1, a2, a3
        submissionRepository.save(new AssignmentSubmission(
                a1, stu2, "https://github.com/priya-patel/dbms-b-tree-indexing - Comprehensive analysis and query benchmark results."
        ));
        submissionRepository.save(new AssignmentSubmission(
                a2, stu2, "https://github.com/priya-patel/os-scheduler-sim - Java implementation with Gantt chart visualization."
        ));

        // 10. Leave Requests
        LeaveRequest l1 = new LeaveRequest(
                stu1, "Medical", LocalDate.now().plusDays(3), LocalDate.now().plusDays(4),
                "Suffering from viral fever. Doctor advised 2 days bed rest. Medical certificate attached."
        );
        leaveRepository.save(l1);

        LeaveRequest l2 = new LeaveRequest(
                stu2, "Academic", LocalDate.now().minusDays(10), LocalDate.now().minusDays(8),
                "Attending IEEE International Student Conference in Bangalore to present paper."
        );
        l2.setStatus("APPROVED");
        l2.setReviewedBy(fac1);
        l2.setReviewComments("Approved. All the best for the paper presentation.");
        leaveRepository.save(l2);

        // 11. Academic Goals
        goalRepository.save(new AcademicGoal(
                stu1, "Achieve Semester GPA of 8.5", "GPA", 8.5, 7.36, "GPA", LocalDate.now().plusMonths(3)
        ));
        goalRepository.save(new AcademicGoal(
                stu1, "Improve Overall Attendance to 80%", "ATTENDANCE", 80.0, 68.0, "%", LocalDate.now().plusMonths(1)
        ));
        goalRepository.save(new AcademicGoal(
                stu1, "Complete 100% Coursework Assignments", "ASSIGNMENTS", 100.0, 33.3, "%", LocalDate.now().plusWeeks(3)
        ));

        // 12. Achievements
        achievementRepository.save(new Achievement(
                stu1, "State Level Cyber Security Hackathon - 2nd Place", "HACKATHON",
                "Secured 2nd prize among 80 collegiate teams developing an automated vulnerability scanner.",
                LocalDate.of(2025, 11, 15), "https://verify.hackathon.org/cert/CS-2025-098"
        ));

        Achievement ach2 = new Achievement(
                stu2, "AWS Certified Solutions Architect - Associate", "CERTIFICATION",
                "Validated cloud architecture, IAM security, and auto-scaling infrastructure skills.",
                LocalDate.of(2025, 9, 20), "https://aws.amazon.com/verification/AWSSA-99120"
        );
        ach2.setVerified(true);
        ach2.setVerifiedBy("Dr. Robert Vance");
        achievementRepository.save(ach2);

        // 13. Personalized Notices
        noticeRepository.save(new Notice(
                "Urgent: Semester Examination Form Deadline",
                "All 3rd Year students must submit their semester examination registration forms by 5:00 PM Friday. Late submission fees will apply.",
                cse, 3, "URGENT", "Head of Department - CSE"
        ));

        noticeRepository.save(new Notice(
                "Campus Placement Drive: Top Tech Innovators 2026",
                "Pre-placement talks by leading multinational tech recruiters will commence next Monday in the Main Auditorium. Formal attire is mandatory.",
                null, null, "IMPORTANT", "Training & Placement Cell"
        ));

        noticeRepository.save(new Notice(
                "Annual Technical Symposium - Paper Submission Call",
                "Submissions are now open for TECHNOVA 2026. Authors can submit original research papers in AI, Cloud, Cyber Security, and IoT.",
                cse, null, "NORMAL", "Dr. Robert Vance"
        ));
    }
}
