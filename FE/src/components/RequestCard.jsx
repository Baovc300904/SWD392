import { Check, X, Calendar, User, Users, FileText } from 'lucide-react';

  type: 'topic';
  title;
  author;
  authorRole;
  semester;
  techStack;
  description;
  submittedDate;
  status: 'pending' | 'approved' | 'rejected';
};

  type: 'group';
  groupName;
  topicTitle;
  members: Array<{
    name;
    studentId;
    avatar;
  }>;
  submittedDate;
  status: 'pending' | 'approved' | 'rejected';
};

};

export function RequestCard({ request }) {
  if (request.type === 'topic') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
        {/* Status Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">{request.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <User className="w-3 h-3 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {request.authorRole}
                </span>
              </div>
            </div>
          </div>
          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
            Pending Review
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Calendar className="w-3 h-3" />
              Semester
            </div>
            <p className="text-sm font-medium text-gray-900">{request.semester}</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <FileText className="w-3 h-3" />
              Submitted
            </div>
            <p className="text-sm font-medium text-gray-900">{request.submittedDate}</p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Tech Stack:</p>
          <div className="flex flex-wrap gap-2">
            {request.techStack.map((tech, index) => (
              <span
                key={index}
                className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Description:</p>
          <p className="text-sm text-gray-700 leading-relaxed">{request.description}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition font-semibold">
            <Check className="w-5 h-5" />
            Approve
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition font-semibold">
            <X className="w-5 h-5" />
            Reject
          </button>
        </div>
      </div>
    );
  }

  // Group Request Card
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-purple-100 p-2 rounded">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">
              {request.groupName} Requesting Topic
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Topic: <span className="font-semibold">{request.topicTitle}</span>
            </p>
          </div>
        </div>
        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
          Pending Review
        </span>
      </div>

      {/* Submitted Date */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
          <Calendar className="w-3 h-3" />
          Submitted
        </div>
        <p className="text-sm font-medium text-gray-900">{request.submittedDate}</p>
      </div>

      {/* Members */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
          <Users className="w-3 h-3" />
          Team Members ({request.members.length})
        </p>
        <div className="space-y-2">
          {request.members.map((member, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                <p className="text-xs text-gray-500">{member.studentId}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action */}
      <div className="pt-4 border-t border-gray-200">
        <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-semibold">
          <Check className="w-5 h-5" />
          Confirm Assignment
        </button>
      </div>
    </div>
  );
}


