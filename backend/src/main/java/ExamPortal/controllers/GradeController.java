package ExamPortal.controllers;

import ExamPortal.entities.CommonApiResponse;
import ExamPortal.dto.AssignTeacherToGradeRequestDto;
import ExamPortal.dto.GradeResponseDto;
import ExamPortal.entities.Grade;
import ExamPortal.resource.GradeResource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/grade")
@CrossOrigin(origins = "http://localhost:3000")
public class GradeController {
	
	@Autowired
	private GradeResource gradeResource;
	
	@PostMapping("/add")
	// Api to add grade
	public ResponseEntity<CommonApiResponse> addGrade(@RequestBody Grade grade) {
		return gradeResource.addGrade(grade);
	}
	
	@PutMapping("/update")
	// Api to update grade
	public ResponseEntity<CommonApiResponse> updateGrade(@RequestBody Grade grade) {
		return gradeResource.updateGrade(grade);
	}

	@PostMapping("/teacher/add")
	public ResponseEntity<CommonApiResponse> addTeacherToGrade(@RequestBody AssignTeacherToGradeRequestDto request) {
		return gradeResource.addTeacherToGrade(request);
	}
	
	@GetMapping("/fetch/all")
	// Api to fetch all grade
	public ResponseEntity<GradeResponseDto> fetchAllGrade() {
		return gradeResource.fetchAllGrade();
	}
	
	@DeleteMapping("/delete")
	// Api to delete grade
	public ResponseEntity<CommonApiResponse> deleteGrade(@RequestParam("gradeId") int gradeId) {
		return gradeResource.deleteGrade(gradeId);
	}

}
