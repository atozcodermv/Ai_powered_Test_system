import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { config } from "../ConsantsFile/Constants";
import PageStateMessage from "../CommonComponent/PageStateMessage";
import {
  getActiveTeacher,
  getTeacherAssignedGrades,
  getTeacherGradeGuardMessage,
} from "../utils/teacherSession";
import "./AddExamForm.css";

const url = config.url.BASE_URL;

const examTypeOptions = [
  { value: "Objective", label: "MCQ Exam" },
  { value: "Descriptive", label: "Descriptive Exam" },
];

const createEmptyScheduleErrors = () => ({
  startTime: "",
  endTime: "",
  duration: "",
});

const formatDateTimeLocal = (date) => {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const getCurrentMinuteTimestamp = () => {
  const currentDate = new Date();
  currentDate.setSeconds(0, 0);
  return currentDate.getTime();
};

const getScheduleValidationErrors = ({ startTime, endTime, duration }) => {
  const errors = createEmptyScheduleErrors();
  const trimmedDuration = String(duration ?? "").trim();
  const hasStartTime = Boolean(startTime);
  const hasEndTime = Boolean(endTime);
  const startTimeInMillis = hasStartTime ? new Date(startTime).getTime() : NaN;
  const endTimeInMillis = hasEndTime ? new Date(endTime).getTime() : NaN;

  if (!hasStartTime) {
    errors.startTime = "Please select the exam start time.";
  } else if (startTimeInMillis < getCurrentMinuteTimestamp()) {
    errors.startTime = "Exam start time cannot be in the past.";
  }

  if (!hasEndTime) {
    errors.endTime = "Please select the exam end time.";
  } else if (
    hasStartTime &&
    !Number.isNaN(startTimeInMillis) &&
    endTimeInMillis <= startTimeInMillis
  ) {
    errors.endTime = "Exam end time must be greater than the start time.";
  }

  if (!trimmedDuration) {
    errors.duration = "Please enter the duration in minutes.";
  } else {
    const durationInMinutes = Number(trimmedDuration);

    if (!Number.isFinite(durationInMinutes) || durationInMinutes <= 0) {
      errors.duration = "Duration in minutes must be greater than zero.";
    } else if (
      hasStartTime &&
      hasEndTime &&
      !Number.isNaN(startTimeInMillis) &&
      !Number.isNaN(endTimeInMillis) &&
      endTimeInMillis > startTimeInMillis &&
      endTimeInMillis - startTimeInMillis < durationInMinutes * 60 * 1000
    ) {
      errors.duration =
        "Exam duration cannot exceed the total time window between the start and end time.";
    }
  }

  return errors;
};

const AddExamForm = () => {
  const teacher = getActiveTeacher();
  const assignedGrades = getTeacherAssignedGrades(teacher);
  const guardMessage = getTeacherGradeGuardMessage(teacher);
  const navigate = useNavigate();

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [allCourses, setAllCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduleTouched, setScheduleTouched] = useState({
    startTime: false,
    endTime: false,
    duration: false,
  });
  const [scheduleErrors, setScheduleErrors] = useState(createEmptyScheduleErrors);
  const [examRequest, setExamRequest] = useState({
    name: "",
    teacherId: teacher?.id || "",
    courseId: "",
    gradeId: "",
    startTime: "",
    endTime: "",
    duration: "",
    examType: "",
    description: "",
    topic: "",
    path: "",
  });
  const currentDateTimeMin = formatDateTimeLocal(new Date());

  const selectedGrade = useMemo(
    () => assignedGrades.find((grade) => String(grade.id) === String(examRequest.gradeId)) || null,
    [assignedGrades, examRequest.gradeId]
  );

  const touchScheduleField = (fieldName) => {
    setScheduleTouched((prev) =>
      prev[fieldName] ? prev : { ...prev, [fieldName]: true }
    );
  };

  const shouldShowScheduleError = (fieldName) =>
    scheduleTouched[fieldName] && Boolean(scheduleErrors[fieldName]);

  const handleUserInput = (event) => {
    const { name, value } = event.target;

    if (name === "duration") {
      touchScheduleField("duration");
    }

    setExamRequest((prev) => ({ ...prev, [name]: value }));
  };

  const handleGradeChange = (event) => {
    const nextGradeId = event.target.value;
    setExamRequest((prev) => ({
      ...prev,
      gradeId: nextGradeId,
      courseId: "",
    }));
    setAllCourses([]);
  };

  const handleStartTimeChange = (event) => {
    touchScheduleField("startTime");
    setStartTime(event.target.value);
  };

  const handleEndTimeChange = (event) => {
    touchScheduleField("endTime");
    setEndTime(event.target.value);
  };

  useEffect(() => {
    setExamRequest((prev) => ({
      ...prev,
      teacherId: teacher?.id || "",
    }));
  }, [teacher?.id]);

  useEffect(() => {
    const getAllCourse = async () => {
      if (guardMessage || !examRequest.gradeId) {
        setAllCourses([]);
        return;
      }

      setIsLoadingCourses(true);

      try {
        const allCourse = await retrieveAllCourses(examRequest.gradeId);
        if (allCourse?.success) {
          setAllCourses(allCourse.courses || []);
          return;
        }

        if (allCourse?.responseMessage === "No Course found") {
          setAllCourses([]);
          return;
        }

        toast.error(allCourse?.responseMessage || "Unable to load courses.", {
          position: "top-center",
          autoClose: 1500,
        });
      } catch (error) {
        console.error(error);
        toast.error("Unable to load courses right now.", {
          position: "top-center",
          autoClose: 1500,
        });
      } finally {
        setIsLoadingCourses(false);
      }
    };

    getAllCourse();
  }, [examRequest.gradeId, guardMessage]);

  useEffect(() => {
    setScheduleErrors(
      getScheduleValidationErrors({
        startTime,
        endTime,
        duration: examRequest.duration,
      })
    );
  }, [endTime, examRequest.duration, startTime]);

  const retrieveAllCourses = async (gradeId) => {
    const response = await axios.get(
      `${url}/course/fetch/all/grade-wise?gradeId=${gradeId}`
    );
    return response.data;
  };

  const validateRequest = () => {
    if (!examRequest.name.trim()) {
      return "Please enter an exam name.";
    }

    if (!examRequest.gradeId) {
      return "Please select a grade.";
    }

    if (!examRequest.courseId) {
      return "Please select a course.";
    }

    if (!examRequest.topic.trim()) {
      return "Please enter an exam topic.";
    }

    if (!examRequest.examType) {
      return "Please select an exam type.";
    }

    return "";
  };

  const saveExam = async (event) => {
    event.preventDefault();

    if (guardMessage) {
      toast.error(guardMessage, {
        position: "top-center",
        autoClose: 1500,
      });
      return;
    }

    setScheduleTouched({
      startTime: true,
      endTime: true,
      duration: true,
    });

    const nextScheduleErrors = getScheduleValidationErrors({
      startTime,
      endTime,
      duration: examRequest.duration,
    });
    setScheduleErrors(nextScheduleErrors);

    if (Object.values(nextScheduleErrors).some(Boolean)) {
      return;
    }

    const validationMessage = validateRequest();
    if (validationMessage) {
      toast.error(validationMessage, {
        position: "top-center",
        autoClose: 1500,
      });
      return;
    }

    const payload = {
      ...examRequest,
      duration: Number(examRequest.duration),
      startTime: new Date(startTime).getTime(),
      endTime: new Date(endTime).getTime(),
    };

    setIsSubmitting(true);

    try {
      const result = await fetch(`${url}/exam/add`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const res = await result.json();

      if (res.success) {
        toast.success(res.responseMessage, {
          position: "top-center",
          autoClose: 1000,
        });

        setTimeout(() => {
          const createdExam = res.exams?.[0];
          const nextRoute =
            createdExam?.examType === "Descriptive"
              ? "/exam/descriptivequestion"
              : "/exam/questions";
          navigate(nextRoute, { state: createdExam });
        }, 1200);
        return;
      }

      toast.error(res.responseMessage || "Unable to create exam.", {
        position: "top-center",
        autoClose: 1000,
      });

      setTimeout(() => {
        window.location.href = "/home";
      }, 1500);
    } catch (error) {
      console.error(error);
      toast.error("It seems server is down", {
        position: "top-center",
        autoClose: 1000,
      });
      setTimeout(() => {
        window.location.href = "/home";
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (guardMessage) {
    return (
      <PageStateMessage
        title="Cannot Schedule Exam"
        message={guardMessage}
      />
    );
  }

  return (
    <section className="add-exam-page py-4 py-md-5">
      <div className="container">
        <Card className="add-exam-shell border-0 overflow-hidden">
          <Card.Body className="p-0">
            <Row className="g-0">
              <Col lg={5} className="add-exam-aside">
                <div className="add-exam-aside__content">
                  <span className="add-exam-kicker">Exam Workspace</span>
                  <h2 className="add-exam-title">Schedule a new exam with clarity.</h2>
                  <p className="add-exam-copy">
                    Define timing, topic, grade, and course in one place before moving
                    on to question creation.
                  </p>

                  <div className="add-exam-meta">
                    <Badge bg="light" text="dark" pill>
                      {selectedGrade ? `Grade ${selectedGrade.name}` : "Select a grade"}
                    </Badge>
                    <Badge bg="light" text="dark" pill>
                      Teacher ID {teacher?.id}
                    </Badge>
                  </div>

                  <div className="add-exam-note">
                    <h6 className="mb-2">Before you submit</h6>
                    <p className="mb-2">
                      Start by choosing one of your assigned grades, then pick the
                      matching course for the exam.
                    </p>
                    <p className="mb-0">
                      Objective exams continue to question setup, while descriptive
                      exams move to the descriptive builder.
                    </p>
                  </div>
                </div>
              </Col>

              <Col lg={7} className="add-exam-form-pane">
                <div className="add-exam-form-wrap">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
                    <div>
                      <h3 className="mb-1 text-color">Create Exam</h3>
                      <p className="text-muted mb-0">
                        Complete the details below to publish the exam shell.
                      </p>
                    </div>
                    <Badge className="add-exam-status-badge" pill>
                      {isLoadingCourses ? "Loading courses" : `${allCourses.length} courses available`}
                    </Badge>
                  </div>

                  <Form onSubmit={saveExam}>
                    <Row className="g-3">
                      <Col md={12}>
                        <Form.Group controlId="examName">
                          <Form.Label>Exam Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            placeholder="Midterm Assessment"
                            value={examRequest.name}
                            onChange={handleUserInput}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group controlId="gradeId">
                          <Form.Label>Grade</Form.Label>
                          <Form.Select
                            name="gradeId"
                            value={examRequest.gradeId}
                            onChange={handleGradeChange}
                          >
                            <option value="">Select grade</option>
                            {assignedGrades.map((grade) => (
                              <option key={grade.id} value={grade.id}>
                                {grade.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group controlId="courseId">
                          <Form.Label>Course</Form.Label>
                          <Form.Select
                            name="courseId"
                            value={examRequest.courseId}
                            onChange={handleUserInput}
                            disabled={!examRequest.gradeId || isLoadingCourses}
                          >
                            <option value="">
                              {!examRequest.gradeId
                                ? "Select grade first"
                                : isLoadingCourses
                                ? "Loading courses..."
                                : allCourses.length
                                ? "Select course"
                                : "No courses available"}
                            </option>
                            {allCourses.map((course) => (
                              <option key={course.id} value={course.id}>
                                {course.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group controlId="startTime">
                          <Form.Label>Exam Start Time</Form.Label>
                          <Form.Control
                            type="datetime-local"
                            min={currentDateTimeMin}
                            value={startTime}
                            onChange={handleStartTimeChange}
                            onBlur={() => touchScheduleField("startTime")}
                            isInvalid={shouldShowScheduleError("startTime")}
                          />
                          {shouldShowScheduleError("startTime") && (
                            <div className="add-exam-field-error">
                              {scheduleErrors.startTime}
                            </div>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group controlId="endTime">
                          <Form.Label>Exam End Time</Form.Label>
                          <Form.Control
                            type="datetime-local"
                            min={startTime || currentDateTimeMin}
                            value={endTime}
                            onChange={handleEndTimeChange}
                            onBlur={() => touchScheduleField("endTime")}
                            isInvalid={shouldShowScheduleError("endTime")}
                          />
                          {shouldShowScheduleError("endTime") && (
                            <div className="add-exam-field-error">
                              {scheduleErrors.endTime}
                            </div>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group controlId="duration">
                          <Form.Label>Duration in Minutes</Form.Label>
                          <InputGroup hasValidation>
                            <Form.Control
                              type="number"
                              min="1"
                              step="1"
                              name="duration"
                              placeholder="60"
                              value={examRequest.duration}
                              onChange={handleUserInput}
                              onBlur={() => touchScheduleField("duration")}
                              isInvalid={shouldShowScheduleError("duration")}
                            />
                            <InputGroup.Text
                              className={
                                shouldShowScheduleError("duration")
                                  ? "add-exam-input-group-text--invalid"
                                  : ""
                              }
                            >
                              mins
                            </InputGroup.Text>
                          </InputGroup>
                          {shouldShowScheduleError("duration") && (
                            <div className="add-exam-field-error">
                              {scheduleErrors.duration}
                            </div>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group controlId="examType">
                          <Form.Label>Exam Type</Form.Label>
                          <Form.Select
                            name="examType"
                            value={examRequest.examType}
                            onChange={handleUserInput}
                          >
                            <option value="">Select exam type</option>
                            {examTypeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group controlId="topic">
                          <Form.Label>Topic</Form.Label>
                          <Form.Control
                            type="text"
                            name="topic"
                            placeholder="Algebraic Expressions"
                            value={examRequest.topic}
                            onChange={handleUserInput}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group controlId="path">
                          <Form.Label>Resource Path</Form.Label>
                          <Form.Control
                            type="text"
                            name="path"
                            placeholder="Optional file or folder path"
                            value={examRequest.path}
                            onChange={handleUserInput}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group controlId="description">
                          <Form.Label>Description</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            name="description"
                            placeholder="Add short instructions, coverage notes, or exam context."
                            value={examRequest.description}
                            onChange={handleUserInput}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="add-exam-actions">
                      <Button
                        type="submit"
                        className="add-exam-submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Adding Exam...
                          </>
                        ) : (
                          "Add Exam"
                        )}
                      </Button>
                    </div>
                  </Form>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    </section>
  );
};

export default AddExamForm;

