package ExamPortal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PlagiarismResultDto {
    private int studentId;
    private String studentName;
    private Double similarityPercentage;
    private Boolean plagiarismStatus;
}
