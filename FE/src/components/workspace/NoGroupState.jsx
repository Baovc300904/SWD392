import { useNavigate } from 'react-router-dom';
import { Users, Link as LinkIcon, Search, Sparkles, ArrowRight } from 'lucide-react';

export function NoGroupState() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-[#F27125] to-[#d96420] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Users className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          You're not in a group yet
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
          Join a group to collaborate with your team, access project resources, and communicate with members.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={() => navigate('/join-group')}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-[#F27125] hover:bg-[#d96420] text-white font-semibold rounded-xl transition shadow-lg hover:shadow-xl"
          >
            <LinkIcon className="w-5 h-5" />
            Join with Invite Link
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => navigate('/join-group')}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl transition border-2 border-gray-300 hover:border-[#F27125]"
          >
            <Search className="w-5 h-5" />
            Browse Available Groups
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-12">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-[#F27125]" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Collaborate</h3>
            <p className="text-sm text-gray-600">
              Work together on projects with your team members
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Get Support</h3>
            <p className="text-sm text-gray-600">
              Access AI mentor and get help from lecturers
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Share Resources</h3>
            <p className="text-sm text-gray-600">
              Share files, documents and useful links
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-orange-50 rounded-xl border border-orange-200">
          <p className="text-sm text-gray-700">
            💡 <strong>Need help?</strong> Ask your team leader or coordinator for an invite link, or browse available groups to find one that matches your project.
          </p>
        </div>
      </div>
    </div>
  );
}
