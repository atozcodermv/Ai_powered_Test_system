package ExamPortal.dto;

public class AiQuestionRequestDto {
    private String resourceLink;
    private String topic;
    private int numberOfQuestions;
    private String difficulty;
    private Integer marksPerQuestion; // Optional

    public String getResourceLink() {
        return resourceLink;
    }

    public void setResourceLink(String resourceLink) {
        this.resourceLink = resourceLink;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public int getNumberOfQuestions() {
        return numberOfQuestions;
    }

    public void setNumberOfQuestions(int numberOfQuestions) {
        this.numberOfQuestions = numberOfQuestions;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public Integer getMarksPerQuestion() {
        return marksPerQuestion;
    }

    public void setMarksPerQuestion(Integer marksPerQuestion) {
        this.marksPerQuestion = marksPerQuestion;
    }
}
