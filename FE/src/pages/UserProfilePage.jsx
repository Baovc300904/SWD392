import { useState } from 'react';
import {
    ArrowLeft, User, Mail, IdCard, Phone, MapPin, Calendar,
    Edit3, Save, X, Camera, Shield, BookOpen, Users, Star,
    ChevronRight, Lock, Eye, EyeOff, CheckCircle, GraduationCap,
    Briefcase, Award, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import authService from '../services/auth.service';
import userService from '../services/user.service';

/* ── Token ── */
const ORANGE = '#F27125';

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
function AvatarSection({ user }) {
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
        </div>
    );
}

/* ══════════════════════════════════════════════════ */
export function UserProfilePage({ onNavigate, onLogout }) {
    const currentUser = authService.getCurrentUser();
    const role = currentUser?.role?.toLowerCase() || 'student';

    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: currentUser?.fullName || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        address: currentUser?.address || '',
        bio: currentUser?.bio || '',
    });
    const [savingProfile, setSavingProfile] = useState(false);

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
            const isRemembered = localStorage.getItem('rememberMe') === 'true';
            const storage = isRemembered ? localStorage : sessionStorage;
            storage.setItem('user', JSON.stringify(updated));
            setEditing(false);
            toast.success('Profile updated successfully!');
        } catch (err) {
            console.error(err);
            toast.error(err?.message || 'Failed to update profile. Please try again.');
        } finally {
            setSavingProfile(false);
        }
    };

    /* ── Change password ── */
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwData.newPw.length < 8) {
            toast.error('New password must be at least 8 characters.');
            return;
        }
        if (pwData.newPw !== pwData.confirm) {
            toast.error('New passwords do not match.');
            return;
        }
        if (!pwData.current) {
            toast.error('Please enter your current password.');
            return;
        }
        setPwLoading(true);
        try {
            await authService.changePassword(pwData.current, pwData.newPw, pwData.confirm);
            toast.success('Password changed successfully!');
            setPwData({ current: '', newPw: '', confirm: '' });
            setShowPwSection(false);
        } catch (err) {
            toast.error(err?.message || 'Failed to change password. Please check your current password.');
        } finally {
            setPwLoading(false);
        }
    };

    /* Role-specific config */
    const roleConfig = {
        student: {
            color: '#3b82f6',
            label: 'Student',
            icon: GraduationCap,
            stats: [
                { icon: BookOpen, label: 'Courses Enrolled', value: '12' },
                { icon: Users, label: 'Group Members', value: '5' },
                { icon: Star, label: 'Assignment Score', value: '8.5' },
                { icon: Award, label: 'Projects Done', value: '3' },
            ],
        },
        lecturer: {
            color: '#8b5cf6',
            label: 'Lecturer',
            icon: Briefcase,
            stats: [
                { icon: BookOpen, label: 'Courses Teaching', value: '4' },
                { icon: Users, label: 'Total Students', value: '128' },
                { icon: Star, label: 'Avg. Rating', value: '4.8' },
                { icon: Award, label: 'Topics Approved', value: '24' },
            ],
        },
        admin: {
            color: ORANGE,
            label: 'Administrator',
            icon: Shield,
            stats: [
                { icon: Users, label: 'Total Users', value: '2,400+' },
                { icon: BookOpen, label: 'Active Topics', value: '76' },
                { icon: Star, label: 'Uptime', value: '99.9%' },
                { icon: Award, label: 'Pending Reviews', value: '12' },
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
                    onClick={() => onNavigate && onNavigate(role === 'admin' ? 'admin' : role === 'lecturer' ? 'lecturer' : 'group')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-sm group">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Dashboard
                </button>
                <button
                    onClick={onLogout}
                    className="px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition">
                    Log out
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
                                    <AvatarSection user={currentUser} />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-lg font-bold text-gray-900">{currentUser?.fullName}</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">{currentUser?.email}</p>
                                    {/* Role badge */}
                                    <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-semibold"
                                        style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                                        <RoleIcon className="w-3.5 h-3.5" />
                                        {cfg.label}
                                    </div>
                                </div>

                                <div className="mt-5 space-y-0.5">
                                    <InfoRow icon={IdCard} label="Student Code" value={currentUser?.studentCode} />
                                    <InfoRow icon={Mail} label="Email" value={currentUser?.email} />
                                    <InfoRow icon={Calendar} label="Member Since" value={
                                        currentUser?.createdAt
                                            ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                                            : 'N/A'
                                    } />
                                </div>
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Quick Actions</p>
                            <div className="space-y-1">
                                {[
                                    { label: 'Change Password', icon: Lock, action: () => setShowPwSection(s => !s) },
                                    ...(role === 'admin' ? [{ label: 'User Management', icon: Users, action: () => onNavigate('admin') }] : []),
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
                            {cfg.stats.map((s, i) => (
                                <StatCard key={i} icon={s.icon} label={s.label} value={s.value} color={cfg.color} />
                            ))}
                        </div>

                        {/* Edit profile card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
                                <div>
                                    <h3 className="font-bold text-gray-900">Profile Information</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Update your personal details</p>
                                </div>
                                {!editing ? (
                                    <button onClick={() => setEditing(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition"
                                        style={{ background: ORANGE }}>
                                        <Edit3 className="w-3.5 h-3.5" />Edit
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
                                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving...</>
                                                : <><Save className="w-3.5 h-3.5" />Save</>
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
                                            Full Name
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
                                            Email Address
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
                                            Phone Number
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
                                            Location
                                        </label>
                                        {editing ? (
                                            <input type="text" value={formData.address} placeholder="Ho Chi Minh City, Vietnam"
                                                onChange={e => setFormData(f => ({ ...f, address: e.target.value }))}
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F27125] text-sm" />
                                        ) : (
                                            <p className="text-sm font-medium text-gray-900 py-2.5">{formData.address || '—'}</p>
                                        )}
                                    </div>

                                    {/* Bio */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Bio
                                        </label>
                                        {editing ? (
                                            <textarea value={formData.bio} rows={3} placeholder="Tell us a bit about yourself..."
                                                onChange={e => setFormData(f => ({ ...f, bio: e.target.value }))}
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F27125] text-sm resize-none" />
                                        ) : (
                                            <p className="text-sm text-gray-600 py-2.5 leading-relaxed">{formData.bio || 'No bio added yet.'}</p>
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
                                        <h3 className="font-bold text-gray-900">Change Password</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">Use a strong, unique password</p>
                                    </div>
                                    <button onClick={() => setShowPwSection(false)}
                                        className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleChangePassword} className="px-6 py-5 space-y-4">
                                    {[
                                        { key: 'current', label: 'Current Password', placeholder: 'Your current password' },
                                        { key: 'newPw', label: 'New Password', placeholder: 'Min. 8 characters' },
                                        { key: 'confirm', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
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
                                        <p className="text-xs text-red-500 -mt-2">Passwords do not match.</p>
                                    )}
                                    <div className="flex justify-end pt-2">
                                        <button type="submit" disabled={pwLoading}
                                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
                                            style={{ background: ORANGE }}>
                                            {pwLoading
                                                ? <><Loader2 className="w-4 h-4 animate-spin" />Updating...</>
                                                : <><CheckCircle className="w-4 h-4" />Update Password</>
                                            }
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
