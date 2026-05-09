package ExamPortal.services.impl;


import ExamPortal.repositories.GradeRepository;
import ExamPortal.entities.Grade;
import ExamPortal.entities.User;
import ExamPortal.services.GradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class GradeServiceImpl implements GradeService {

	@Autowired
	private GradeRepository gradeRepository;

	@Override
	public Grade addGrade(Grade grade) {
		return gradeRepository.save(grade);
	}

	@Override
	public Grade updateGrade(Grade grade) {
		return gradeRepository.save(grade);
	}

	@Override
	public Grade getGradeById(int gradeId) {
		Optional<Grade> optionalGrade = gradeRepository.findById(gradeId);

		if (optionalGrade.isPresent()) {
			return optionalGrade.get();
		} else {
			return null;
		}
	}

	@Override
	public List<Grade> getGradesByTeacherAndStatus(User teacher, String status) {
		Map<Integer, Grade> gradesById = new LinkedHashMap<>();

		for (Grade grade : this.gradeRepository.findByTeachersContainingAndStatus(teacher, status)) {
			gradesById.put(grade.getId(), grade);
		}

		return new ArrayList<>(gradesById.values());
	}

	@Override
	public List<Grade> getAllGradesByStatus(String status) {
		return this.gradeRepository.findByStatus(status);
	}

}
