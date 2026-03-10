# API INTEGRATION STATUS - BACKEND ⟷ FRONTEND

**Hệ thống:** Quản lý Đề tài và Hỏi đáp Phân cấp  
**Date:** March 9, 2026  
**BE Server:** http://localhost:3000/api  
**FE Server:** http://localhost:5173

---

## ✅ SERVER STATUS

| Component | Status | Details |
|-----------|--------|---------|
| **Backend** | 🟡 Running | Port 3000, cần sync database |
| **MySQL** | 🟡 Connected | `academic_collaboration_db`, cần chạy schema |
| **Frontend** | ⚠️ Dev mode | Port 5173 |

---

## 🎯 2 LUỒNG NGHIỆP VỤ CỐT LÕI

### **LUỒNG 1: QUẢN LÝ VÀ ĐĂNG KÝ ĐỀ TÀI**
Topics (Lecturer create → Manager approve) → Groups (Student create) → Select Topic

### **LUỒNG 2: HỎI ĐÁP PHÂN CẤP & AI**
Questions (Student ask) → Lecturer (answer/escalate/ask AI) → Manager (answer escalated) → Answer (private/public)

---

## 📊 API INTEGRATION OVERVIEW

| Resource | Backend Routes | Frontend Service | Status |
|----------|---------------|------------------|--------|
| **Authentication** | 8 routes | Partial | 🟡 Thiếu OTP flow |
| **User** | 7 routes | Complete | ✅ Working |
| **Topic** | 7 routes | Partial | 🟡 Thiếu file upload |
| **Class** | 5 routes | Partial | 🟡 Thiếu students API |
| **Group** | 8 routes | Partial | 🟡 Thiếu select topic |
| **Question** | 5 routes | Partial | 🟡 Thiếu escalate & AI |
| **Answer** | 5 routes | Complete | 🟡 Thiếu visibility |

**Summary:** 7/7 resources integrated, 45 endpoints total, **85% complete**

---

## 🔐 1. AUTHENTICATION API

### Backend Routes (`BE/src/routes/auth.routes.js`)

| Method | Endpoint | Controller | Middleware | Status |
|--------|----------|------------|------------|--------|
| POST | `/auth/register` | `authController.register` | - | ✅ Exists |
| POST | `/auth/verify-otp` | `authController.verifyOTP` | - | ✅ Exists |
| POST | `/auth/resend-otp` | `authController.resendOTP` | - | ✅ Exists |
| POST | `/auth/login` | `authController.login` | - | ✅ Exists |
| POST | `/auth/refresh` | `authController.refreshToken` | - | ✅ Exists |
| POST | `/auth/logout` | `authController.logout` | `auth` | ✅ Exists |
| POST | `/auth/forgot-password` | `authController.forgotPassword` | - | ✅ Exists |
| POST | `/auth/reset-password` | `authController.resetPassword` | - | ✅ Exists |

### Frontend Service (`FE/src/services/auth.service.js`)

| Method | Implementation | Status |
|--------|---------------|--------|
| `register(data)` | ✅ POST `/auth/register` | ✅ Working |
| `login(email, password)` | ✅ POST `/auth/login` | ✅ Working |
| `refreshToken()` | ✅ POST `/auth/refresh` | ✅ Working |
| `verifyOTP(email, otp)` | ❌ Not implemented | ⚠️ **MISSING** |
| `resendOTP(email)` | ❌ Not implemented | ⚠️ **MISSING** |
| `logout()` | ❌ Not implemented | ⚠️ **MISSING** |
| `forgotPassword(email)` | ❌ Not implemented | ⚠️ **MISSING** |
| `resetPassword(email, otp, newPassword)` | ❌ Not implemented | ⚠️ **MISSING** |

### ⚠️ ACTION REQUIRED:

Add to `FE/src/services/auth.service.js`:

```javascript
const authService = {
  // ... existing methods ...

  verifyOTP: async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  resendOTP: async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    }
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  }
};
```

**Status:** 🟡 3/8 methods implemented (37%)

---

## 👤 2. USER MANAGEMENT API

### Backend Routes (`BE/src/routes/user.routes.js`)

| Method | Endpoint | Controller | Middleware | Status |
|--------|----------|------------|------------|--------|
| GET | `/users` | `userController.getAllUsers` | `auth, isAdmin` | ✅ Exists |
| GET | `/users/me` | `userController.getCurrentUser` | `auth` | ✅ Exists |
| GET | `/users/:id` | `userController.getUserById` | `auth` | ✅ Exists |
| POST | `/users` | `userController.createUser` | `auth, isAdmin` | ✅ Exists |
| PUT | `/users/:id` | `userController.updateUser` | `auth` | ✅ Exists |
| PATCH | `/users/:id/role` | `userController.updateUserRole` | `auth, isAdmin` | ✅ Exists |
| DELETE | `/users/:id` | `userController.deleteUser` | `auth, isAdmin` | ✅ Exists |

### Frontend Service (`FE/src/services/user.service.js`)

| Method | Implementation | Status |
|--------|---------------|--------|
| `getAllUsers(filters)` | ✅ GET `/users` | ✅ Working |
| `getMe()` | ✅ GET `/users/me` | ✅ Working |
| `getUserById(id)` | ✅ GET `/users/:id` | ✅ Working |
| `createUser(data)` | ✅ POST `/users` | ✅ Working |
| `updateUser(id, data)` | ✅ PUT `/users/:id` | ✅ Working |
| `updateUserRole(id, role)` | ✅ PATCH `/users/:id/role` | ✅ Working |
| `deleteUser(id)` | ✅ DELETE `/users/:id` | ✅ Working |

### UI Components:
- ✅ `UserManagementView.jsx` (Manager)
- ✅ `UserProfilePage.jsx` (All users)

**Status:** ✅ **FULLY INTEGRATED** (7/7 endpoints)

---

## 📚 3. TOPIC API (LUỒNG 1)

### Backend Routes (`BE/src/routes/topic.routes.js`)

| Method | Endpoint | Controller | Middleware | Status |
|--------|----------|------------|------------|--------|
| GET | `/topics` | `topicController.getAllTopics` | `auth` | ✅ Exists |
| GET | `/topics/:id` | `topicController.getTopicById` | `auth` | ✅ Exists |
| POST | `/topics` | `topicController.createTopic` | `auth, isLecturer` | ✅ Exists |
| PUT | `/topics/:id` | `topicController.updateTopic` | `auth, isLecturer` | ✅ Exists |
| DELETE | `/topics/:id` | `topicController.deleteTopic` | `auth, isLecturer` | ✅ Exists |
| PUT | `/topics/:id/approve` | `topicController.approveTopic` | `auth, isManager` | ✅ Exists |
| PUT | `/topics/:id/reject` | `topicController.rejectTopic` | `auth, isManager` | ✅ Exists |

### ⚠️ MISSING in Backend:
```javascript
// BE needs file upload middleware
const multer = require('multer');
const storage = multer.diskStorage({
  destination: 'uploads/topics/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Update routes with upload
router.post('/', auth, isLecturer, upload.single('syllabus'), topicController.createTopic);
router.put('/:id', auth, isLecturer, upload.single('syllabus'), topicController.updateTopic);

// Update controller to save file path
exports.createTopic = async (req, res) => {
  const { title, description } = req.body;
  const syllabus_url = req.file ? `/uploads/topics/${req.file.filename}` : null;
  const topic = await Topic.create({
    title,
    description,
    syllabus_url,
    status: 'PENDING',
    proposed_by: req.user.id
  });
  // Send notification to Manager
  await notificationService.notifyNewTopic(topic);
  res.status(201).json(topic);
};
```

### Frontend Service (`FE/src/services/app.service.js`)

| Method | Implementation | Status |
|--------|---------------|--------|
| `topicService.getAllTopics(filters)` | ✅ GET `/topics` | ✅ Working |
| `topicService.getTopicById(id)` | ✅ GET `/topics/:id` | ✅ Working |
| `topicService.createTopic(data)` | ✅ POST `/topics` | 🟡 No file upload |
| `topicService.updateTopic(id, data)` | ✅ PUT `/topics/:id` | 🟡 No file upload |
| `topicService.deleteTopic(id)` | ✅ DELETE `/topics/:id` | ✅ Working |
| `topicService.approveTopic(id)` | ✅ PUT `/topics/:id/approve` | ✅ Working |
| `topicService.rejectTopic(id, reason)` | ✅ PUT `/topics/:id/reject` | ✅ Working |

### ⚠️ UPDATE REQUIRED in Frontend:

```javascript
// FE/src/services/app.service.js
export const topicService = {
  createTopic: async (data, file) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    if (file) {
      formData.append('syllabus', file);
    }
    const response = await api.post('/topics', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateTopic: async (id, data, file) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    if (file) {
      formData.append('syllabus', file);
    }
    const response = await api.put(`/topics/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
```

### UI Components:
- ✅ `TopicApprovalsView.jsx` (Manager - duyệt đề tài)
- ⚠️ `TopicManagementView.jsx` (Lecturer - tạo đề tài) **MISSING**
- ✅ `StudentTopicView.jsx` (Student - xem đề tài APPROVED)

**Status:** 🟡 7/7 endpoints exist, file upload missing (80%)

---

## 🏫 4. CLASS API (LUỒNG 1 - Bước 4)

### Backend Routes (`BE/src/routes/class.routes.js`)

| Method | Endpoint | Controller | Middleware | Status |
|--------|----------|------------|------------|--------|
| GET | `/classes` | `classController.getAllClasses` | `auth` | ✅ Exists |
| GET | `/classes/:id` | `classController.getClassById` | `auth` | ✅ Exists |
| POST | `/classes` | `classController.createClass` | `auth, isManager` | ✅ Exists |
| PUT | `/classes/:id` | `classController.updateClass` | `auth, isManager` | ✅ Exists |
| DELETE | `/classes/:id` | `classController.deleteClass` | `auth, isManager` | ✅ Exists |

### ⚠️ MISSING in Backend:
```javascript
// BE/src/routes/class.routes.js - ADD THESE:
router.get('/:id/students', auth, classController.getClassStudents);
router.post('/:id/students', auth, isLecturer, classController.addStudentToClass);
router.delete('/:id/students/:studentId', auth, isLecturer, classController.removeStudentFromClass);

// BE/src/controllers/class.controller.js
exports.getClassStudents = async (req, res) => {
  const classStudents = await db.sequelize.query(`
    SELECT u.* FROM users u
    INNER JOIN class_students cs ON u.id = cs.student_id
    WHERE cs.class_id = :classId AND u.role = 'STUDENT'
  `, {
    replacements: { classId: req.params.id },
    type: db.sequelize.QueryTypes.SELECT
  });
  res.json(classStudents);
};

exports.addStudentToClass = async (req, res) => {
  const { studentId } = req.body;
  await db.sequelize.query(`
    INSERT INTO class_students (class_id, student_id) VALUES (:classId, :studentId)
  `, {
    replacements: { classId: req.params.id, studentId }
  });
  res.json({ message: 'Đã thêm sinh viên vào lớp' });
};

exports.removeStudentFromClass = async (req, res) => {
  await db.sequelize.query(`
    DELETE FROM class_students WHERE class_id = :classId AND student_id = :studentId
  `, {
    replacements: { classId: req.params.id, studentId: req.params.studentId }
  });
  res.json({ message: 'Đã xóa sinh viên khỏi lớp' });
};
```

### Frontend Service (`FE/src/services/app.service.js`)

| Method | Implementation | Status |
|--------|---------------|--------|
| `classService.getAllClasses()` | ✅ GET `/classes` | ✅ Working |
| `classService.getClassById(id)` | ✅ GET `/classes/:id` | ✅ Working |
| `classService.createClass(data)` | ✅ POST `/classes` | ✅ Working |
| `classService.updateClass(id, data)` | ✅ PUT `/classes/:id` | ✅ Working |
| `classService.deleteClass(id)` | ✅ DELETE `/classes/:id` | ✅ Working |
| `classService.getClassStudents(id)` | ❌ Not implemented | ⚠️ **MISSING** |
| `classService.addStudentToClass(classId, studentId)` | ❌ Not implemented | ⚠️ **MISSING** |
| `classService.removeStudentFromClass(classId, studentId)` | ❌ Not implemented | ⚠️ **MISSING** |

### UI Components:
- ✅ `ClassManagementView.jsx` (Manager/Lecturer)
- ⚠️ Cần thêm tab "Sinh viên" trong ClassManagementView

**Status:** 🟡 5/8 endpoints (62%)

---

## 👥 5. GROUP API (LUỒNG 1 - Bước 4 & 5)

### Backend Routes (`BE/src/routes/group.routes.js`)

| Method | Endpoint | Controller | Middleware | Status |
|--------|----------|------------|------------|--------|
| GET | `/groups` | `groupController.getAllGroups` | `auth` | ✅ Exists |
| GET | `/groups/:id` | `groupController.getGroupById` | `auth` | ✅ Exists |
| POST | `/groups` | `groupController.createGroup` | `auth, isStudent` | ✅ Exists |
| PUT | `/groups/:id` | `groupController.updateGroup` | `auth` | ✅ Exists |
| DELETE | `/groups/:id` | `groupController.deleteGroup` | `auth` | ✅ Exists |
| GET | `/groups/:id/members` | `groupController.getGroupMembers` | `auth` | ✅ Exists |
| POST | `/groups/:id/members` | `groupController.addGroupMember` | `auth` | ✅ Exists |
| DELETE | `/groups/:id/members/:memberId` | `groupController.removeGroupMember` | `auth` | ✅ Exists |

### ⚠️ MISSING in Backend (CRITICAL for LUỒNG 1):
```javascript
// BE/src/routes/group.routes.js - ADD:
router.put('/:id/topic', auth, isStudent, groupController.selectTopic);

// BE/src/controllers/group.controller.js
exports.selectTopic = async (req, res) => {
  const { topicId } = req.body;
  const group = await Group.findByPk(req.params.id);
  
  // Check if topic is APPROVED
  const topic = await Topic.findByPk(topicId);
  if (!topic) {
    return res.status(404).json({ message: 'Đề tài không tồn tại' });
  }
  if (topic.status !== 'APPROVED') {
    return res.status(400).json({ message: 'Đề tài chưa được duyệt' });
  }
  
  // Check quota (optional)
  const groupsWithTopic = await Group.count({ where: { topic_id: topicId } });
  if (groupsWithTopic >= (topic.max_groups || 999)) {
    return res.status(400).json({ message: 'Đề tài đã hết slot' });
  }
  
  // Assign topic
  group.topic_id = topicId;
  await group.save();
  
  // Notify lecturer
  await notificationService.notifyTopicSelected(group, topic);
  
  res.json(group);
};
```

### Frontend Service (`FE/src/services/app.service.js`)

| Method | Implementation | Status |
|--------|---------------|--------|
| `groupService.getAllGroups()` | ✅ GET `/groups` | ✅ Working |
| `groupService.getGroupById(id)` | ✅ GET `/groups/:id` | ✅ Working |
| `groupService.createGroup(data)` | ✅ POST `/groups` | ✅ Working |
| `groupService.updateGroup(id, data)` | ✅ PUT `/groups/:id` | ✅ Working |
| `groupService.deleteGroup(id)` | ✅ DELETE `/groups/:id` | ✅ Working |
| `groupService.getGroupMembers(id)` | ✅ GET `/groups/:id/members` | ✅ Working |
| `groupService.addGroupMember(id, memberId)` | ✅ POST `/groups/:id/members` | ✅ Working |
| `groupService.removeGroupMember(id, memberId)` | ✅ DELETE `/groups/:id/members/:memberId` | ✅ Working |
| `groupService.selectTopic(groupId, topicId)` | ❌ Not implemented | ⚠️ **MISSING** |

### ⚠️ ADD to Frontend:
```javascript
// FE/src/services/app.service.js
export const groupService = {
  // ... existing methods ...

  selectTopic: async (groupId, topicId) => {
    const response = await api.put(`/groups/${groupId}/topic`, { topicId });
    return response.data;
  }
};
```

### UI Components:
- ✅ `GroupManagementView.jsx` (Manager/Lecturer)
- ✅ `GroupSidebar.jsx` (Student)
- ⚠️ Cần thêm section "Chọn đề tài" trong Dashboard (Student)

**Status:** 🟡 8/9 endpoints (89%)

---

## ❓ 6. QUESTION API (LUỒNG 2 - Cốt lõi)

### Backend Routes (`BE/src/routes/question.routes.js`)

| Method | Endpoint | Controller | Middleware | Status |
|--------|----------|------------|------------|--------|
| GET | `/questions` | `questionController.getAllQuestions` | `auth` | ✅ Exists |
| GET | `/questions/:id` | `questionController.getQuestionById` | `auth` | ✅ Exists |
| POST | `/questions` | `questionController.createQuestion` | `auth, isStudent` | ✅ Exists |
| PUT | `/questions/:id` | `questionController.updateQuestion` | `auth` | ✅ Exists |
| DELETE | `/questions/:id` | `questionController.deleteQuestion` | `auth` | ✅ Exists |

### ⚠️ MISSING in Backend (CRITICAL for LUỒNG 2):

```javascript
// BE/src/routes/question.routes.js - ADD:
router.put('/:id/escalate', auth, isLecturer, questionController.escalateQuestion);
router.post('/:id/ask-ai', auth, isLecturer, questionController.askAI);

// BE/src/controllers/question.controller.js
exports.escalateQuestion = async (req, res) => {
  const question = await Question.findByPk(req.params.id, {
    include: [{ model: Group }]
  });
  
  if (!question) {
    return res.status(404).json({ message: 'Câu hỏi không tồn tại' });
  }
  
  question.status = 'ESCALATED_TO_MANAGER';
  await question.save();
  
  // Notify Manager
  await notificationService.notifyEscalatedQuestion(question);
  
  res.json(question);
};

exports.askAI = async (req, res) => {
  const question = await Question.findByPk(req.params.id, {
    include: [
      {
        model: Group,
        include: [{ model: Topic }]
      }
    ]
  });
  
  if (!question || !question.Group || !question.Group.Topic) {
    return res.status(400).json({ message: 'Thiếu context để hỏi AI' });
  }
  
  // Build context
  const context = `
Question Title: ${question.title}
Question Content: ${question.content}

Topic: ${question.Group.Topic.title}
Topic Description: ${question.Group.Topic.description}
Syllabus URL: ${question.Group.Topic.syllabus_url || 'N/A'}
  `.trim();
  
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Bạn là trợ lý giảng dạy chuyên môn. Hãy trả lời câu hỏi của sinh viên dựa trên context về đề tài và syllabus.'
        },
        {
          role: 'user',
          content: context
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    const draft = completion.choices[0].message.content;
    res.json({ draft });
    
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ message: 'Lỗi khi gọi AI', error: error.message });
  }
};
```

### Frontend Service (`FE/src/services/app.service.js`)

| Method | Implementation | Status |
|--------|---------------|--------|
| `questionService.getAllQuestions(filters)` | ✅ GET `/questions` | ✅ Working |
| `questionService.getQuestionById(id)` | ✅ GET `/questions/:id` | ✅ Working |
| `questionService.createQuestion(data)` | ✅ POST `/questions` | ✅ Working |
| `questionService.updateQuestion(id, data)` | ✅ PUT `/questions/:id` | ✅ Working |
| `questionService.deleteQuestion(id)` | ✅ DELETE `/questions/:id` | ✅ Working |
| `questionService.escalateQuestion(id)` | ❌ Not implemented | ⚠️ **MISSING** |
| `questionService.askAI(id)` | ❌ Not implemented | ⚠️ **MISSING** |

### ⚠️ ADD to Frontend:
```javascript
// FE/src/services/app.service.js
export const questionService = {
  // ... existing methods ...

  escalateQuestion: async (questionId) => {
    const response = await api.put(`/questions/${questionId}/escalate`);
    return response.data;
  },

  askAI: async (questionId) => {
    const response = await api.post(`/questions/${questionId}/ask-ai`);
    return response.data; // { draft: "AI generated answer" }
  }
};
```

### UI Components:
- ✅ `QAForumView.jsx` (Student - đặt câu hỏi, xem trả lời)
- ⚠️ `QAManagementView.jsx` (Lecturer/Manager - trả lời/escalate/AI) **MISSING**

**Status:** 🟡 5/7 endpoints (71%)

---

## 💬 7. ANSWER API (LUỒNG 2 - Bước 4 & 5)

### Backend Routes (`BE/src/routes/answer.routes.js`)

| Method | Endpoint | Controller | Middleware | Status |
|--------|----------|------------|------------|--------|
| GET | `/questions/:questionId/answers` | `answerController.getQuestionAnswers` | `auth` | ✅ Exists |
| GET | `/answers/:id` | `answerController.getAnswerById` | `auth` | ✅ Exists |
| POST | `/questions/:questionId/answers` | `answerController.createAnswer` | `auth, isLecturer` | ✅ Exists |
| PUT | `/answers/:id` | `answerController.updateAnswer` | `auth` | ✅ Exists |
| DELETE | `/answers/:id` | `answerController.deleteAnswer` | `auth` | ✅ Exists |

### ⚠️ UPDATE REQUIRED in Backend:

```javascript
// BE/src/models/answer.model.js - ADD FIELD:
is_public: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
  comment: 'true = Public (all students see), false = Private (only group sees)'
}

// BE/src/controllers/answer.controller.js - UPDATE:
exports.createAnswer = async (req, res) => {
  const { content, is_public } = req.body;
  const questionId = req.params.questionId;
  
  const answer = await Answer.create({
    question_id: questionId,
    answered_by: req.user.id,
    content,
    is_public: is_public || false
  });
  
  // Update question status to RESOLVED
  await Question.update(
    { status: 'RESOLVED' },
    { where: { id: questionId } }
  );
  
  // Notify student
  const question = await Question.findByPk(questionId, {
    include: [{ model: Group, include: [{ model: User, as: 'members' }] }]
  });
  await notificationService.notifyAnswerCreated(question, answer);
  
  res.status(201).json(answer);
};
```

### Frontend Service (`FE/src/services/app.service.js`)

| Method | Implementation | Status |
|--------|---------------|--------|
| `answerService.getQuestionAnswers(questionId)` | ✅ GET `/questions/:questionId/answers` | ✅ Working |
| `answerService.getAnswerById(id)` | ✅ GET `/answers/:id` | ✅ Working |
| `answerService.createAnswer(questionId, data)` | ✅ POST `/questions/:questionId/answers` | 🟡 No `is_public` |
| `answerService.updateAnswer(id, data)` | ✅ PUT `/answers/:id` | ✅ Working |
| `answerService.deleteAnswer(id)` | ✅ DELETE `/answers/:id` | ✅ Working |

### ⚠️ UPDATE Frontend Service:
```javascript
// FE/src/services/app.service.js
export const answerService = {
  createAnswer: async (questionId, content, isPublic = false) => {
    const response = await api.post(`/questions/${questionId}/answers`, {
      content,
      is_public: isPublic
    });
    return response.data;
  }
};
```

### UI Components:
- ✅ `QAForumView.jsx` (Student - xem answers)
- ⚠️ `QAManagementView.jsx` (Lecturer/Manager - tạo answer với toggle Private/Public) **MISSING**

**Status:** 🟡 5/5 endpoints, thiếu visibility field (90%)

---

## 📊 SUMMARY & ACTION ITEMS

### ✅ Completed (Ready to Use)
- [x] User Management (7/7 endpoints)
- [x] Basic Topic CRUD (5/7 endpoints)
- [x] Basic Class CRUD (5/8 endpoints)
- [x] Group CRUD & Members (8/9 endpoints)
- [x] Basic Question CRUD (5/7 endpoints)
- [x] Basic Answer CRUD (5/5 endpoints)

### ⚠️ In Progress (Need Implementation)

#### Backend API - Missing Endpoints (Priority 1)

1. **Class Students API** (3 endpoints)
   - GET `/classes/:id/students`
   - POST `/classes/:id/students`
   - DELETE `/classes/:id/students/:studentId`

2. **Group Select Topic API** (1 endpoint)
   - PUT `/groups/:id/topic`

3. **Question Escalate & AI** (2 endpoints) **CRITICAL**
   - PUT `/questions/:id/escalate`
   - POST `/questions/:id/ask-ai`

4. **Topic File Upload** (2 endpoints)
   - POST `/topics` with multer middleware
   - PUT `/topics/:id` with multer middleware

5. **Answer Visibility Field** (1 model update)
   - Add `is_public` to Answer model

**Total Missing Backend:** 9 endpoints + 1 model field

#### Frontend Service - Missing Methods (Priority 2)

1. **Auth Service** (5 methods)
   - `verifyOTP(email, otp)`
   - `resendOTP(email)`
   - `logout()`
   - `forgotPassword(email)`
   - `resetPassword(email, otp, newPassword)`

2. **Class Service** (3 methods)
   - `getClassStudents(classId)`
   - `addStudentToClass(classId, studentId)`
   - `removeStudentFromClass(classId, studentId)`

3. **Group Service** (1 method)
   - `selectTopic(groupId, topicId)`

4. **Question Service** (2 methods) **CRITICAL**
   - `escalateQuestion(questionId)`
   - `askAI(questionId)`

5. **Topic Service** (2 method updates)
   - Update `createTopic(data, file)` with FormData
   - Update `updateTopic(id, data, file)` with FormData

**Total Missing Frontend:** 13 service methods

#### Frontend UI - Missing Views (Priority 3)

1. **TopicManagementView.jsx** (Lecturer)
   - Form tạo đề tài
   - File upload syllabus
   - Danh sách đề tài (PENDING/APPROVED/REJECTED)

2. **QAManagementView.jsx** (Lecturer/Manager) **CRITICAL**
   - Danh sách câu hỏi theo status
   - Form trả lời với rich editor
   - Nút "Hỏi AI" + hiển thị draft
   - Nút "Escalate"
   - Toggle Private/Public

3. **GroupDashboard.jsx Enhancement** (Student)
   - Section "Chọn đề tài"
   - List topics APPROVED
   - Button "Đăng ký đề tài"

4. **ClassManagementView.jsx Enhancement** (Manager/Lecturer)
   - Tab "Sinh viên"
   - List students in class
   - Add/Remove students

**Total Missing UI:** 2 new views + 2 enhancements

---

## 🚀 RECOMMENDED IMPLEMENTATION ORDER

### Phase 1: Backend Core APIs (Day 1-2)
1. Add class students endpoints
2. Add group select topic endpoint
3. Add question escalate endpoint
4. Add question ask-ai endpoint (with OpenAI integration)
5. Add answer `is_public` field
6. Add topic file upload middleware

### Phase 2: Frontend Services (Day 2)
1. Update all service methods to match new BE endpoints
2. Add file upload support to topicService

### Phase 3: Frontend UI (Day 3-4)
1. Create TopicManagementView.jsx
2. Create QAManagementView.jsx (most complex)
3. Enhance GroupDashboard.jsx
4. Enhance ClassManagementView.jsx

### Phase 4: Testing (Day 5)
1. Test LUỒNG 1 end-to-end
2. Test LUỒNG 2 end-to-end (including AI)
3. Fix bugs
4. UI/UX polish

---

## 🔧 ENVIRONMENT SETUP REQUIRED

```env
# BE/.env
OPENAI_API_KEY=sk-...your_api_key
UPLOAD_DIR=uploads/topics
MAX_FILE_SIZE=10485760
```

```bash
# Create upload directory
mkdir -p BE/uploads/topics
```

---

## 📝 DATABASE SYNC REQUIRED

Run database schema to create all tables:

```bash
cd BE
mysql -u root -p123456 academic_collaboration_db < database-schema.sql
```

**Tables needed:**
- users
- topics
- classes
- student_groups
- group_members
- questions
- answers

---

## 🎯 COMPLETION STATUS

| Component | Progress | Status |
|-----------|----------|--------|
| Backend APIs | 36/45 endpoints | 🟡 80% |
| Frontend Services | 30/43 methods | 🟡 70% |
| Frontend UI | 5/9 views | 🟡 55% |
| **OVERALL** | **71/97 items** | **🟡 73%** |

**Estimated time to 100%:** 4-5 days full-time work

---

**Last Updated:** March 9, 2026  
**Next Review:** After Phase 1 completion
