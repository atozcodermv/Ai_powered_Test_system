package ExamPortal.dto;

public class AiEvaluationResponseDto {
    private int questionId;
    private double awardedMarks;
    private String feedback;

    public int getQuestionId() {
        return questionId;
    }

    public void setQuestionId(int questionId) {
        this.questionId = questionId;
    }

    public double getAwardedMarks() {
        return awardedMarks;
    }

    public void setAwardedMarks(double awardedMarks) {
        this.awardedMarks = awardedMarks;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}
