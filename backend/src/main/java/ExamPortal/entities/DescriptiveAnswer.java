package ExamPortal.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
public class DescriptiveAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private DescriptiveQuestion question;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private User student;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String answerContent;

    private Double score;

    private String evaluationStatus;

    private String submitTime;

    private String evaluatedTime;
}
