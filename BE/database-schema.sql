-- ====================================================================
-- FULL DATABASE SCRIPT: SKILLSPRINT (Review 2)
-- Tự động xóa DB cũ (nếu có) và tạo mới hoàn toàn
-- ====================================================================

DROP DATABASE IF EXISTS academic_collaboration_db;
CREATE DATABASE academic_collaboration_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE academic_collaboration_db;

-- ==========================================
-- 1. CREATE TABLES (Cấu trúc các bảng)
-- ==========================================

-- Bảng Người dùng
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_code VARCHAR(20) UNIQUE NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    avatar_url TEXT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('manager', 'lecturer', 'student') NOT NULL DEFAULT 'student',
    is_email_verified BOOLEAN DEFAULT FALSE,
    otp VARCHAR(6) NULL,
    otp_expires DATETIME NULL,
    refresh_token TEXT NULL,
    fcm_token TEXT NULL,
    status ENUM('Online', 'Offline', 'Away') DEFAULT 'Offline',
    is_online BOOLEAN DEFAULT FALSE,
    last_seen_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_student_code (student_code),
    INDEX idx_role (role)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng Học kỳ (Semesters)
CREATE TABLE semesters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('Upcoming', 'Active', 'Completed') DEFAULT 'Upcoming',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_status (status)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng Đề tài
CREATE TABLE topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    proposed_by INT,
    approved_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proposed_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng Lớp học
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL,
    semester_id INT,
    lecturer_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE SET NULL,
    FOREIGN KEY (lecturer_id) REFERENCES users(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng Enrollment (Phân bổ Sinh viên vào Lớp)
CREATE TABLE class_enrollments (
    class_id INT,
    student_id INT,
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (class_id, student_id),
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng Nhóm Sinh viên
CREATE TABLE student_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    class_id INT,
    topic_id INT NULL,
    group_status ENUM('PENDING', 'CONFIRMED') DEFAULT 'PENDING',
    confirmed_by INT NULL,
    confirmed_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL,
    FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng Thành viên Nhóm (Nhiều-Nhiều giữa Sinh viên và Nhóm)
CREATE TABLE group_members (
    group_id INT,
    student_id INT,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, student_id),
    FOREIGN KEY (group_id) REFERENCES student_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng Cài đặt người dùng
CREATE TABLE user_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    enable_cloudinary_upload BOOLEAN DEFAULT TRUE,
    enable_ai_assistant BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng Câu hỏi Q&A
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    group_id INT,
    asked_by INT,
    status ENUM('WAITING_LECTURER', 'ESCALATED_TO_MANAGER', 'RESOLVED') DEFAULT 'WAITING_LECTURER',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES student_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (asked_by) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng Câu trả lời Q&A
CREATE TABLE answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT,
    answered_by INT,
    content TEXT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (answered_by) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng Bài nộp (Submissions)
CREATE TABLE submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    submitted_by INT NOT NULL,
    milestone_name VARCHAR(100) NULL,
    file_url TEXT NULL,
    file_path TEXT NULL,
    notes TEXT NULL,
    status ENUM('SUBMITTED', 'GRADED') DEFAULT 'SUBMITTED',
    grade DECIMAL(5,2) NULL,
    feedback TEXT NULL,
    graded_by INT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    graded_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES student_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_submission_group (group_id),
    INDEX idx_submission_submitter (submitted_by),
    INDEX idx_submission_status (status)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng Task Board
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    created_by INT NOT NULL,
    assignee_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
    status ENUM('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE') DEFAULT 'TODO',
    tags TEXT NULL,
    due_date DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES student_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_task_group (group_id),
    INDEX idx_task_creator (created_by),
    INDEX idx_task_assignee (assignee_id),
    INDEX idx_task_status (status)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ==========================================
-- 2. INSERT MOCK DATA (Dữ liệu mẫu)
-- ==========================================

-- Thêm Users chi tiết (Password: 123456 - đã mã hóa bằng bcrypt)
INSERT INTO users (id, student_code, full_name, email, avatar_url, password_hash, role) VALUES
-- Cán bộ quản lý (Manager)
(1, NULL, 'Nguyễn Minh Tiến', 'tiennm@fe.edu.vn', 'https://res.cloudinary.com/dxkjhyrxn/image/upload/v1773721746/avatars/gthuckf7isik8hiybgqx.jpg', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'manager'),

-- Giảng viên (Lecturers)
(2, NULL, 'Trần Tấn Phát', 'phattt@fe.edu.vn', 'https://res.cloudinary.com/dxkjhyrxn/image/upload/v1773721746/avatars/gthuckf7isik8hiybgqx.jpg', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'lecturer'),
(3, NULL, 'Nguyễn Thị Ngọc Uyên', 'uyenntn@fe.edu.vn', 'https://res.cloudinary.com/dxkjhyrxn/image/upload/v1773721746/avatars/gthuckf7isik8hiybgqx.jpg', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'lecturer'),
(8, NULL, 'Lê Quang Huy', 'huylq@fe.edu.vn', 'https://res.cloudinary.com/dxkjhyrxn/image/upload/v1773721746/avatars/gthuckf7isik8hiybgqx.jpg', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'lecturer'),
(9, NULL, 'Phạm Tuấn Anh', 'anhpt@fe.edu.vn', 'https://res.cloudinary.com/dxkjhyrxn/image/upload/v1773721746/avatars/gthuckf7isik8hiybgqx.jpg', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'lecturer'),

-- Sinh viên (Students)
(4, 'SE182669', 'Lâm Anh Khoa', 'khoalase182669@fpt.edu.vn', 'https://res.cloudinary.com/dxkjhyrxn/image/upload/v1773721746/avatars/gthuckf7isik8hiybgqx.jpg', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'student'),
(5, 'SE182683', 'Vũ Công Bảo', 'baovcse182683@fpt.edu.vn', 'https://res.cloudinary.com/dxkjhyrxn/image/upload/v1773721746/avatars/gthuckf7isik8hiybgqx.jpg', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'student'),
(6, 'SE182684', 'Nguyễn Văn Hùng', 'hungnvse182684@fpt.edu.vn', 'https://res.cloudinary.com/dxkjhyrxn/image/upload/v1773721746/avatars/gthuckf7isik8hiybgqx.jpg', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'student'),
(7, 'SA181122', 'Trần Thị Trà My', 'mytttsa181122@fpt.edu.vn', 'https://res.cloudinary.com/dxkjhyrxn/image/upload/v1773721746/avatars/gthuckf7isik8hiybgqx.jpg', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'student'),
(10, 'SE182685', 'Đinh Quốc Khánh', 'khanhdqse182685@fpt.edu.vn', 'https://res.cloudinary.com/dxkjhyrxn/image/upload/v1773721746/avatars/gthuckf7isik8hiybgqx.jpg', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'student'),
(11, 'SE182686', 'Phan Gia Bảo', 'baopgse182686@fpt.edu.vn', 'https://res.cloudinary.com/dxkjhyrxn/image/upload/v1773721746/avatars/gthuckf7isik8hiybgqx.jpg', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'student'),
(12, 'SE182687', 'Ngô Hoàng Long', 'longnhse182687@fpt.edu.vn', 'https://res.cloudinary.com/dxkjhyrxn/image/upload/v1773721746/avatars/gthuckf7isik8hiybgqx.jpg', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'student'),
(13, 'SE182688', 'Bùi Minh Quân', 'quanbmse182688@fpt.edu.vn', 'https://res.cloudinary.com/dxkjhyrxn/image/upload/v1773721746/avatars/gthuckf7isik8hiybgqx.jpg', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'student'),
(14, 'SE182689', 'Lưu Ngọc Ánh', 'anhlnse182689@fpt.edu.vn', 'https://res.cloudinary.com/dxkjhyrxn/image/upload/v1773721746/avatars/gthuckf7isik8hiybgqx.jpg', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'student'),
(15, 'SE182690', 'Võ Thành Nam', 'namvtse182690@fpt.edu.vn', 'https://res.cloudinary.com/dxkjhyrxn/image/upload/v1773721746/avatars/gthuckf7isik8hiybgqx.jpg', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'student'),
(16, 'SE182691', 'Đoàn Mỹ Linh', 'linhdmse182691@fpt.edu.vn', 'https://res.cloudinary.com/dxkjhyrxn/image/upload/v1773721746/avatars/gthuckf7isik8hiybgqx.jpg', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'student'),
(17, 'SE182692', 'Trịnh Gia Hân', 'hantgse182692@fpt.edu.vn', 'https://res.cloudinary.com/dxkjhyrxn/image/upload/v1773721746/avatars/gthuckf7isik8hiybgqx.jpg', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'student'),
(18, 'SE182693', 'Tạ Đức Thịnh', 'thinhtdse182693@fpt.edu.vn', 'https://res.cloudinary.com/dxkjhyrxn/image/upload/v1773721746/avatars/gthuckf7isik8hiybgqx.jpg', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'student'),
(19, 'SE182694', 'Nguyễn Hải Yến', 'yennhse182694@fpt.edu.vn', 'https://res.cloudinary.com/dxkjhyrxn/image/upload/v1773721746/avatars/gthuckf7isik8hiybgqx.jpg', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'student'),
(20, 'SE182695', 'Lâm Quốc Việt', 'vietlqse182695@fpt.edu.vn', 'https://res.cloudinary.com/dxkjhyrxn/image/upload/v1773721746/avatars/gthuckf7isik8hiybgqx.jpg', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'student');

-- Seed User Settings mặc định
INSERT INTO user_settings (user_id, enable_cloudinary_upload, enable_ai_assistant)
SELECT id, TRUE, TRUE FROM users;

-- Thêm Semesters (Học kỳ)
INSERT INTO semesters (id, name, start_date, end_date, status) VALUES
(1, 'Spring 2026', '2026-01-15', '2026-05-15', 'Active'),
(2, 'Summer 2026', '2026-05-20', '2026-08-20', 'Upcoming'),
(3, 'Fall 2025', '2025-09-01', '2025-12-20', 'Completed');

-- Thêm Topics (Đề tài)
INSERT INTO topics (id, title, description, status, proposed_by, approved_by) VALUES
(1, 'Hệ thống Quản lý Đồ án SWD392', 'Xây dựng hệ thống quản lý có tích hợp AI Q&A.', 'APPROVED', 2, 1),
(2, 'Ứng dụng Đặt Đồ Ăn Mobile', 'App Flutter kết nối Firebase.', 'APPROVED', 3, 1),
(3, 'Nền tảng học Tiếng Anh AI', 'Dùng OpenAI để luyện giao tiếp.', 'PENDING', 2, NULL);

-- Thêm Classes (Lớp học)
INSERT INTO classes (id, class_name, semester_id, lecturer_id) VALUES
(1, 'SE1701', 1, 2),
(2, 'SE1702', 1, 3);

-- Phân bổ Sinh viên vào Lớp
INSERT INTO class_enrollments (class_id, student_id) VALUES
(1, 4), (1, 5), -- SV 4, 5 vào lớp SE1701
(2, 6), (2, 7); -- SV 6, 7 vào lớp SE1702

-- Thêm Groups (Nhóm)
INSERT INTO student_groups (id, group_name, class_id, topic_id) VALUES
(1, 'Nhóm 1 - SWD Team', 1, 1),
(2, 'Nhóm 2 - Flutter Team', 2, 2);

-- Phân bổ Sinh viên vào Nhóm
INSERT INTO group_members (group_id, student_id) VALUES
(1, 4), (1, 5), -- SV 4, 5 vào nhóm 1
(2, 6), (2, 7); -- SV 6, 7 vào nhóm 2

-- Thêm Câu hỏi (Questions)
INSERT INTO questions (id, title, content, group_id, asked_by, status, created_at) VALUES
(1, 'Lỗi kết nối Database', 'Thầy ơi em không connect được MySQL với Node.js, nó báo lỗi Access Denied ạ.', 1, 4, 'RESOLVED', '2026-03-01 10:00:00'),
(2, 'Xin cấp API Key OpenAI', 'Cho em hỏi bộ môn có hỗ trợ cấp API Key của OpenAI cho đề tài này không ạ?', 1, 5, 'ESCALATED_TO_MANAGER', '2026-03-02 14:30:00'),
(3, 'Cách cấu hình Firebase Auth', 'Em chưa hiểu luồng đăng nhập Firebase trên Flutter, thầy hướng dẫn giúp em với.', 2, 6, 'WAITING_LECTURER', '2026-03-03 08:15:00');

-- Thêm Câu trả lời (Answers)
INSERT INTO answers (id, question_id, answered_by, content, is_public, created_at) VALUES
(1, 1, 2, 'Chào em, lỗi này thường do sai password trong file .env. Em check lại file config nhé.', TRUE, '2026-03-01 11:20:00'),
(2, 2, 1, 'Chào em, hiện tại bộ môn không cấp sẵn API Key. Các nhóm tự dùng tài khoản free limit để làm demo Checkpoint nhé.', TRUE, '2026-03-02 16:00:00');

-- Thêm Bài nộp (Submissions)
INSERT INTO submissions (id, group_id, submitted_by, milestone_name, file_url, file_path, notes, status, grade, feedback, graded_by, submitted_at, graded_at)
VALUES
(1, 1, 4, 'Milestone 1', 'https://example.com/submissions/group1-ms1.zip', 'submissions/1/1/ms1.zip', 'Nộp đúng hạn', 'GRADED', 8.50, 'Triển khai tốt, cần cải thiện phần test.', 2, '2026-03-05 09:00:00', '2026-03-06 10:30:00'),
(2, 2, 6, 'Milestone 1', 'https://example.com/submissions/group2-ms1.zip', 'submissions/2/2/ms1.zip', 'Đã cập nhật theo góp ý', 'SUBMITTED', NULL, NULL, NULL, '2026-03-07 14:15:00', NULL);
