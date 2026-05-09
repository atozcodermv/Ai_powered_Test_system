package ExamPortal.services;

import ExamPortal.dto.AiDescriptiveResponseDto;
import ExamPortal.dto.AiMcqResponseDto;
import ExamPortal.dto.AiQuestionRequestDto;
import ExamPortal.dto.AiEvaluationResponseDto;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.json.JsonReadFeature;
import com.fasterxml.jackson.core.type.TypeReference;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class AiQuestionGenerationService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    public AiQuestionGenerationService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
        this.objectMapper = new ObjectMapper();
        this.objectMapper.reader()
            .with(JsonReadFeature.ALLOW_TRAILING_COMMA);
    }

    private <T> List<T> parseResponse(String rawContent, TypeReference<List<T>> typeReference) {
        if (rawContent == null || rawContent.isBlank()) {
            return Collections.emptyList();
        }

        // 1. Strip markdown code blocks if present
        String cleanContent = rawContent.trim();
        if (cleanContent.startsWith("```")) {
            cleanContent = cleanContent.replaceAll("^```[a-z]*\\n?", "").replaceAll("\\n?```$", "");
        }
        cleanContent = cleanContent.trim();

        try {
            // 2. Parse using configured ObjectMapper that allows trailing commas
            return objectMapper.readValue(cleanContent, typeReference);
        } catch (Exception e) {
            System.err.println("Failed to parse AI JSON response: " + e.getMessage());
            System.err.println("Raw Content: " + cleanContent);
            throw new RuntimeException("AI response parsing failed", e);
        }
    }

    public List<AiMcqResponseDto> generateMcqQuestions(AiQuestionRequestDto request) {
        String topicOrResource = request.getResourceLink() != null && !request.getResourceLink().isEmpty()
                ? request.getResourceLink()
                : request.getTopic();

        String promptMessage = String.format(
                "You are an AI MCQ exam question generator used in an online examination portal.\n\n" +

                        "INPUT INFORMATION:\n" +
                        "Topic or Resource: %s\n" +
                        "Difficulty Level: %s\n" +
                        "Number of Questions: %d\n\n" +

                        "RESOURCE HANDLING RULES:\n" +
                        "1. If the resource is a normal topic, generate questions strictly based on that topic.\n" +
                        "2. If the resource is a YouTube URL, analyze the video content.\n" +
                        "3. If the resource contains a YouTube link, treat it as a video resource and follow this instruction:\n" +
                        "   TRANSCRIPT CONTENT YouTube video: %s\n" + " Then generate the %d mcq question on bases of TRANSCRIPT CONTENT that we get from the YouTube video link "+
                        "4. If the resource is a blog or article link, read the article carefully.\n" +
                        "5. If the resource contains a blog/article URL, treat it as a reading resource and follow this instruction:\n" +
                        "   Read this blog/article: %s\n" +
                        "6. Generate questions only from the concepts explained in the resource.\n" +
                        "7. Do NOT generate unrelated questions.\n\n" +

                        "QUESTION RULES:\n" +
                        "• Each question must test conceptual understanding.\n" +
                        "• Each question must have exactly 4 options.\n" +
                        "• The correctAnswer must match option1, option2, option3, or option4.\n" +
                        "• questionText and options must be concise (max 20 words each) to avoid truncation.\n" +
                        "• Questions must match the requested difficulty level.\n\n" +

                        "RESPONSE FORMAT RULES:\n" +
                        "- Return ONLY valid JSON.\n" +
                        "- Do NOT include explanations.\n" +
                        "- Do NOT include markdown formatting.\n" +
                        "- Do NOT include comments.\n" +
                        "- Do NOT include trailing commas.\n" +
                        "- ESCAPE ALL double quotes and backslashes within strings properly.\n" +
                        "- Ensure JSON can be parsed directly by Java.\n\n" +

                        "STRICT JSON FORMAT:\n" +
                        "[\n" +
                        "  {\n" +
                        "    \"questionText\": \"Question text\",\n" +
                        "    \"options\": {\n" +
                        "      \"option1\": \"Option text\",\n" +
                        "      \"option2\": \"Option text\",\n" +
                        "      \"option3\": \"Option text\",\n" +
                        "      \"option4\": \"Option text\"\n" +
                        "    },\n" +
                        "    \"correctAnswer\": \"option1\"\n" +
                        "  }\n" +
                        "]\n\n" +

                        "Generate exactly %d questions.",
                topicOrResource,
                request.getDifficulty(),
                request.getNumberOfQuestions(),
                topicOrResource,
                request.getNumberOfQuestions(),
                topicOrResource,
                request.getNumberOfQuestions()
        );

        String rawResponse = chatClient.prompt()
                .user(promptMessage)
                .call()
                .content();

        return parseResponse(rawResponse, new TypeReference<List<AiMcqResponseDto>>() {});
    }

    public List<AiDescriptiveResponseDto> generateDescriptiveQuestions(AiQuestionRequestDto request) {
        String topicOrResource = request.getResourceLink() != null && !request.getResourceLink().isEmpty()
                ? request.getResourceLink()
                : request.getTopic();

        String promptMessage = String.format(
                "You are an AI system used in an online examination portal to generate descriptive / long-answer questions.\n\n" +

                        "INPUT INFORMATION:\n" +
                        "Topic or Resource: %s\n" +
                        "Difficulty Level: %s\n" +
                        "Number of Questions: %d\n\n" +

                        "RESOURCE HANDLING RULES:\n" +
                        "1. If the resource is a normal topic, generate questions strictly based on that topic.\n" +
                        "2. If the resource is a YouTube URL, analyze the video content.\n" +
                        "3. If the resource contains a YouTube link, treat it as a video resource and follow this instruction:\n" +
                        "   Watch this YouTube video: %s\n" +
                        "4. If the resource is a blog or article link, read the blog/article content and generate questions based only on the concepts explained in the article.\n" +
                        "5. If the resource contains a blog/article URL, treat it as a reading resource and follow this instruction:\n" +
                        "   Read this blog/article: %s\n" +
                        "6. Generate questions only from the concepts explained in the resource.\n" +
                        "7. Do NOT generate unrelated questions.\n\n" +

                        "QUESTION RULES:\n" +
                        "• Each question must require a detailed but CONCISE explanation.\n" +
                        "• questionText must never be empty.\n" +
                        "• Questions must match the requested difficulty level.\n\n" +

                        "RESPONSE FORMAT RULES:\n" +
                        "- Return ONLY valid JSON.\n" +
                        "- Do NOT include explanations outside JSON.\n" +
                        "- Do NOT include markdown formatting.\n" +
                        "- Do NOT include comments.\n" +
                        "- Do NOT include trailing commas.\n" +
                        "- ESCAPE ALL double quotes, backslashes and special characters within strings for valid JSON.\n" +
                        "- Ensure JSON can be parsed directly by Java.\n\n" +

                        "STRICT JSON FORMAT:\n" +
                        "[\n" +
                        "  {\n" +
                        "    \"questionText\": \"The descriptive question text\"\n" +
                        "  }\n" +
                        "]\n\n" +

                        "Generate exactly %d questions.",
                topicOrResource,
                request.getDifficulty(),
                request.getNumberOfQuestions(),
                topicOrResource,
                topicOrResource,
                request.getNumberOfQuestions()
        );

        String rawResponse = chatClient.prompt()
                .user(promptMessage)
                .call()
                .content();

        return parseResponse(rawResponse, new TypeReference<List<AiDescriptiveResponseDto>>() {});
    }

    public List<AiEvaluationResponseDto> evaluateDescriptiveAnswers(List<Map<String, Object>> gradingBatch) {
        String batchJson;
        try {
            batchJson = objectMapper.writeValueAsString(gradingBatch);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize grading batch", e);
        }

        String promptMessage = String.format(
                "You are an expert AI teacher evaluating student answers for a descriptive exam.\n\n" +

                        "INPUT BATCH (JSON):\n" +
                        "%s\n\n" +

                        "EVALUATION INSTRUCTIONS:\n" +
                        "The input contains multiple questions and student answers. Each question has its own 'totalMarks'.\n\n" +

                        "GRADING RULES:\n" +
                        "1. Evaluate each student's answer using your general academic knowledge of the topic.\n" +
                        "2. Do NOT rely only on the wording of the question text.\n" +
                        "3. Use external conceptual knowledge to determine if the student's answer is correct, complete, and conceptually accurate.\n" +
                        "4. Consider correctness, completeness, clarity, and conceptual understanding.\n" +
                        "5. Each question includes a 'totalMarks' value which represents the maximum marks for that question.\n" +
                        "6. Assign 'awardedMarks' proportionally based on answer quality.\n" +
                        "7. 'awardedMarks' MUST always be between 0 and the 'totalMarks' of that specific question.\n" +
                        "8. NEVER assume a fixed grading scale like 10 or 100. Always use the provided 'totalMarks'.\n" +
                        "9. Evaluate each question independently because different questions may have different totalMarks (20, 30, 40, 50, etc.).\n" +
                        "10. Use decimal marks only if necessary (example: 12.5).\n\n" +

                        "FEEDBACK RULES:\n" +
                        "- Provide a short feedback (1–2 sentences).\n" +
                        "- Mention missing concepts or incorrect explanations if any.\n\n" +

                        "RESPONSE FORMAT RULES:\n" +
                        "- Return ONLY valid JSON.\n" +
                        "- Do NOT include markdown formatting.\n" +
                        "- Do NOT include comments or explanations outside JSON.\n" +
                        "- Escape quotes and special characters properly.\n\n" +

                        "STRICT JSON FORMAT:\n" +
                        "[\n" +
                        "  {\n" +
                        "    \"questionId\": 123,\n" +
                        "    \"awardedMarks\": 18,\n" +
                        "    \"feedback\": \"Answer demonstrates basic understanding but misses key concepts.\"\n" +
                        "  }\n" +
                        "]\n",
                batchJson
        );

        String rawResponse = chatClient.prompt()
                .user(promptMessage)
                .call()
                .content();

        return parseResponse(rawResponse, new TypeReference<List<AiEvaluationResponseDto>>() {});
    }
}
