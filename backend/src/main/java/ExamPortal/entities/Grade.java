package ExamPortal.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Entity
public class Grade {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	private String name;

	private String description;

	private String status;

	@Transient
	@JsonIgnoreProperties({"teacher", "password", "authorities", "enabled", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "username"})
	private User teacher;

	@ManyToMany(fetch = FetchType.EAGER)
	@JoinTable(
			name = "grade_teacher_mapping",
			joinColumns = @JoinColumn(name = "grade_id"),
			inverseJoinColumns = @JoinColumn(name = "teacher_id")
	)
	@JsonIgnoreProperties({"teacher", "password", "authorities", "enabled", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "username"})
	private List<User> teachers = new ArrayList<>();

	@Transient
	private int teacherId;

	public User getTeacher() {
		if (teacher != null) {
			return teacher;
		}

		if (teachers != null && !teachers.isEmpty()) {
			return teachers.get(0);
		}

		return null;
	}

	public void setTeacher(User teacher) {
		this.teacher = teacher;
	}

}
