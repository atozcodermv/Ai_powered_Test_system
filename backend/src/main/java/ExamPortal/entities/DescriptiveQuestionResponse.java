package ExamPortal.entities;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
public class DescriptiveQuestionResponse extends CommonApiResponse {

    private List<DescriptiveQuestion> questions = new ArrayList<>();
}
