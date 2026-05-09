package ExamPortal.controllers;

import ExamPortal.dto.AiDescriptiveResponseDto;
import ExamPortal.dto.AiMcqResponseDto;
import ExamPortal.dto.AiQuestionRequestDto;
import ExamPortal.services.AiQuestionGenerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai/generate")
@CrossOrigin(origins = "*")
public class AiQuestionGenerationController {

    @Autowired
    private AiQuestionGenerationService aiQuestionGenerationService;

    @PostMapping("/mcq")
    public ResponseEntity<?> generateMcq(@RequestBody AiQuestionRequestDto request) {
        try {
            List<AiMcqResponseDto> questions = aiQuestionGenerationService.generateMcqQuestions(request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("questions", questions);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("responseMessage", "Failed to generate questions: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/descriptive")
    public ResponseEntity<?> generateDescriptive(@RequestBody AiQuestionRequestDto request) {
        try {
            List<AiDescriptiveResponseDto> questions = aiQuestionGenerationService.generateDescriptiveQuestions(request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("questions", questions);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("responseMessage", "Failed to generate questions: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
