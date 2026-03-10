# GIẢI THÍCH LUỒNG JOIN NHÓM (GROUP WORKFLOW)

## 🎓 TỔNG QUAN HỆ THỐNG

### Cấu trúc dữ liệu:
```
User (Student) 
  └─> enrolled in Classes 
       └─> can create/join Groups in each Class
            └─> Group selects a Topic
                 └─> Group uses Q&A Forum, Task Board, Resources
```

## 📋 LUỒNG CHI TIẾT

### 1️⃣ **MANAGER TẠO CẤU TRÚC BAN ĐẦU**
```
Manager → Tạo Semesters → Tạo Classes → Assign Lecturer cho mỗi Class
```

### 2️⃣ **STUDENT ĐĂNG KÝ VÀO LỚP**
```sql
-- Students được add vào Classes (thông qua enrollment - chưa có table này)
-- Hoặc tự động assign khi tạo user với student_code pattern
```

### 3️⃣ **STUDENT TẠO HOẶC JOIN NHÓM**

#### Option A: Tạo nhóm mới
```javascript
// Student tạo group trong class của mình
POST /api/groups
{
  "group_name": "Group 04",
  "class_id": 1,
  "topic_id": 2  // Chọn topic đã được APPROVED
}
// → Tự động thêm student vào group_members
// → group_id được tạo
```

#### Option B: Join nhóm có sẵn
```javascript
// Student xem danh sách groups trong class
GET /api/groups?classId=1

// Student join vào group
POST /api/groups/:groupId/members
{
  "student_id": 4
}
// → Insert vào group_members table
```

### 4️⃣ **HỆ THỐNG XÁC ĐỊNH NHÓM HIỆN TẠI**

#### Cách 1: Lấy tất cả nhóm của student
```javascript
// API cần thêm:
GET /api/users/me/groups
// Response:
{
  "groups": [
    { "group_id": 1, "group_name": "Group 04", "class_name": "SE1701", "topic": "AI System" },
    { "group_id": 5, "group_name": "Group 08", "class_name": "SE1702", "topic": "Web App" }
  ]
}
```

#### Cách 2: Student chọn group để làm việc
```javascript
// FE lưu vào localStorage hoặc state
localStorage.setItem('currentGroupId', '1');

// Hoặc API endpoint:
PUT /api/users/me/active-group
{ "group_id": 1 }
```

## 🔧 HIỆN TRẠNG VÀ VẤN ĐỀ

### ❌ Vấn đề hiện tại:
```javascript
// FE/src/App.jsx line 251
setCurrentGroupId(null);  // ← LUÔN NULL!
```

### ✅ Cần làm:

1. **Tạo API lấy groups của student:**
```javascript
// BE/src/routes/user.routes.js
router.get('/me/groups', getUserGroups);

// BE/src/controllers/user.controller.js
const getUserGroups = async (req, res) => {
  const userId = req.user.id; // From JWT
  const groups = await GroupMember.findAll({
    where: { student_id: userId },
    include: [{ 
      model: StudentGroup, 
      include: [Topic, Class] 
    }]
  });
  res.json({ data: groups });
};
```

2. **FE: Fetch groups khi login:**
```javascript
// FE/src/App.jsx
useEffect(() => {
  const user = authService.getCurrentUser();
  if (user?.token) {
    setUserRole(user.role?.toLowerCase() || null);
    
    // Fetch user's groups
    if (user.role === 'student') {
      userService.getMyGroups()
        .then(response => {
          const groups = response.data;
          if (groups.length > 0) {
            // Option 1: Auto-select first group
            setCurrentGroupId(groups[0].id);
            
            // Option 2: Show group selector modal
            // setAvailableGroups(groups);
            // setShowGroupSelector(true);
          }
        });
    }
  }
}, []);
```

3. **UI để chọn nhóm (nếu student có nhiều nhóm):**
```jsx
// Component: GroupSelector.jsx
<select onChange={(e) => setCurrentGroupId(e.target.value)}>
  {groups.map(g => (
    <option key={g.id} value={g.id}>
      {g.group_name} - {g.class.class_name}
    </option>
  ))}
</select>
```

## 📊 DATABASE STRUCTURE

```sql
-- Student join group = record in group_members:
group_members (
  group_id INT,      -- FK to student_groups.id
  student_id INT,    -- FK to users.id (where role='student')
  joined_at DATETIME
)

-- To find all groups of a student:
SELECT sg.*, c.class_name, t.title as topic_title
FROM group_members gm
JOIN student_groups sg ON gm.group_id = sg.id
JOIN classes c ON sg.class_id = c.id
LEFT JOIN topics t ON sg.topic_id = t.id
WHERE gm.student_id = ?;
```

## 🚀 HÀNH ĐỘNG CẦN LÀM

### Priority 1: Sửa lỗi 404 Semester (✅ ĐÃ XONG)
- Đã restore `/api/semesters` routes trong BE
- Restart BE server đang chạy

### Priority 2: Tạo API "Get My Groups"
```javascript
// BE: Add route GET /api/users/me/groups
// FE: Call API khi student login
// FE: Store groupId in state or localStorage
```

### Priority 3: UI Group Selector
```javascript
// Nếu student có nhiều nhóm → Show dropdown/modal chọn nhóm
// Pass groupId xuống GroupSidebar và các components khác
```

### Priority 4: Implement Group Join Flow
```javascript
// Page: /classes/:classId/groups (list groups in class)
// Button: "Join Group" → POST /api/groups/:id/members
// Update group_members table
```

## 🎯 TÓM TẮT

**Câu hỏi:** "User làm sao để biết mình join nhóm nào?"

**Trả lời:**
1. Student **join nhóm** bằng cách: Manager add vào group HOẶC tự join qua UI
2. Data lưu trong `group_members` table (many-to-many relationship)
3. Để **biết nhóm nào**, query: `SELECT * FROM group_members WHERE student_id = currentUserId`
4. **Hiện tại FE chưa làm bước này** → `currentGroupId = null` → Components không load được data
5. **Cần thêm:**
   - API: `GET /api/users/me/groups`
   - FE: Fetch groups khi login, cho student chọn group
   - Lưu `groupId` vào state hoặc localStorage

**Database có SẴN đầy đủ structure, chỉ cần code logic!** 🎉
