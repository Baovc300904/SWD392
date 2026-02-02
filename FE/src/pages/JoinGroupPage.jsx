import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Link as LinkIcon, Search, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';

export function JoinGroupPage() {
  const [inviteLink, setInviteLink] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const navigate = useNavigate();

  // Available groups to browse (demo data)
  const availableGroups = [
    {
      id: 'g1',
      name: 'SWP391 - Group 04',
      course: 'Software Project',
      members: 5,
      maxMembers: 6,
      description: 'Building an e-commerce platform with Spring Boot & React',
      tags: ['Spring Boot', 'React', 'PostgreSQL'],
      lecturer: 'Dr. Tran Minh',
      color: 'blue'
    },
    {
      id: 'g2',
      name: 'SWP391 - Group 07',
      course: 'Software Project',
      members: 4,
      maxMembers: 6,
      description: 'Healthcare management system with appointment scheduling',
      tags: ['Java', 'Angular', 'MySQL'],
      lecturer: 'Dr. Nguyen Thi Lan',
      color: 'green'
    },
    {
      id: 'g3',
      name: 'SWD392 - Group 12',
      course: 'Software Design',
      members: 3,
      maxMembers: 5,
      description: 'Mobile learning app for students with gamification',
      tags: ['React Native', 'Firebase', 'Node.js'],
      lecturer: 'Mr. Le Van Hieu',
      color: 'purple'
    }
  ];

  const handleJoinWithLink = () => {
    if (!inviteLink.trim()) return;
    
    setIsValidating(true);
    
    // Simulate validation
    setTimeout(() => {
      setIsValidating(false);
      // Extract invite code from link
      const inviteCode = inviteLink.split('/').pop();
      navigate(`/join/${inviteCode}`);
    }, 1000);
  };

  const handleBrowseGroup = (groupId) => {
    // In real app, this would generate or use existing invite code
    navigate(`/join/demo-${groupId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-[#F27125] to-[#d96420] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Join a Group</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enter an invite link from your team or browse available groups to join
            </p>
          </div>

          {/* Join with Link Section */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-[#F27125]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Join with Invite Link</h2>
                  <p className="text-sm text-gray-600">Have an invitation from your team?</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste invite link
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={inviteLink}
                      onChange={(e) => setInviteLink(e.target.value)}
                      placeholder="https://swp-hub.com/join/abc123xyz"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0054a6] focus:border-transparent outline-none transition"
                      onKeyPress={(e) => e.key === 'Enter' && handleJoinWithLink()}
                    />
                    <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <button
                  onClick={handleJoinWithLink}
                  disabled={!inviteLink.trim() || isValidating}
                  className="w-full bg-[#F27125] hover:bg-[#d96420] text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isValidating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Validating...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              {/* Example Link Format */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Example invite link format:</p>
                <div className="bg-gray-50 rounded-lg px-4 py-2 font-mono text-sm text-gray-700">
                  https://swp-hub.com/join/[invite-code]
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 max-w-2xl mx-auto mb-12">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm font-medium text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Browse Available Groups */}
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Browse Available Groups</h2>
                <p className="text-sm text-gray-600">Find and join groups that match your interests</p>
              </div>
            </div>

            <div className="grid gap-4">
              {availableGroups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 border border-gray-200 group cursor-pointer"
                  onClick={() => handleBrowseGroup(group.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Group Icon */}
                    <div className={`w-14 h-14 bg-gradient-to-br from-${group.color}-500 to-${group.color}-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <Users className="w-7 h-7 text-white" />
                    </div>

                    {/* Group Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{group.name}</h3>
                          <p className="text-sm text-gray-600">{group.course} • {group.lecturer}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                            {group.members}/{group.maxMembers} members
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3">{group.description}</p>

                      {/* Tags */}
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        {group.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Action */}
                      <div className="flex items-center gap-2 text-[#F27125] font-semibold group-hover:gap-3 transition-all">
                        <span>View details</span>
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className="max-w-2xl mx-auto mt-12">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#F27125] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Need help finding your team?</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Ask your team leader or project coordinator for an invite link. Each group has a unique invitation code that you can use to join.
                  </p>
                  <button className="text-sm font-semibold text-[#F27125] hover:underline">
                    Contact support →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
