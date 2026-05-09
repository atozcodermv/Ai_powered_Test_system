package ExamPortal.services;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class StudentDoubtChatService {

    private final ChatClient chatClient;

    public StudentDoubtChatService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String solveDoubt(String studentName, String question) {
        String safeStudentName = studentName == null || studentName.isBlank() ? "Student" : studentName.trim();

        return this.chatClient.prompt()
                .system("""
                        You are an AI Doubt Solver for a Smart Exam Portal student system.
                        Answer in a clear, accurate, student-friendly way.
                        Keep the response focused on the student's doubt.
                        Use short paragraphs or bullets when helpful.
                        If the question is ambiguous, mention the ambiguity briefly and provide the most likely explanation.
                        Do not claim actions you cannot perform.
                        """)
                .user("Student Name: " + safeStudentName + "\nQuestion: " + question)
                .call()
                .content();
    }
}
