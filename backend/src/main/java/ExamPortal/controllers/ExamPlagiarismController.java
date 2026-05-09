package ExamPortal.controllers;

import ExamPortal.dto.PlagiarismCheckRequestDto;
import ExamPortal.dto.PlagiarismResponseDto;
import ExamPortal.resource.ExamPlagiarismResource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/descriptive/plagiarism")
@CrossOrigin(origins = "http://localhost:3000")
public class ExamPlagiarismController {

    @Autowired
    private ExamPlagiarismResource examPlagiarismResource;

    @PostMapping("/check")
    public ResponseEntity<PlagiarismResponseDto> checkPlagiarism(@RequestBody PlagiarismCheckRequestDto request) {
        return examPlagiarismResource.checkPlagiarism(request);
    }

    @GetMapping("/student")
    @CrossOrigin(origins = "http://localhost:3000")
    public ResponseEntity<PlagiarismResponseDto> fetchPlagiarismByStudent(@RequestParam("studentId") int studentId) {
        return examPlagiarismResource.fetchPlagiarismByStudent(studentId);
    }
}
