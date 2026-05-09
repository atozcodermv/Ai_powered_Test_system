package ExamPortal.entities;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
public class DescriptiveEvaluationResponse extends CommonApiResponse {

    private List<Exam> exams = new ArrayList<>();

    private List<DescriptiveEvaluationView> submissions = new ArrayList<>();
}
