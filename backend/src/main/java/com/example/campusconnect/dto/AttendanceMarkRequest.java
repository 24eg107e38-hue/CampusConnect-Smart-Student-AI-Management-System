package com.example.campusconnect.dto;

import java.time.LocalDate;
import java.util.List;

public class AttendanceMarkRequest {
    private Long subjectId;
    private LocalDate attendanceDate;
    private List<StudentAttendanceItem> students;

    public static class StudentAttendanceItem {
        private Long studentId;
        private String status; // PRESENT or ABSENT
        private String remarks;

        public StudentAttendanceItem() {}

        public StudentAttendanceItem(Long studentId, String status, String remarks) {
            this.studentId = studentId;
            this.status = status;
            this.remarks = remarks;
        }

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getRemarks() {
            return remarks;
        }

        public void setRemarks(String remarks) {
            this.remarks = remarks;
        }
    }

    public AttendanceMarkRequest() {}

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public List<StudentAttendanceItem> getStudents() {
        return students;
    }

    public void setStudents(List<StudentAttendanceItem> students) {
        this.students = students;
    }
}
