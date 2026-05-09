-- Apply after deploying the code changes that move grade ownership to grade.teacher_id.
-- Review duplicate emails before adding the unique constraint.

-- 1. Add the new teacher reference on grade.
ALTER TABLE grade
    ADD COLUMN teacher_id INT NULL;

ALTER TABLE grade
    ADD CONSTRAINT fk_grade_teacher
    FOREIGN KEY (teacher_id) REFERENCES user(id);

-- 2. Backfill the grade teacher from the current teacher users.
-- If a grade currently has multiple teacher rows, this update will need manual cleanup first.
UPDATE grade g
JOIN user u ON u.grade_id = g.id
    AND u.role = 'Teacher'
    AND u.status = 'Active'
SET g.teacher_id = u.id
WHERE g.teacher_id IS NULL;

-- 3. Verify duplicates before making email unique.
SELECT email_id, COUNT(*) AS duplicate_count
FROM user
GROUP BY email_id
HAVING COUNT(*) > 1;

-- 4. Add the unique constraint once duplicates are cleaned up.
ALTER TABLE user
    ADD CONSTRAINT uk_user_email UNIQUE (email_id);

-- 5. Remove the old grade reference from user after verifying the application is stable.
-- Replace user_ibfk_2 with the actual foreign key name from your database if it differs.
ALTER TABLE user
    DROP FOREIGN KEY user_ibfk_2;

ALTER TABLE user
    DROP COLUMN grade_id;
