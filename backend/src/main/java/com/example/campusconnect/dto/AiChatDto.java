package com.example.campusconnect.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AiChatDto {

    public static class Request {
        private String message;
        private Long studentId;
        private List<ChatMessage> history;

        public Request() {}

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public List<ChatMessage> getHistory() {
            return history;
        }

        public void setHistory(List<ChatMessage> history) {
            this.history = history;
        }
    }

    public static class ChatMessage {
        private String role; // "user" or "assistant"
        private String content;

        public ChatMessage() {}

        public ChatMessage(String role, String content) {
            this.role = role;
            this.content = content;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }

    public static class Response {
        private String reply;
        private List<String> suggestions;
        private String studentContextSummary;
        private LocalDateTime timestamp = LocalDateTime.now();

        public Response() {}

        public Response(String reply, List<String> suggestions, String studentContextSummary) {
            this.reply = reply;
            this.suggestions = suggestions;
            this.studentContextSummary = studentContextSummary;
            this.timestamp = LocalDateTime.now();
        }

        public String getReply() {
            return reply;
        }

        public void setReply(String reply) {
            this.reply = reply;
        }

        public List<String> getSuggestions() {
            return suggestions;
        }

        public void setSuggestions(List<String> suggestions) {
            this.suggestions = suggestions;
        }

        public String getStudentContextSummary() {
            return studentContextSummary;
        }

        public void setStudentContextSummary(String studentContextSummary) {
            this.studentContextSummary = studentContextSummary;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }
    }
}
