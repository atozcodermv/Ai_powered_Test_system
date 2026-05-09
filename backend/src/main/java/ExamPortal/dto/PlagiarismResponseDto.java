package ExamPortal.dto;

import ExamPortal.entities.CommonApiResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class PlagiarismResponseDto extends CommonApiResponse {
    private List<PlagiarismResultDto> results;
}
