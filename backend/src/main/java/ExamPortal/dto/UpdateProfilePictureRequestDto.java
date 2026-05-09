package ExamPortal.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UpdateProfilePictureRequestDto {
    private int userId;
    private String publicId;
}
