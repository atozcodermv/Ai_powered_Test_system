package ExamPortal.dto;

import lombok.Data;
import java.util.List;

@Data
public class PlagiarismCheckRequestDto {
    private int examId;
    private List<StudentSubmissionDto> submissions;

    @Data
    public static class StudentSubmissionDto {
        private int studentId;
        private String studentName;
        private List<AnswerDto> answers;
    }

    @Data
    public static class AnswerDto {
        private String questionContent;
        private String answerContent;
    }
}
