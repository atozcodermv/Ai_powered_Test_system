package ExamPortal.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignTeacherToGradeRequestDto {

	private int gradeId;

	private int teacherId;

}
