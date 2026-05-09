package ExamPortal.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
public class DescriptiveQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "exam_id")
    @JsonIgnore
    private Exam exam;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String questionContent;

    private double totalMarks;

    private String createdTime;

    private String updatedTime;

    @Transient
    private String answerContent;

    @Transient
    private Double awardedScore;

    @Transient
    private String evaluationStatus;
}
