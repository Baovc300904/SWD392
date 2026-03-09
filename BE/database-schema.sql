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
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('manager', 'lecturer', 'student') NOT NULL DEFAULT 'student',
    is_email_verified BOOLEAN DEFAULT FALSE,
    otp VARCHAR(6) NULL,
    otp_expires DATETIME NULL,
    refresh_token TEXT NULL,
    status ENUM('Online', 'Offline', 'Away') DEFAULT 'Offline',
    is_online BOOLEAN DEFAULT FALSE,
    last_seen_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_student_code (student_code),
    INDEX idx_role (role)
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
    lecturer_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lecturer_id) REFERENCES users(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng Nhóm Sinh viên
CREATE TABLE student_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    class_id INT,
    topic_id INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
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

-- ==========================================
-- 2. INSERT MOCK DATA (Dữ liệu mẫu)
-- ==========================================

-- Thêm Users (Password: 123456 - đã mã hóa bằng bcrypt)
INSERT INTO users (id, full_name, email, password_hash, role) VALUES
(1, 'Trưởng Bộ Môn (Manager)', 'manager@fpt.edu.vn', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'manager'),
(2, 'Giảng Viên Nguyễn Văn A', 'gva@fpt.edu.vn', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'lecturer'),
(3, 'Giảng Viên Trần Thị B', 'gvb@fpt.edu.vn', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'lecturer'),
(4, 'Sinh Viên Lê Văn C', 'sv1@fpt.edu.vn', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'student'),
(5, 'Sinh Viên Phạm Thị D', 'sv2@fpt.edu.vn', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'student'),
(6, 'Sinh Viên Hoàng Văn E', 'sv3@fpt.edu.vn', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'student'),
(7, 'Sinh Viên Vũ Thị F', 'sv4@fpt.edu.vn', '$2b$10$74o/nlJkFNXtlD2MuIpH9.AfJ.pAqRpTj8oGF6gT4phOv9HFqdVYe', 'student');

-- Thêm Topics (Đề tài)
INSERT INTO topics (id, title, description, status, proposed_by, approved_by) VALUES
(1, 'Hệ thống Quản lý Đồ án SWD392', 'Xây dựng hệ thống quản lý có tích hợp AI Q&A.', 'APPROVED', 2, 1),
(2, 'Ứng dụng Đặt Đồ Ăn Mobile', 'App Flutter kết nối Firebase.', 'APPROVED', 3, 1),
(3, 'Nền tảng học Tiếng Anh AI', 'Dùng OpenAI để luyện giao tiếp.', 'PENDING', 2, NULL);

-- Thêm Classes (Lớp học)
INSERT INTO classes (id, class_name, lecturer_id) VALUES
(1, 'SE1701', 2),
(2, 'SE1702', 3);

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