import { RequestCard } from './RequestCard';
import { Clock } from 'lucide-react';

const topicRequests = [
  {
    id: 'topic-1',
    type: 'topic',
    title: 'E-commerce AI Platform',
    author: 'Dr. Tran Minh',
    authorRole: 'Lecturer',
    semester: 'Spring 2026',
    techStack: ['React', 'Node.js', 'MongoDB', 'TensorFlow'],
    description:
      'An intelligent e-commerce platform that uses machine learning to provide personalized product recommendations and dynamic pricing.',
    submittedDate: '2 days ago',
    status: 'pending',
  },
  {
    id: 'topic-2',
    type: 'topic',
    title: 'Smart Campus IoT System',
    author: 'Dr. Nguyen Van B',
    authorRole: 'Lecturer',
    semester: 'Spring 2026',
    techStack: ['Java Spring', 'MySQL', 'MQTT', 'React'],
    description:
      'IoT-based system for monitoring and managing campus facilities including lighting, temperature, and security systems.',
    submittedDate: '1 day ago',
    status: 'pending',
  },
];

const groupRequests = [
  {
    id: 'group-1',
    type: 'group',
    groupName: 'Group 04',
    topicTitle: 'Hotel Management System',
    members: [
      {
        name: 'Nguyen Van A',
        studentId: 'SE150001',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member1',
      },
      {
        name: 'Tran Thi B',
        studentId: 'SE150002',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member2',
      },
      {
        name: 'Le Van C',
        studentId: 'SE150003',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member3',
      },
      {
        name: 'Pham Thi D',
        studentId: 'SE150004',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member4',
      },
      {
        name: 'Hoang Van E',
        studentId: 'SE150005',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member5',
      },
    ],
    submittedDate: '3 hours ago',
    status: 'pending',
  },
  {
    id: 'group-2',
    type: 'group',
    groupName: 'Group 07',
    topicTitle: 'E-commerce AI Platform',
    members: [
      {
        name: 'Do Van F',
        studentId: 'SE150010',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member6',
      },
      {
        name: 'Bui Thi G',
        studentId: 'SE150011',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member7',
      },
      {
        name: 'Vo Van H',
        studentId: 'SE150012',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member8',
      },
      {
        name: 'Dang Thi I',
        studentId: 'SE150013',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member9',
      },
    ],
    submittedDate: '1 day ago',
    status: 'pending',
  },
];

export function ManagementView({ channel }) {
  const isTopicChannel = channel === '#topic-approvals';
  const requests = isTopicChannel ? topicRequests : groupRequests;
  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl">{channel}</h1>
              <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {pendingCount} Pending Request{pendingCount !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {isTopicChannel
                ? 'Review and approve project topic submissions'
                : 'Manage group registrations and topic assignments'}
            </p>
          </div>
        </div>
      </div>

      {/* Request Feed */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}

          {requests.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg p-8 border border-gray-200">
                <p className="text-gray-600">No pending requests at the moment</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


