const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.config');
const { sequelize, testConnection, User, Topic, Question, QuestionDraft, Submission, Task } = require('./models');
const { Op, DataTypes } = require('sequelize');

// Import routes
const apiRoutes = require('./routes/api.routes');

// Create Express app
const app = express();
app.set('etag', false);

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

async function ensureTopicsTableCompatibility() {
    const queryInterface = sequelize.getQueryInterface();
    const columns = await queryInterface.describeTable('topics');

    if (!columns.semester_id) {
        await queryInterface.addColumn('topics', 'semester_id', {
            type: DataTypes.INTEGER,
            allowNull: true
        });
        console.log('✅ Added missing column topics.semester_id');
    }

    if (!columns.syllabus_url) {
        await queryInterface.addColumn('topics', 'syllabus_url', {
            type: DataTypes.TEXT,
            allowNull: true
        });
        console.log('✅ Added missing column topics.syllabus_url');
    }
}

async function ensureQuestionsTableCompatibility() {
    const queryInterface = sequelize.getQueryInterface();
    const columns = await queryInterface.describeTable('questions');

    if (!columns.is_public) {
        await queryInterface.addColumn('questions', 'is_public', {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
        console.log('✅ Added missing column questions.is_public');
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

async function ensureDefaultManagerPresence() {
    const adminEmail = process.env.ADMIN_EMAIL || 'manager@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminFullName = process.env.ADMIN_FULL_NAME || 'System Manager';

    if (!adminPassword) {
        console.warn('⚠️  ADMIN_PASSWORD is missing. Skip default manager auto-create.');
        return;
    }

    const existingUser = await User.findOne({
        where: { email: adminEmail },
        attributes: ['id', 'email', 'role', 'isEmailVerified']
    });

    if (!existingUser) {
        const created = await User.create({
            fullName: adminFullName,
            email: adminEmail,
            passwordHash: adminPassword,
            role: 'manager',
            isEmailVerified: true
        });

        console.log(`✅ Auto-created default manager: ${created.email}`);
        return;
    }

    const shouldPromote = existingUser.role !== 'manager';
    const shouldVerify = !existingUser.isEmailVerified;

    if (shouldPromote || shouldVerify) {
        await existingUser.update({
            role: 'manager',
            isEmailVerified: true
        });
        console.log(`✅ Updated default manager account: ${existingUser.email}`);
    } else {
        console.log(`ℹ️  Default manager exists: ${existingUser.email} (verified: yes)`);
    }
}

async function ensureAllUsersVerified() {
    const [updatedCount] = await User.update(
        { isEmailVerified: true },
        { where: { isEmailVerified: false } }
    );

    if (updatedCount > 0) {
        console.log(`✅ Verified ${updatedCount} existing user(s)`);
    }
}

// Connect to MySQL and ensure database compatibility
testConnection().then(async () => {
    try {
        await ensureUsersTableCompatibility();
        await ensureStudentGroupsTableCompatibility();
        await ensureTopicsTableCompatibility();
        await ensureQuestionsTableCompatibility();
        await ensureAcademicWorkflowTablesCompatibility();
        await Topic.sync();
        await Question.sync();
        await ensureAllUsersVerified();
        await ensureDefaultManagerPresence();
    } catch (err) {
        console.error('❌ Failed to ensure database compatibility:', err.message);
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
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
