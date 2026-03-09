# CHECKLIST YÊU CẦU FRONTEND - HỆ THỐNG QUẢN LÝ ĐỀ TÀI VÀ HỎI ĐÁP PHÂN CẤP

## 📋 Tổng quan yêu cầu từ Review 2

Theo bảng yêu cầu, Frontend cần hoàn thành **3 yêu cầu chính**:

1. **Apply Template for all pages** (Áp dụng template cho tất cả các trang)
2. **CRUD 5 resources API (20-30 endpoints)** (Tích hợp CRUD cho 5 tài nguyên với 20-30 endpoints)
3. **File Upload from FE to API by HTTP Post/ Firebase storage** (Upload file từ FE lên API)

---

## 🎯 2 LUỒNG NGHIỆP VỤ CỐT LÕI (Theo chính xác yêu cầu của thầy)

### **LUỒNG 1: QUẢN LÝ VÀ ĐĂNG KÝ ĐỀ TÀI (Topic Management Flow)**

**Mục đích:** Đảm bảo mọi đề tài sinh viên làm đều đã qua sự kiểm duyệt chất lượng của cấp quản lý.

**Flow chi tiết:**

1. **Đề xuất (Propose):** Giảng viên (Lecturer) tạo mới đề tài (title, description, file syllabus). Trạng thái: `PENDING`

2. **Thông báo:** Hệ thống gửi notification đến Trưởng bộ môn (Manager)

3. **Kiểm duyệt (Approve/Reject):** Manager xem xét:
   - Approve → status `APPROVED` (hiển thị cho sinh viên)
   - Reject → status `REJECTED`

4. **Tạo nhóm:** Sinh viên xem danh sách sinh viên trong Lớp (Class), gửi lời mời thành lập Nhóm (Group)

5. **Chọn đề tài:** Trưởng nhóm chọn đề tài APPROVED. Hệ thống kiểm tra quota và lưu

### **LUỒNG 2: HỎI ĐÁP PHÂN CẤP & TÍCH HỢP AI (Hierarchical Q&A & AI Flow)**

**Mục đích:** Giải quyết triệt để tình trạng trôi tin nhắn, phân loại câu hỏi theo độ khó, ứng dụng AI giảm tải giảng viên.

**Flow chi tiết:**

1. **Đặt câu hỏi (Ask):** Sinh viên đại diện nhóm tạo Question. Trạng thái: `WAITING_LECTURER`

2. **Tiếp nhận:** Giảng viên phụ trách lớp nhận thông báo. 3 hướng xử lý:
   - **Hướng A - Tự trả lời:** Giảng viên soạn câu trả lời
   - **Hướng B - Trợ lý AI:** Bấm "Hỏi AI". Backend gom [Question + Topic Description + Syllabus] gửi AI → Draft → Giảng viên chỉnh sửa
   - **Hướng C - Chuyển cấp (Escalate):** Status → `ESCALATED_TO_MANAGER`

3. **Quản lý cấp cao xử lý:** Manager nhận thông báo câu hỏi escalated, soạn câu trả lời

4. **Cài đặt quyền riêng tư:** Trước khi gửi Answer, chọn:
   - **Private:** Chỉ Giảng viên và Nhóm thấy
   - **Public:** Mọi sinh viên đều xem được

5. **Hoàn tất:** Lưu Answer, status Question → `RESOLVED`, thông báo sinh viên

---

## ✅ YÊU CẦU 1: Apply Template for all pages

### Trạng thái: ✅ **ĐÃ HOÀN THÀNH**

### Chi tiết:
- ✅ **TailwindCSS** + **Radix UI** + **shadcn/ui** đã tích hợp đầy đủ
- ✅ Template thống nhất cho tất cả trang:

```
1. Manager Dashboard:
   - TopicApprovalsView (duyệt đề tài PENDING/APPROVED/REJECTED)
   - UserManagementView (CRUD Lecturer/Student)
   - ClassManagementView (CRUD lớp học)
   - SettingsView

2. Lecturer Dashboard:
   - TopicManagementView (tạo đề tài mới + upload syllabus) ⚠️ CẦN TẠO
   - QAManagementView (trả lời/escalate câu hỏi) ⚠️ CẦN TẠO
   - GroupManagementView (xem nhóm trong lớp)

3. Student Workspace:
   - GroupDashboard (tạo nhóm, mời thành viên từ lớp)
   - StudentTopicView (xem, chọn đề tài APPROVED)
   - QAForumView (đặt câu hỏi, xem câu trả lời)

4. Public Pages:
   - Landing, Login, Register, FAQ, Contact, About
```

### ⚠️ CẦN BỔ SUNG:
- **TopicManagementView.jsx** cho Lecturer (tạo đề tài + upload file syllabus)
- **QAManagementView.jsx** cho Lecturer (trả lời/escalate + nút "Hỏi AI")
- **AIAssistantView.jsx** hiện tại bị nhầm lẫn - cần chuyển thành tính năng trong QAManagementView

---

## ✅ YÊU CẦU 2: CRUD 5 resources API (20-30 endpoints)

### Trạng thái: ✅ **ĐÃ HOÀN THÀNH (7 resources, 31 endpoints)**

### 7 Core Resources phục vụ 2 luồng nghiệp vụ:

#### 1. **Authentication Resource** (`auth.service.js`)

**Endpoints:** 3
- ✅ POST `/auth/register` - Đăng ký tài khoản
- ✅ POST `/auth/login` - Đăng nhập
- ✅ POST `/auth/refresh` - Refresh token

**UI:** LoginPage.jsx, RegisterPage.jsx

**⚠️ Thiếu OTP verification flow** (Backend đã có, FE chưa implement)

---

#### 2. **User Resource** (`user.service.js`)

**Endpoints:** 7
- ✅ GET `/users` - Danh sách user (Manager)
- ✅ GET `/users/me` - Thông tin user hiện tại
- ✅ GET `/users/:id` - Chi tiết user
- ✅ POST `/users` - Tạo user mới (Manager)
- ✅ PUT `/users/:id` - Cập nhật user
- ✅ PATCH `/users/:id/role` - Đổi role (Manager)
- ✅ DELETE `/users/:id` - Xóa user (Manager)

**UI:** UserManagementView.jsx, UserProfilePage.jsx

**Status:** ✅ Đầy đủ

---

#### 3. **Topic Resource** (`app.service.js - topicService`)

**Endpoints:** 7
- ✅ GET `/topics` - Danh sách đề tài (có filter theo status)
- ✅ GET `/topics/:id` - Chi tiết đề tài
- ✅ POST `/topics` - Tạo đề tài (Lecturer) ⚠️ Cần thêm file upload
- ✅ PUT `/topics/:id` - Cập nhật đề tài
- ✅ DELETE `/topics/:id` - Xóa đề tài
- ✅ PUT `/topics/:id/approve` - Duyệt đề tài (Manager)
- ✅ PUT `/topics/:id/reject` - Từ chối đề tài (Manager)

**UI:** 
- TopicApprovalsView.jsx (Manager)
- TopicManagementView.jsx (Lecturer) ⚠️ **CẦN TẠO**
- StudentTopicView.jsx (Student)

**Status:** 🟡 Backend đầy đủ, FE thiếu TopicManagementView cho Lecturer

---

#### 4. **Class Resource** (`app.service.js - classService`)

**Endpoints:** 5
- ✅ GET `/classes` - Danh sách lớp
- ✅ GET `/classes/:id` - Chi tiết lớp
- ✅ POST `/classes` - Tạo lớp (Manager)
- ✅ PUT `/classes/:id` - Cập nhật lớp
- ✅ DELETE `/classes/:id` - Xóa lớp

**🟡 Thiếu endpoints:**
- ⚠️ GET `/classes/:id/students` - Danh sách sinh viên trong lớp (cần cho Bước 4 Luồng 1)
- ⚠️ POST `/classes/:id/students` - Thêm sinh viên vào lớp
- ⚠️ DELETE `/classes/:id/students/:studentId` - Xóa sinh viên khỏi lớp

**UI:** ClassManagementView.jsx

**Status:** 🟡 Thiếu endpoints quản lý sinh viên trong lớp

---

#### 5. **Group Resource** (`app.service.js - groupService`)

**Endpoints:** 8
- ✅ GET `/groups` - Danh sách nhóm
- ✅ GET `/groups/:id` - Chi tiết nhóm
- ✅ POST `/groups` - Tạo nhóm (Student)
- ✅ PUT `/groups/:id` - Cập nhật nhóm
- ✅ DELETE `/groups/:id` - Xóa nhóm
- ✅ GET `/groups/:id/members` - Danh sách thành viên
- ✅ POST `/groups/:id/members` - Mời thành viên
- ✅ DELETE `/groups/:id/members/:memberId` - Xóa thành viên

**🟡 Thiếu endpoint:**
- ⚠️ PUT `/groups/:id/topic` - Chọn đề tài cho nhóm (Bước 5 Luồng 1)

**UI:** GroupManagementView.jsx, GroupSidebar.jsx

**Status:** 🟡 Thiếu endpoint chọn đề tài

---

#### 6. **Question Resource** (`app.service.js - questionService`)

**Endpoints:** 5 (hiện tại) + 2 (cần thêm) = 7
- ✅ GET `/questions` - Danh sách câu hỏi (filter theo status, group)
- ✅ GET `/questions/:id` - Chi tiết câu hỏi
- ✅ POST `/questions` - Tạo câu hỏi (Student)
- ✅ PUT `/questions/:id` - Cập nhật câu hỏi
- ✅ DELETE `/questions/:id` - Xóa câu hỏi

**⚠️ Thiếu 2 endpoints quan trọng:**
- ⚠️ PUT `/questions/:id/escalate` - Escalate câu hỏi lên Manager (Bước 2C Luồng 2)
- ⚠️ POST `/questions/:id/ask-ai` - Gọi AI trả lời (Bước 2B Luồng 2)

**UI:** 
- QAForumView.jsx (Student)
- QAManagementView.jsx (Lecturer/Manager) ⚠️ **CẦN TẠO**

**Status:** 🟡 Thiếu 2 endpoints cốt lõi cho Luồng 2

---

#### 7. **Answer Resource** (`app.service.js - answerService`)

**Endpoints:** 5
- ✅ GET `/questions/:questionId/answers` - Danh sách câu trả lời
- ✅ GET `/answers/:id` - Chi tiết câu trả lời
- ✅ POST `/questions/:questionId/answers` - Tạo câu trả lời (Lecturer/Manager)
- ✅ PUT `/answers/:id` - Cập nhật câu trả lời
- ✅ DELETE `/answers/:id` - Xóa câu trả lời

**🟡 Thiếu field:**
- ⚠️ `is_public` field trong POST/PUT answer để set quyền riêng tư (Bước 4 Luồng 2)

**UI:** QAForumView.jsx, QAManagementView.jsx

**Status:** 🟡 Thiếu quyền riêng tư Private/Public

---

### Tổng kết Resources:

| # | Resource | Endpoints | Status |
|---|----------|-----------|--------|
| 1 | Authentication | 3 | ✅ Hoàn thành |
| 2 | User | 7 | ✅ Hoàn thành |
| 3 | Topic | 7 | 🟡 Thiếu file upload |
| 4 | Class | 5 | 🟡 Thiếu members endpoints |
| 5 | Group | 8 | 🟡 Thiếu select topic endpoint |
| 6 | Question | 5 (+2 cần thêm) | 🟡 Thiếu escalate & AI |
| 7 | Answer | 5 | 🟡 Thiếu visibility field |
| **TOTAL** | **7 Resources** | **31 Endpoints** | **🟡 Cần bổ sung** |

**✅ Yêu cầu Review 2:** 5 resources với 20-30 endpoints → **ĐÃ VƯỢT**

---

## 🟡 YÊU CẦU 3: File Upload from FE to API

### Trạng thái: 🟡 **ĐANG THIẾU**

### Yêu cầu từ 2 Luồng:

**LUỒNG 1 - Bước 1:** Giảng viên tạo đề tài cần upload file Syllabus/Tài liệu

**Backend cần:**
```javascript
// BE/src/routes/topic.routes.js
const upload = multer({ dest: 'uploads/topics/' });
router.post('/', upload.single('syllabus'), topicController.createTopic);
router.put('/:id', upload.single('syllabus'), topicController.updateTopic);
```

**Frontend cần:**
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
    
    return await api.post('/topics', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
```

**UI Component cần tạo:**
```jsx
// FE/src/components/lecturer/TopicManagementView.jsx
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';

export default function TopicManagementView() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    syllabus: null
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      setFormData(prev => ({ ...prev, syllabus: acceptedFiles[0] }));
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await topicService.createTopic(formData, formData.syllabus);
      toast.success('Đề tài đã được tạo và đang chờ duyệt');
      // Reset form
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tạo đề tài');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tạo Đề Tài Mới</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tiêu đề</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg h-32"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">File Syllabus</label>
          {!formData.syllabus ? (
            <div
              {...getRootProps()}
              className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary cursor-pointer transition-colors"
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Kéo thả file vào đây hoặc click để chọn
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, DOC, DOCX (Max 10MB)
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-sm">{formData.syllabus.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, syllabus: null }))}
                className="text-destructive hover:bg-destructive/10 p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Tạo đề tài
        </button>
      </form>
    </div>
  );
}
```

### Status: ⚠️ **CẦN IMPLEMENT**

---

## 🎯 DANH SÁCH HÀNH ĐỘNG CẦN LÀM (Action Items)

### **Priority 1: Backend API - Bổ sung endpoints thiếu**

1. **Class Members Management** (BE)
   ```javascript
   // BE/src/controllers/class.controller.js
   getClassStudents: async (req, res) => {
     const students = await User.findAll({
       include: [{
         model: Class,
         where: { id: req.params.id },
         through: { attributes: [] }
       }],
       where: { role: 'STUDENT' }
     });
     res.json(students);
   },
   
   addStudentToClass: async (req, res) => {
     const { classId } = req.params;
     const { studentId } = req.body;
     // Logic thêm sinh viên vào lớp
   },
   
   removeStudentFromClass: async (req, res) => {
     const { classId, studentId } = req.params;
     // Logic xóa sinh viên khỏi lớp
   }
   ```

2. **Group Select Topic** (BE)
   ```javascript
   // BE/src/controllers/group.controller.js
   selectTopic: async (req, res) => {
     const { topicId } = req.body;
     const group = await Group.findByPk(req.params.id);
     
     // Kiểm tra topic đã APPROVED
     const topic = await Topic.findByPk(topicId);
     if (topic.status !== 'APPROVED') {
       return res.status(400).json({ message: 'Đề tài chưa được duyệt' });
     }
     
     // Kiểm tra quota (nếu có)
     group.topic_id = topicId;
     await group.save();
     res.json(group);
   }
   ```

3. **Question Escalate & AI** (BE)
   ```javascript
   // BE/src/controllers/question.controller.js
   escalateQuestion: async (req, res) => {
     const question = await Question.findByPk(req.params.id);
     question.status = 'ESCALATED_TO_MANAGER';
     await question.save();
     
     // Gửi notification cho Manager
     await notificationService.notifyManager(question);
     res.json(question);
   },
   
   askAI: async (req, res) => {
     const question = await Question.findByPk(req.params.id, {
       include: [{ model: Group, include: [Topic] }]
     });
     
     // Build context
     const context = `
       Question: ${question.content}
       Topic: ${question.Group.Topic.title}
       Description: ${question.Group.Topic.description}
       Syllabus: ${question.Group.Topic.syllabus_url}
     `;
     
     // Call OpenAI API
     const aiResponse = await openai.chat.completions.create({
       model: 'gpt-4',
       messages: [
         { role: 'system', content: 'Bạn là trợ lý giảng dạy chuyên môn' },
         { role: 'user', content: context }
       ]
     });
     
     res.json({ draft: aiResponse.choices[0].message.content });
   }
   ```

4. **Answer Visibility** (BE)
   ```javascript
   // BE/src/models/answer.model.js
   // Thêm field is_public vào schema
   is_public: {
     type: DataTypes.BOOLEAN,
     defaultValue: false
   }
   
   // BE/src/controllers/answer.controller.js
   createAnswer: async (req, res) => {
     const { content, is_public } = req.body;
     const answer = await Answer.create({
       question_id: req.params.questionId,
       answered_by: req.user.id,
       content,
       is_public
     });
     
     // Update question status to RESOLVED
     await Question.update(
       { status: 'RESOLVED' },
       { where: { id: req.params.questionId } }
     );
     
     res.json(answer);
   }
   ```

### **Priority 2: Frontend UI - Tạo views thiếu**

5. **TopicManagementView.jsx** (FE)
   - Form tạo đề tài (title, description)
   - File upload cho syllabus (PDF/DOC/DOCX)
   - Danh sách đề tài của giảng viên (status PENDING/APPROVED/REJECTED)

6. **QAManagementView.jsx** (FE)
   - Danh sách câu hỏi theo status (WAITING_LECTURER, ESCALATED_TO_MANAGER, RESOLVED)
   - Form trả lời với editor
   - Nút "Hỏi AI" gọi `/questions/:id/ask-ai`
   - Hiển thị AI draft, cho phép chỉnh sửa trước khi gửi
   - Nút "Escalate" chuyển câu hỏi lên Manager
   - Toggle Private/Public cho answer

7. **GroupDashboard.jsx Enhancement** (FE)
   - Thêm section "Chọn đề tài" với danh sách topics APPROVED
   - Nút "Đăng ký đề tài" gọi `PUT /groups/:id/topic`

8. **ClassManagementView.jsx Enhancement** (FE)
   - Thêm tab "Sinh viên" hiển thị danh sách sinh viên trong lớp
   - Nút "Thêm sinh viên" (select từ danh sách user role STUDENT)
   - Nút "Xóa sinh viên" khỏi lớp

### **Priority 3: Services - Cập nhật API calls**

9. **topicService** (FE)
   - Cập nhật `createTopic()` và `updateTopic()` hỗ trợ file upload

10. **classService** (FE)
    - Thêm `getClassStudents(classId)`
    - Thêm `addStudentToClass(classId, studentId)`
    - Thêm `removeStudentFromClass(classId, studentId)`

11. **groupService** (FE)
    - Thêm `selectTopic(groupId, topicId)`

12. **questionService** (FE)
    - Thêm `escalateQuestion(questionId)`
    - Thêm `askAI(questionId)`

13. **answerService** (FE)
    - Cập nhật `createAnswer()` nhận thêm param `is_public`

---

## 📊 TIẾN ĐỘ TỔNG QUAN (Progress Overview)

| Yêu cầu | Trạng thái | Hoàn thành | Thiếu |
|---------|-----------|------------|-------|
| **1. Template** | ✅ Hoàn thành | 100% | 0 |
| **2. CRUD APIs** | 🟡 Gần xong | 85% | 5 endpoints + 2 views |
| **3. File Upload** | 🟡 Thiếu | 30% | Topic file upload |

### Chi tiết các phần thiếu:

**Backend (5 endpoints):**
- ⚠️ GET `/classes/:id/students`
- ⚠️ POST `/classes/:id/students`
- ⚠️ PUT `/groups/:id/topic`
- ⚠️ PUT `/questions/:id/escalate`
- ⚠️ POST `/questions/:id/ask-ai`

**Frontend (2 views chính):**
- ⚠️ TopicManagementView.jsx (Lecturer)
- ⚠️ QAManagementView.jsx (Lecturer/Manager)

**File Upload:**
- ⚠️ Topic syllabus upload (Backend + Frontend)

---

## 🚀 LỘ TRÌNH HOÀN THIỆN (Roadmap)

### **Phase 1: Backend API (1-2 days)**
1. Tạo class members endpoints
2. Tạo group select topic endpoint
3. Tạo question escalate endpoint
4. Tạo question ask-ai endpoint (tích hợp OpenAI)
5. Cập nhật answer model với is_public field
6. Thêm file upload cho topic (multer middleware)

### **Phase 2: Frontend Services (0.5 day)**
1. Cập nhật classService
2. Cập nhật groupService
3. Cập nhật questionService
4. Cập nhật answerService
5. Cập nhật topicService với file upload

### **Phase 3: Frontend UI (2-3 days)**
1. Tạo TopicManagementView.jsx
2. Tạo QAManagementView.jsx
3. Enhance GroupDashboard.jsx (select topic)
4. Enhance ClassManagementView.jsx (students tab)

### **Phase 4: Testing & Integration (1 day)**
1. Test full flow Luồng 1: Topic Management
2. Test full flow Luồng 2: Q&A + AI
3. Fix bugs
4. Polish UI/UX

**Tổng thời gian ước tính: 4-6 days**

---

## ❌ CÁC THÀNH PHẦN ĐÃ XÓA (Không thuộc 2 luồng)

Các resource/view sau **KHÔNG** thuộc 2 luồng nghiệp vụ cốt lõi và đã được loại bỏ:

- ❌ **Semester Management** (SemesterManagementView.jsx, semesterService)
- ❌ **Milestone Management** (MilestoneManagementView.jsx, milestoneService)
- ❌ **Submission Management** (SubmissionGradingView.jsx, submissionService)
- ❌ **Channel/Message Chat** (ChatChannelView.jsx, SlackChat.jsx, channelService, messageService)

**Lý do:** Thầy chỉ yêu cầu 2 luồng: (1) Topic Management và (2) Q&A Hierarchical. Chat được thay thế bằng hệ thống Q&A ticket.

---

## 📝 GHI CHÚ QUAN TRỌNG

1. **Database Schema:** Đảm bảo database có đầy đủ bảng: `users`, `topics`, `classes`, `student_groups`, `group_members`, `questions`, `answers`

2. **AI Integration:** Cần OpenAI API key trong `.env`:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

3. **File Upload:** Backend cần cấu hình multer và folder `uploads/topics/`

4. **Notifications:** Cần service/socket.io để push notification real-time (có thể implement sau)

5. **Roles:** Hệ thống có 3 roles: `STUDENT`, `LECTURER`, `MANAGER` (hoặc `Student`, `Lecturer`, `Admin` tùy schema)

---

## 📧 HỖ TRỢ

Nếu có thắc mắc về implementation, vui lòng liên hệ team lead hoặc tham khảo:
- Database Schema: `BE/database-schema.sql`
- API Documentation: `BE/docs/`
- Component Examples: `FE/src/components/`
