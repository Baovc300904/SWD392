import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, CheckCircle, Calendar, BookOpen, User, Shield, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';

export function GroupInvitePage() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [groupData, setGroupData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate API call to validate invite code and fetch group data
    const validateInvite = async () => {
      setIsLoading(true);
      setError(null);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Demo: Check if invite code is valid
      if (inviteCode === 'invalid' || inviteCode === 'expired') {
        setError(inviteCode === 'invalid' ? 'Invalid invite link' : 'This invite link has expired');
        setIsLoading(false);
        return;
      }

      // Mock group data based on invite code
      const mockGroupData = {
        id: 'grp-001',
        name: 'SWP391 - Group 04',
        course: 'Software Project (SWP391)',
        semester: 'Spring 2026',
        description: 'Building an e-commerce platform with modern web technologies. We focus on scalable architecture, clean code, and agile methodologies.',
        project: 'E-Commerce Platform',
        members: [
          { id: 1, name: 'Nguyen Van A', role: 'Team Leader', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member1' },
          { id: 2, name: 'Tran Thi B', role: 'Backend Dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member2' },
          { id: 3, name: 'Le Van C', role: 'Frontend Dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member3' },
          { id: 4, name: 'Pham Thi D', role: 'Designer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member4' },
        ],
        maxMembers: 6,
        technologies: ['Spring Boot', 'React', 'PostgreSQL', 'Docker', 'AWS'],
        lecturer: {
          name: 'Dr. Tran Minh',
          email: 'tran.minh@university.edu',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lecturer1'
        },
        invitedBy: {
          name: 'Nguyen Van A',
          role: 'Team Leader'
        },
        createdAt: '2026-01-15',
        inviteCode: inviteCode
      };

      setGroupData(mockGroupData);
      setIsLoading(false);
    };

    validateInvite();
  }, [inviteCode]);

  const handleJoinGroup = async () => {
    if (!user) {
      // Save invite code and redirect to login
      localStorage.setItem('pendingInvite', inviteCode);
      navigate('/login', { state: { from: `/join/${inviteCode}` } });
      return;
    }

    setIsJoining(true);

    // Simulate API call to join group
    await new Promise(resolve => setTimeout(resolve, 2000));

    // TODO: Replace with actual API call
    // const response = await api.joinGroup(inviteCode);
    
    // Update user with groupId (simulate successful join)
    // In real app, this should come from API response
    const updatedUser = { ...user, groupId: groupData.id, groupName: groupData.name };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    setIsJoining(false);
    
    // Force reload to update context and redirect to workspace
    window.location.href = '/workspace';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 border-4 border-[#0054a6] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Validating invite...</h2>
            <p className="text-gray-600">Please wait while we check the invitation</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
            <p className="text-gray-600 mb-8">This invitation link is not valid or has expired.</p>
            <button
              onClick={() => navigate('/join-group')}
              className="px-6 py-3 bg-[#F27125] text-white font-semibold rounded-xl hover:bg-[#d96420] transition"
            >
              Browse Available Groups
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Success Banner */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">You've been invited!</h3>
                <p className="text-sm text-gray-700">
                  {groupData.invitedBy.name} ({groupData.invitedBy.role}) invited you to join their group
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Group Header */}
            <div className="bg-gradient-to-br from-[#F27125] to-[#d96420] p-8 text-white">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{groupData.name}</h1>
                  <p className="text-orange-100 text-lg mb-3">{groupData.project}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{groupData.course}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{groupData.semester}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">About this group</h3>
                <p className="text-gray-700 leading-relaxed">{groupData.description}</p>
              </div>

              {/* Technologies */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {groupData.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Current Members */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Current Members ({groupData.members.length}/{groupData.maxMembers})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {groupData.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"
                    >
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-lg"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lecturer */}
              <div className="mb-8 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Supervised by</p>
                    <p className="font-bold text-gray-900">{groupData.lecturer.name}</p>
                    <p className="text-sm text-gray-600">{groupData.lecturer.email}</p>
                  </div>
                </div>
              </div>

              {/* Join Button */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={handleJoinGroup}
                  disabled={isJoining}
                  className="w-full bg-[#F27125] hover:bg-[#d96420] text-white font-bold py-4 px-6 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Joining group...
                    </>
                  ) : (
                    <>
                      Join {groupData.name}
                      <ArrowRight className="w-6 h-6" />
                    </>
                  )}
                </button>
                
                {!user && (
                  <p className="text-sm text-gray-600 text-center mt-4">
                    You'll be redirected to login before joining
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Invite Link Info */}
          <div className="mt-8 bg-orange-50 border border-orange-200 rounded-xl p-6">
            <h4 className="font-bold text-gray-900 mb-2">📋 Invitation Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Invite Code:</span>
                <span className="font-mono font-semibold text-gray-900">{inviteCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Full Link:</span>
                <span className="font-mono text-xs text-gray-700 truncate max-w-xs">
                  https://swp-hub.com/join/{inviteCode}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
