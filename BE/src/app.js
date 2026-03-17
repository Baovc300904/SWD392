const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.config');
const { sequelize, testConnection, User, Topic, Question, QuestionDraft, Answer, Submission, Task } = require('./models');
const { Op, DataTypes } = require('sequelize');

// Import routes
const apiRoutes = require('./routes/api.routes');

// Create Express app
const app = express();
app.set('etag', false);

function looksCorrupted(text) {
    if (!text || typeof text !== 'string') return false;
    const markers = ['�', 'Ã', 'Â', 'Ä', 'áº', 'á»', 'Æ', 'Ð', 'Ñ'];
    return markers.some((m) => text.includes(m));
}

function repairMojibakeText(text) {
    if (!looksCorrupted(text)) return text;
    try {
        const repaired = Buffer.from(text, 'latin1').toString('utf8');
        return repaired || text;
    } catch (_) {
        return text;
    }
}

async function repairDemoVietnameseData() {
    // 1) Generic repair for all rows that look mojibake (best effort).
    const users = await User.findAll({ attributes: ['id', 'fullName'] });
    for (const user of users) {
        const repairedName = repairMojibakeText(user.fullName);
        if (repairedName !== user.fullName) {
            await user.update({ fullName: repairedName });
            console.log(`✅ Auto-repaired user fullName: #${user.id}`);
        }
    }

    const topics = await Topic.findAll({ attributes: ['id', 'title', 'description'] });
    for (const topic of topics) {
        const nextTitle = repairMojibakeText(topic.title);
        const nextDescription = repairMojibakeText(topic.description);
        if (nextTitle !== topic.title || nextDescription !== topic.description) {
            await topic.update({ title: nextTitle, description: nextDescription });
            console.log(`✅ Auto-repaired topic text: #${topic.id}`);
        }
    }

    const questions = await Question.findAll({ attributes: ['id', 'title', 'content'] });
    for (const question of questions) {
        const nextTitle = repairMojibakeText(question.title);
        const nextContent = repairMojibakeText(question.content);
        if (nextTitle !== question.title || nextContent !== question.content) {
            await question.update({ title: nextTitle, content: nextContent });
            console.log(`✅ Auto-repaired question text: #${question.id}`);
        }
    }

    const answers = await Answer.findAll({ attributes: ['id', 'content'] });
    for (const answer of answers) {
        const nextContent = repairMojibakeText(answer.content);
        if (nextContent !== answer.content) {
            await answer.update({ content: nextContent });
            console.log(`✅ Auto-repaired answer content: #${answer.id}`);
        }
    }

    // 2) Canonical overrides for known demo rows that may contain replacement-char loss.
    const usersToRepair = [
        { email: 'gva@fpt.edu.vn', fullName: 'Giảng Viên Nguyễn Văn A' },
        { email: 'gvb@fpt.edu.vn', fullName: 'Giảng Viên Trần Thị B' },
        { email: 'manager@fpt.edu.vn', fullName: 'Trưởng Bộ Môn (Manager)' },
        { email: 'sv1@fpt.edu.vn', fullName: 'Sinh Viên Lê Văn C' },
        { email: 'sv2@fpt.edu.vn', fullName: 'Sinh Viên Phạm Thị D' },
        { email: 'sv3@fpt.edu.vn', fullName: 'Sinh Viên Hoàng Văn E' },
        { email: 'sv4@fpt.edu.vn', fullName: 'Sinh Viên Vũ Thị F' }
    ];

    for (const item of usersToRepair) {
        const user = await User.findOne({ where: { email: item.email } });
        if (user && looksCorrupted(user.fullName)) {
            await user.update({ fullName: item.fullName });
            console.log(`✅ Repaired user fullName: ${item.email}`);
        }
    }

    const topicsToRepair = [
        {
            id: 1,
            keyword: 'SWD392',
            title: 'Hệ thống Quản lý Đồ án SWD392',
            description: 'Xây dựng hệ thống quản lý có tích hợp AI Q&A.'
        },
        {
            id: 2,
            keyword: 'Mobile',
            title: 'Ứng dụng Đặt Đồ Ăn Mobile',
            description: 'App Flutter kết nối Firebase.'
        },
        {
            id: 3,
            keyword: 'Tiếng Anh AI',
            title: 'Nền tảng học Tiếng Anh AI',
            description: 'Dùng OpenAI để luyện giao tiếp.'
        }
    ];

    for (const item of topicsToRepair) {
        let topic = await Topic.findByPk(item.id);
        if (!topic) {
            topic = await Topic.findOne({
                where: {
                    [Op.or]: [
                        { title: { [Op.like]: `%${item.keyword}%` } },
                        { description: { [Op.like]: `%${item.keyword}%` } }
                    ]
                }
            });
        }
        if (!topic) continue;

        const needRepair = looksCorrupted(topic.title) || looksCorrupted(topic.description);
        if (needRepair) {
            await topic.update({ title: item.title, description: item.description });
            console.log(`✅ Repaired topic text: #${item.id}`);
        }
    }

    const questionsToRepair = [
        {
            id: 1,
            keyword: 'Database',
            title: 'Lỗi kết nối Database',
            content: 'Thầy ơi em không connect được MySQL với Node.js, nó báo lỗi Access Denied ạ.'
        },
        {
            id: 2,
            keyword: 'OpenAI',
            title: 'Xin cấp API Key OpenAI',
            content: 'Cho em hỏi bộ môn có hỗ trợ cấp API Key của OpenAI cho đề tài này không ạ?'
        },
        {
            id: 3,
            keyword: 'Firebase',
            title: 'Cách cấu hình Firebase Auth',
            content: 'Em chưa hiểu luồng đăng nhập Firebase trên Flutter, thầy hướng dẫn giúp em với.'
        }
    ];

    for (const item of questionsToRepair) {
        let question = await Question.findByPk(item.id);
        if (!question) {
            question = await Question.findOne({
                where: {
                    [Op.or]: [
                        { title: { [Op.like]: `%${item.keyword}%` } },
                        { content: { [Op.like]: `%${item.keyword}%` } }
                    ]
                }
            });
        }

        if (question && (looksCorrupted(question.title) || looksCorrupted(question.content))) {
            await question.update({ title: item.title, content: item.content });
            console.log(`✅ Repaired question text: #${question.id}`);
        }
    }

    const answersToRepair = [
        {
            id: 1,
            keyword: 'password',
            content: 'Chào em, lỗi này thường do sai password trong file .env. Em check lại file config nhé.'
        },
        {
            id: 2,
            keyword: 'API Key',
            content: 'Chào em, hiện tại bộ môn không cấp sẵn API Key. Các nhóm tự dùng tài khoản free limit để làm demo Checkpoint nhé.'
        }
    ];

    for (const item of answersToRepair) {
        let answer = await Answer.findByPk(item.id);
        if (!answer) {
            answer = await Answer.findOne({ where: { content: { [Op.like]: `%${item.keyword}%` } } });
        }

        if (answer && looksCorrupted(answer.content)) {
            await answer.update({ content: item.content });
            console.log(`✅ Repaired answer content: #${answer.id}`);
        }
    }
}

async function ensureUsersTableCompatibility() {
    const queryInterface = sequelize.getQueryInterface();
    const columns = await queryInterface.describeTable('users');

    if (!columns.avatar_url) {
        await queryInterface.addColumn('users', 'avatar_url', {
            type: DataTypes.TEXT,
            allowNull: true
        });
        console.log('✅ Added missing column users.avatar_url');
    }

    if (!columns.fcm_token) {
        await queryInterface.addColumn('users', 'fcm_token', {
            type: DataTypes.TEXT,
            allowNull: true
        });
        console.log('✅ Added missing column users.fcm_token');
    }

    if (!columns.status) {
        await queryInterface.addColumn('users', 'status', {
            type: DataTypes.ENUM('Online', 'Offline', 'Away'),
            allowNull: false,
            defaultValue: 'Offline'
        });
        console.log('✅ Added missing column users.status');
    }

    if (!columns.is_online) {
        await queryInterface.addColumn('users', 'is_online', {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
        console.log('✅ Added missing column users.is_online');
    }

    if (!columns.last_seen_at) {
        await queryInterface.addColumn('users', 'last_seen_at', {
            type: DataTypes.DATE,
            allowNull: true
        });
        console.log('✅ Added missing column users.last_seen_at');
    }
}

async function ensureStudentGroupsTableCompatibility() {
    const queryInterface = sequelize.getQueryInterface();
    const columns = await queryInterface.describeTable('student_groups');

    if (!columns.group_status) {
        await queryInterface.addColumn('student_groups', 'group_status', {
            type: DataTypes.ENUM('PENDING', 'CONFIRMED'),
            allowNull: false,
            defaultValue: 'PENDING'
        });
        console.log('✅ Added missing column student_groups.group_status');
    }

    if (!columns.confirmed_by) {
        await queryInterface.addColumn('student_groups', 'confirmed_by', {
            type: DataTypes.INTEGER,
            allowNull: true
        });
        console.log('✅ Added missing column student_groups.confirmed_by');
    }

    if (!columns.confirmed_at) {
        await queryInterface.addColumn('student_groups', 'confirmed_at', {
            type: DataTypes.DATE,
            allowNull: true
        });
        console.log('✅ Added missing column student_groups.confirmed_at');
    }
}

async function ensureAcademicWorkflowTablesCompatibility() {
    // Some local databases were initialized with an older schema
    // and miss workflow tables required by Manager dashboard.
    const queryInterface = sequelize.getQueryInterface();
    const allTablesRaw = await queryInterface.showAllTables();
    const allTables = allTablesRaw.map((t) => {
        if (typeof t === 'string') return t;
        return Object.values(t)[0];
    });

    if (!allTables.includes('submissions')) {
        await Submission.sync();
        console.log('✅ Created missing table submissions');
    }

    if (!allTables.includes('tasks')) {
        await Task.sync();
        console.log('✅ Created missing table tasks');
    }

    if (!allTables.includes('question_drafts')) {
        await QuestionDraft.sync();
        console.log('✅ Created missing table question_drafts');
    }
}

// Connect to MySQL and create default admin
testConnection().then(async () => {
    try {
        await ensureUsersTableCompatibility();
        await ensureStudentGroupsTableCompatibility();
        await ensureAcademicWorkflowTablesCompatibility();
    } catch (err) {
        console.error('❌ Failed to ensure database compatibility:', err.message);
    }

    // Sync database (optional - use migrations in production)
    // await sequelize.sync({ alter: true });

    // Create default admin from environment variables
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    try {
        const adminExists = await User.findOne({ where: { email: adminEmail } });
        if (!adminExists) {
            await User.create({
                fullName: 'System Administrator',
                email: adminEmail,
                passwordHash: adminPassword, // Will be hashed via hook
                role: 'manager',  // Must match User model enum: student, lecturer, manager
                isEmailVerified: true, // Admin account is pre-verified
                isOnline: false, // Default to offline, will be online after login
                status: 'Offline'
            });
            console.log(`✅ Default admin created: ${adminEmail}`);
        } else if (!adminExists.isEmailVerified) {
            // Update existing admin if not verified (from previous migrations)
            adminExists.isEmailVerified = true;
            await adminExists.save();
            console.log(`✅ Existing admin email verified: ${adminEmail}`);
        } else {
            console.log(`ℹ️  Admin already exists: ${adminEmail}`);
        }
    } catch (err) {
        console.error('❌ Failed to create default admin:', err.message);
    }

    // Seed/repair demo lecturers for local development
    // If these emails already exist but were created as students (common when someone registered them),
    // convert them back to lecturer + mark verified so login works without OTP.
    const demoLecturers = [
        {
            fullName: process.env.LECTURER1_FULL_NAME || 'Giảng Viên Nguyễn Văn A',
            email: process.env.LECTURER1_EMAIL || 'gva@fpt.edu.vn',
            password: process.env.LECTURER1_PASSWORD || '123456'
        },
        {
            fullName: process.env.LECTURER2_FULL_NAME || 'Giảng Viên Trần Thị B',
            email: process.env.LECTURER2_EMAIL || 'gvb@fpt.edu.vn',
            password: process.env.LECTURER2_PASSWORD || '123456'
        }
    ];

    for (const lecturer of demoLecturers) {
        try {
            const existing = await User.findOne({ where: { email: lecturer.email } });
            if (!existing) {
                await User.create({
                    fullName: lecturer.fullName,
                    email: lecturer.email,
                    passwordHash: lecturer.password,
                    role: 'lecturer',
                    isEmailVerified: true,
                    isOnline: false,
                    status: 'Offline'
                });
                console.log(`✅ Default lecturer created: ${lecturer.email}`);
            } else {
                // Repair role/verification + reset password to the configured demo password.
                await existing.update({
                    fullName: existing.fullName || lecturer.fullName,
                    role: 'lecturer',
                    isEmailVerified: true,
                    passwordHash: lecturer.password
                });
                console.log(`✅ Default lecturer repaired: ${lecturer.email}`);
            }
        } catch (err) {
            console.error(`❌ Failed to seed/repair lecturer (${lecturer.email}):`, err.message);
        }
    }

    // Seed/repair demo students for local development.
    // Many local databases have these rows unverified, which blocks /auth/login.
    const demoStudents = [
        {
            fullName: process.env.STUDENT1_FULL_NAME || 'Sinh Viên Lê Văn C',
            email: process.env.STUDENT1_EMAIL || 'sv1@fpt.edu.vn',
            password: process.env.STUDENT1_PASSWORD || '123456',
            studentCode: process.env.STUDENT1_CODE || 'SE170001'
        },
        {
            fullName: process.env.STUDENT2_FULL_NAME || 'Sinh Viên Phạm Thị D',
            email: process.env.STUDENT2_EMAIL || 'sv2@fpt.edu.vn',
            password: process.env.STUDENT2_PASSWORD || '123456',
            studentCode: process.env.STUDENT2_CODE || 'SE170002'
        }
    ];

    for (const student of demoStudents) {
        try {
            const existing = await User.findOne({ where: { email: student.email } });
            if (!existing) {
                await User.create({
                    fullName: student.fullName,
                    email: student.email,
                    studentCode: student.studentCode,
                    passwordHash: student.password,
                    role: 'student',
                    isEmailVerified: true,
                    isOnline: false,
                    status: 'Offline'
                });
                console.log(`✅ Default student created: ${student.email}`);
            } else {
                await existing.update({
                    fullName: existing.fullName || student.fullName,
                    studentCode: existing.studentCode || student.studentCode,
                    role: 'student',
                    isEmailVerified: true,
                    passwordHash: student.password
                });
                console.log(`✅ Default student repaired: ${student.email}`);
            }
        } catch (err) {
            console.error(`❌ Failed to seed/repair student (${student.email}):`, err.message);
        }
    }

    try {
        await repairDemoVietnameseData();
    } catch (err) {
        console.error('❌ Failed to repair Vietnamese demo text:', err.message);
    }
}).catch(err => {
    console.error('❌ Database connection failed:', err);
});


// Middleware
// CORS configuration - allow localhost/127.0.0.1 on any port for local dev
const allowedOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const corsOptions = {
    origin(origin, callback) {
        if (!origin || allowedOriginPattern.test(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SWD392 API Docs'
}));

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Node.js Basic Project API',
        version: '1.0.0',
        status: 'running',
        documentation: '/api-docs'
    });
});

app.use('/api', (req, res, next) => {
    res.type('application/json; charset=utf-8');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
}, apiRoutes);

// Auto-offline cron job: mỗi 60s, ai lastSeenAt > 3 phút → Offline
setInterval(async () => {
    try {
        const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
        const [count] = await User.update(
            { status: 'Offline', isOnline: false },
            {
                where: {
                    isOnline: true,
                    lastSeenAt: { [Op.lt]: threeMinutesAgo }
                }
            }
        );
        if (count > 0) console.log(`🔴 Auto-offline: ${count} user(s) set to Offline`);
    } catch (err) {
        console.error('❌ Auto-offline cron error:', err.message);
    }
}, 60 * 1000);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

module.exports = app;
