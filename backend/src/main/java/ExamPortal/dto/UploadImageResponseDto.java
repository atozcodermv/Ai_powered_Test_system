package ExamPortal.dto;

import ExamPortal.entities.CommonApiResponse;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UploadImageResponseDto extends CommonApiResponse {
    private String publicId;
}
