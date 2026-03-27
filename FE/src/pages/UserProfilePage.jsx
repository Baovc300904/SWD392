import { useEffect, useRef, useState } from 'react';
import {
    ArrowLeft, User, Mail, IdCard, Phone, MapPin, Calendar,
    Edit3, Save, X, Camera, Shield, BookOpen, Users, Star,
    ChevronRight, Lock, Eye, EyeOff, CheckCircle, GraduationCap,
    Briefcase, Award, Loader2, MessageSquare, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import authService from '../services/auth.service';
import userService from '../services/user.service';
import userSettingsService from '../services/user-settings.service';
import cloudinaryStorageService from '../services/cloudinary-storage.service';
import questionService from '../services/question.service';
import topicService from '../services/topic.service';
import groupService from '../services/group.service';
import classService from '../services/class.service';
import { submissionService } from '../services/app.service';

/* ── Token ── */
const ORANGE = '#F27125';

const toArray = (payload) => {
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
};

const normalizeId = (value) => {
    const n = Number(value);
    return Number.isNaN(n) ? String(value || '') : n;
};

const sameUser = (a, b) => normalizeId(a) === normalizeId(b);

/* ── Stat card ── */
function StatCard({ icon: Icon, label, value, color = ORANGE }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}18` }}>
                <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
            </div>
        </div>
    );
}

/* ── Info row ── */
function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-4 py-4 border-b border-gray-50 last:border-0">
            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-sm font-medium text-gray-900 truncate">{value || '—'}</p>
            </div>
        </div>
    );
}

/* ── Avatar section ── */
function AvatarSection({ user, onChangeAvatar, changingAvatar }) {
    const initials = (user?.fullName || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return (
        <div className="relative w-24 h-24 mx-auto">
            {user?.avatarURL ? (
                <img src={user.avatarURL} alt={user.fullName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
            ) : (
                <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-white shadow-lg text-xl font-bold text-white"
                    style={{ background: `linear-gradient(135deg,${ORANGE},#d96420)` }}>
                    {initials}
                </div>
            )}
            <button
                type="button"
                disabled={changingAvatar}
                onClick={onChangeAvatar}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#F27125] text-white flex items-center justify-center shadow-md hover:bg-[#d96420] disabled:opacity-60"
                title="Đổi ảnh đại diện"
            >
                {changingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
        </div>
    );
}

/* ══════════════════════════════════════════════════ */
export function UserProfilePage({ onNavigate, onLogout }) {
    const currentUser = authService.getCurrentUser();
    const role = currentUser?.role?.toLowerCase() || 'student';

    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: currentUser?.fullName ?? '',
        email: currentUser?.email ?? '',
        phone: currentUser?.phone ?? '',
        address: currentUser?.address ?? '',
        bio: currentUser?.bio ?? '',
    });
    const [savingProfile, setSavingProfile] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [profileUser, setProfileUser] = useState(currentUser);
    const [userSettings, setUserSettings] = useState(userSettingsService.getSettings());
    const [statsLoading, setStatsLoading] = useState(true);
    const [profileStats, setProfileStats] = useState([]);
    const avatarInputRef = useRef(null);

    // Change password
    const [showPwSection, setShowPwSection] = useState(false);
    const [pwData, setPwData] = useState({ current: '', newPw: '', confirm: '' });
    const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
    const [pwLoading, setPwLoading] = useState(false);

    /* ── Save profile ── */
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            // Gọi API (chỉ gửi các field backend hỗ trợ)
            if (currentUser?.userId) {
                await userService.updateUser(currentUser.userId, {
                    fullName: formData.fullName,
                    email: formData.email,
                });
            }
            // Lưu tất cả các field vào localStorage
            const stored = authService.getCurrentUser();
            const updated = {
                ...stored,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                bio: formData.bio,
            };
            // Lưu vào đúng storage (remember me hay không)
            updateStoredUser(updated);
            setEditing(false);
            toast.success('Cập nhật hồ sơ thành công!');
        } catch (err) {
            console.error(err);
            toast.error(err?.message || 'Không thể cập nhật hồ sơ. Vui lòng thử lại.');
        } finally {
            setSavingProfile(false);
        }
    };

    /* ── Change password ── */
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwData.newPw.length < 8) {
            toast.error('Mật khẩu mới phải có ít nhất 8 ký tự.');
            return;
        }
        if (pwData.newPw !== pwData.confirm) {
            toast.error('Mật khẩu mới không khớp.');
            return;
        }
        if (!pwData.current) {
            toast.error('Vui lòng nhập mật khẩu hiện tại.');
            return;
        }
        setPwLoading(true);
        try {
            await authService.changePassword(pwData.current, pwData.newPw, pwData.confirm);
            toast.success('Đổi mật khẩu thành công!');
            setPwData({ current: '', newPw: '', confirm: '' });
            setShowPwSection(false);
        } catch (err) {
            toast.error(err?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại.');
        } finally {
            setPwLoading(false);
        }
    };

    const handleSettingChange = (key, value) => {
        const next = userSettingsService.updateSettings({ [key]: value });
        setUserSettings(next);
        toast.success('Đã cập nhật cài đặt');
    };

    const updateStoredUser = (partial) => {
        const remembered = localStorage.getItem('rememberMe') === 'true';
        const storage = remembered ? localStorage : sessionStorage;
        const raw = storage.getItem('user');
        const existing = raw ? JSON.parse(raw) : {};
        const next = { ...existing, ...partial };
        storage.setItem('user', JSON.stringify(next));
        setProfileUser(next);
    };

    useEffect(() => {
        const loadProfileContext = async () => {
            try {
                const me = await userService.getMe();
                if (me) {
                    setProfileUser(me);
                    setFormData((previous) => ({
                        ...previous,
                        fullName: me.fullName ?? '',
                        email: me.email ?? '',
                        phone: me.phone ?? previous.phone ?? '',
                        address: me.address ?? previous.address ?? '',
                        bio: me.bio ?? previous.bio ?? '',
                    }));
                    updateStoredUser(me);
                }

                if (role === 'lecturer') {
                    const lecturerId = me?.userId || me?.id || currentUser?.userId || currentUser?.id;
                    const [classesRes, groupsRes, questionsRes, topicsRes, submissionsRes] = await Promise.all([
                        classService.getAllClasses({ lecturerId }),
                        groupService.getAllGroups({ lecturerId }),
                        questionService.getAllQuestions({ lecturerId }),
                        topicService.getAllTopics({ lecturerId }),
                        submissionService.getAllSubmissions({ limit: 100 })
                    ]);

                    const classes = toArray(classesRes);
                    const groups = toArray(groupsRes);
                    const questions = toArray(questionsRes);
                    const topics = toArray(topicsRes);
                    const allowedClassIds = new Set(classes.map((item) => Number(item.id)));
                    const submissions = toArray(submissionsRes).filter((item) =>
                        allowedClassIds.has(Number(item.group?.class?.id || item.group?.classId))
                    );

                    setProfileStats([
                        { icon: BookOpen, label: 'Lớp phụ trách', value: classes.length },
                        { icon: Users, label: 'Nhóm đang theo dõi', value: groups.length },
                        { icon: MessageSquare, label: 'Q&A chờ phản hồi', value: questions.filter((item) => String(item.status || '').toUpperCase() === 'WAITING_LECTURER').length },
                        { icon: Award, label: 'Topic đã duyệt', value: topics.filter((item) => String(item.status || '').toUpperCase() === 'APPROVED').length },
                    ]);
                } else if (role === 'manager') {
                    const [usersRes, topicsRes, questionsRes, submissionsRes] = await Promise.all([
                        userService.getAllUsers(),
                        topicService.getAllTopics(),
                        questionService.getAllQuestions(),
                        submissionService.getAllSubmissions({ limit: 100 })
                    ]);

                    const users = toArray(usersRes);
                    const topics = toArray(topicsRes);
                    const questions = toArray(questionsRes);
                    const submissions = toArray(submissionsRes);

                    setProfileStats([
                        { icon: Users, label: 'Tổng người dùng', value: users.length },
                        { icon: BookOpen, label: 'Topic đã duyệt', value: topics.filter((item) => String(item.status || '').toUpperCase() === 'APPROVED').length },
                        { icon: AlertCircle, label: 'Q&A chuyển cấp', value: questions.filter((item) => String(item.status || '').toUpperCase() === 'ESCALATED_TO_MANAGER').length },
                        { icon: Award, label: 'Bài nộp đã chấm', value: submissions.filter((item) => String(item.status || '').toUpperCase() === 'GRADED').length },
                    ]);
                } else if (role === 'student') {
                    const studentId = me?.userId || me?.id || currentUser?.userId || currentUser?.id;
                    const [groupsRes, submissionsRes, topicsRes] = await Promise.all([
                        groupService.getAllGroups(),
                        submissionService.getAllSubmissions({ limit: 100 }),
                        topicService.getAllTopics(),
                    ]);

                    const groups = toArray(groupsRes);
                    const submissions = toArray(submissionsRes);
                    const topics = toArray(topicsRes);

                    const myGroups = groups.filter((group) =>
                        Array.isArray(group.members) && group.members.some((member) => {
                            const memberId = member.id || member.userId || member.studentId || member.GroupMember?.studentId;
                            return sameUser(memberId, studentId);
                        })
                    );

                    const classCount = new Set(
                        myGroups
                            .map((group) => group.classId || group.class?.id)
                            .filter((value) => value != null)
                            .map((value) => normalizeId(value))
                    ).size;

                    const teamSize = myGroups[0]?.members?.length || 0;

                    const mySubmissions = submissions.filter((item) => {
                        const submitterId = item.submitter?.id || item.submitter?.userId || item.submitterId;
                        return sameUser(submitterId, studentId);
                    });

                    const gradedSubmissions = mySubmissions.filter((item) => String(item.status || '').toUpperCase() === 'GRADED' && !Number.isNaN(Number(item.grade)));
                    const averageGrade = gradedSubmissions.length > 0
                        ? (gradedSubmissions.reduce((sum, item) => sum + Number(item.grade), 0) / gradedSubmissions.length).toFixed(1)
                        : '--';

                    const completedTopics = topics.filter((item) => {
                        const proposerId = item.proposer?.id || item.proposer?.userId || item.proposedBy || item.createdBy;
                        const status = String(item.status || '').toUpperCase();
                        return sameUser(proposerId, studentId) && (status === 'APPROVED' || status === 'ACTIVE');
                    }).length;

                    setProfileStats([
                        { icon: BookOpen, label: 'Môn đã đăng ký', value: classCount },
                        { icon: Users, label: 'Thành viên nhóm', value: teamSize },
                        { icon: Star, label: 'Điểm bài tập', value: averageGrade },
                        { icon: Award, label: 'Đồ án hoàn thành', value: completedTopics },
                    ]);
                } else {
                    setProfileStats(cfg.stats);
                }
            } catch (error) {
                console.error('Failed to load profile context:', error);
                setProfileStats(cfg.stats);
            } finally {
                setStatsLoading(false);
            }
        };

        loadProfileContext();
    }, [role]);

    const handlePickAvatar = () => {
        if (!cloudinaryStorageService.isEnabled()) {
            toast.error('Cloudinary chưa được cấu hình');
            return;
        }
        avatarInputRef.current?.click();
    };

    const handleAvatarChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file || !currentUser?.userId) return;

        setAvatarUploading(true);
        try {
            const uploaded = await cloudinaryStorageService.uploadFile(file, 'avatars');
            await userService.updateUser(currentUser.userId, { avatarURL: uploaded.url });
            updateStoredUser({ avatarURL: uploaded.url, avatarUrl: uploaded.url, avatar_url: uploaded.url });
            toast.success('Cập nhật ảnh đại diện thành công');
        } catch (err) {
            console.error(err);
            toast.error(err?.message || 'Không thể cập nhật ảnh đại diện');
        } finally {
            setAvatarUploading(false);
            if (avatarInputRef.current) avatarInputRef.current.value = '';
        }
    };

    /* Role-specific config */
    const roleConfig = {
        student: {
            color: '#3b82f6',
            label: 'Sinh viên',
            icon: GraduationCap,
            stats: [
                { icon: BookOpen, label: 'Môn đã đăng ký', value: '12' },
                { icon: Users, label: 'Thành viên nhóm', value: '5' },
                { icon: Star, label: 'Điểm bài tập', value: '8.5' },
                { icon: Award, label: 'Đồ án hoàn thành', value: '3' },
            ],
        },
        lecturer: {
            color: '#8b5cf6',
            label: 'Giảng viên',
            icon: Briefcase,
            stats: [
                { icon: BookOpen, label: 'Môn phụ trách', value: '4' },
                { icon: Users, label: 'Tổng sinh viên', value: '128' },
                { icon: Star, label: 'Đánh giá trung bình', value: '4.8' },
                { icon: Award, label: 'Đề tài đã duyệt', value: '24' },
            ],
        },
        manager: {
            color: ORANGE,
            label: 'Manager',
            icon: Shield,
            stats: [
                { icon: Users, label: 'Tổng người dùng', value: '2,400+' },
                { icon: BookOpen, label: 'Đề tài hoạt động', value: '76' },
                { icon: Star, label: 'Thời gian ổn định', value: '99.9%' },
                { icon: Award, label: 'Lượt duyệt chờ xử lý', value: '12' },
            ],
        },
    };

    const cfg = roleConfig[role] || roleConfig.student;
    const RoleIcon = cfg.icon;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <button
                    onClick={() => onNavigate && onNavigate(role === 'manager' ? 'admin' : role === 'lecturer' ? 'lecturer' : 'group')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-sm group">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Quay lại bảng điều khiển
                </button>
                <button
                    onClick={onLogout}
                    className="px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition">
                    Đăng xuất
                </button>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Left column: identity card ── */}
                    <div className="lg:col-span-1 space-y-5">
                        {/* Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Cover */}
                            <div className="h-24 relative"
                                style={{ background: `linear-gradient(135deg,${cfg.color}22,${cfg.color}10)` }}>
                                <div className="absolute inset-0 opacity-10"
                                    style={{ backgroundImage: 'radial-gradient(circle at 20% 50%,rgba(255,255,255,0.8) 0%,transparent 50%)' }} />
                            </div>
                            {/* Avatar */}
                            <div className="px-6 pb-6">
                                <div className="-mt-12 mb-4">
                                    <AvatarSection user={profileUser} onChangeAvatar={handlePickAvatar} changingAvatar={avatarUploading} />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-lg font-bold text-gray-900">{profileUser?.fullName}</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">{profileUser?.email}</p>
                                    {/* Role badge */}
                                    <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-semibold"
                                        style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                                        <RoleIcon className="w-3.5 h-3.5" />
                                        {cfg.label}
                                    </div>
                                </div>

                                <div className="mt-5 space-y-0.5">
                                        <InfoRow icon={IdCard} label={role === 'lecturer' ? 'Mã giảng viên' : 'Mã sinh viên'} value={profileUser?.studentCode} />
                                        <InfoRow icon={Mail} label="Email" value={profileUser?.email} />
                                        <InfoRow icon={Calendar} label="Tham gia từ" value={
                                        profileUser?.createdAt
                                            ? new Date(profileUser.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' })
                                            : 'Không có'
                                    } />
                                </div>
                            </div>
                        </div>

                        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

                        {/* Quick actions */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Thao tác nhanh</p>
                            <div className="space-y-1">
                                {[
                                    { label: 'Đổi mật khẩu', icon: Lock, action: () => setShowPwSection(s => !s) },
                                    ...(role === 'manager' ? [{ label: 'Quản lý người dùng', icon: Users, action: () => onNavigate('admin') }] : []),
                                ].map((item, i) => (
                                    <button key={i} onClick={item.action}
                                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition group">
                                        <div className="flex items-center gap-3">
                                            <item.icon className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Right columns ── */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            {(profileStats.length > 0 ? profileStats : cfg.stats).map((s, i) => (
                                <StatCard key={i} icon={s.icon} label={s.label} value={statsLoading ? '...' : s.value} color={cfg.color} />
                            ))}
                        </div>

                        {/* Edit profile card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
                                <div>
                                    <h3 className="font-bold text-gray-900">Thông tin hồ sơ</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Cập nhật thông tin cá nhân</p>
                                </div>
                                {!editing ? (
                                    <button onClick={() => setEditing(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition"
                                        style={{ background: ORANGE }}>
                                        <Edit3 className="w-3.5 h-3.5" />Chỉnh sửa
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setEditing(false)}
                                            className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <button form="profile-form" type="submit" disabled={savingProfile}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition disabled:opacity-50"
                                            style={{ background: ORANGE }}>
                                            {savingProfile
                                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Đang lưu...</>
                                                : <><Save className="w-3.5 h-3.5" />Lưu</>
                                            }
                                        </button>
                                    </div>
                                )}
                            </div>

                            <form id="profile-form" onSubmit={handleSaveProfile} className="px-6 py-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Họ và tên
                                        </label>
                                        {editing ? (
                                            <input type="text" value={formData.fullName}
                                                onChange={e => setFormData(f => ({ ...f, fullName: e.target.value }))}
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F27125] text-sm" />
                                        ) : (
                                            <p className="text-sm font-medium text-gray-900 py-2.5">{formData.fullName || '—'}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Địa chỉ email
                                        </label>
                                        {editing ? (
                                            <input type="email" value={formData.email}
                                                onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F27125] text-sm" />
                                        ) : (
                                            <p className="text-sm font-medium text-gray-900 py-2.5">{formData.email || '—'}</p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Số điện thoại
                                        </label>
                                        {editing ? (
                                            <input type="tel" value={formData.phone} placeholder="+84 xxx xxx xxx"
                                                onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F27125] text-sm" />
                                        ) : (
                                            <p className="text-sm font-medium text-gray-900 py-2.5">{formData.phone || '—'}</p>
                                        )}
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Địa điểm
                                        </label>
                                        {editing ? (
                                            <input type="text" value={formData.address} placeholder="Thành phố Hồ Chí Minh, Việt Nam"
                                                onChange={e => setFormData(f => ({ ...f, address: e.target.value }))}
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F27125] text-sm" />
                                        ) : (
                                            <p className="text-sm font-medium text-gray-900 py-2.5">{formData.address || '—'}</p>
                                        )}
                                    </div>

                                    {/* Bio */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Giới thiệu
                                        </label>
                                        {editing ? (
                                            <textarea value={formData.bio} rows={3} placeholder="Giới thiệu ngắn về bạn..."
                                                onChange={e => setFormData(f => ({ ...f, bio: e.target.value }))}
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F27125] text-sm resize-none" />
                                        ) : (
                                            <p className="text-sm text-gray-600 py-2.5 leading-relaxed">{formData.bio || 'Chưa có giới thiệu.'}</p>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Change Password section */}
                        {showPwSection && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
                                    <div>
                                        <h3 className="font-bold text-gray-900">Đổi mật khẩu</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">Sử dụng mật khẩu mạnh và duy nhất</p>
                                    </div>
                                    <button onClick={() => setShowPwSection(false)}
                                        className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleChangePassword} className="px-6 py-5 space-y-4">
                                    {[
                                        { key: 'current', label: 'Mật khẩu hiện tại', placeholder: 'Nhập mật khẩu hiện tại' },
                                        { key: 'newPw', label: 'Mật khẩu mới', placeholder: 'Tối thiểu 8 ký tự' },
                                        { key: 'confirm', label: 'Xác nhận mật khẩu mới', placeholder: 'Nhập lại mật khẩu mới' },
                                    ].map(({ key, label, placeholder }) => (
                                        <div key={key}>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                                            <div className="relative">
                                                <input
                                                    type={showPw[key] ? 'text' : 'password'}
                                                    value={pwData[key]}
                                                    onChange={e => setPwData(p => ({ ...p, [key]: e.target.value }))}
                                                    placeholder={placeholder}
                                                    required
                                                    className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F27125] text-sm" />
                                                <button type="button"
                                                    onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                    {showPw[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Password match hint */}
                                    {pwData.newPw && pwData.confirm && pwData.newPw !== pwData.confirm && (
                                        <p className="text-xs text-red-500 -mt-2">Mật khẩu không khớp.</p>
                                    )}
                                    <div className="flex justify-end pt-2">
                                        <button type="submit" disabled={pwLoading}
                                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
                                            style={{ background: ORANGE }}>
                                            {pwLoading
                                                ? <><Loader2 className="w-4 h-4 animate-spin" />Đang cập nhật...</>
                                                : <><CheckCircle className="w-4 h-4" />Cập nhật mật khẩu</>
                                            }
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Cài đặt người dùng */}
                        {role === 'manager' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="px-6 py-5 border-b border-gray-50">
                                <h3 className="font-bold text-gray-900">Cài đặt người dùng</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Cấu hình trợ lý AI và hành vi tải tệp lên</p>
                            </div>
                            <div className="px-6 py-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Bật tải lên Cloudinary</p>
                                        <p className="text-xs text-gray-500">Tải ảnh/tệp trực tiếp lên Cloudinary khi đã cấu hình</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={userSettings.enableCloudinaryUpload}
                                        onChange={(e) => handleSettingChange('enableCloudinaryUpload', e.target.checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Bật trợ lý AI</p>
                                        <p className="text-xs text-gray-500">Sử dụng API AI thật khi có khóa</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={userSettings.enableAIAssistant}
                                        onChange={(e) => handleSettingChange('enableAIAssistant', e.target.checked)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mô hình AI</label>
                                    <select
                                        value={userSettings.aiModel}
                                        onChange={(e) => handleSettingChange('aiModel', e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F27125] text-sm"
                                    >
                                        <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                                        <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
