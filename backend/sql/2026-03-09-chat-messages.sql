CREATE TABLE IF NOT EXISTS chat_messages (
    message_id VARCHAR(64) NOT NULL,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    teacher_id INT NOT NULL,
    student_id INT NOT NULL,
    sender_role VARCHAR(32) NOT NULL,
    message_content VARCHAR(4000) NOT NULL,
    timestamp BIGINT NOT NULL,
    status VARCHAR(32) NOT NULL,
    PRIMARY KEY (message_id),
    INDEX idx_chat_teacher_student_timestamp (teacher_id, student_id, timestamp),
    INDEX idx_chat_receiver_status (receiver_id, status)
);
