import { FolderOpen, File, FileText, Image, Download, MoreVertical } from 'lucide-react';

export function ResourcesView() {
  const folders = [
    {
      id: 1,
      name: 'Project Documents',
      files: 12,
      updated: '2 days ago',
    },
    {
      id: 2,
      name: 'Design Assets',
      files: 28,
      updated: '3 hours ago',
    },
    {
      id: 3,
      name: 'Meeting Notes',
      files: 8,
      updated: '1 week ago',
    },
  ];

  const recentFiles = [
    {
      id: 1,
      name: 'Project Proposal.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadedBy: 'Nguyen Van A',
      uploadedAt: '2 hours ago',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member1',
    },
    {
      id: 2,
      name: 'Database Schema.png',
      type: 'image',
      size: '1.2 MB',
      uploadedBy: 'Le Van C',
      uploadedAt: '5 hours ago',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member3',
    },
    {
      id: 3,
      name: 'API Documentation.md',
      type: 'markdown',
      size: '124 KB',
      uploadedBy: 'Tran Thi B',
      uploadedAt: '1 day ago',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member2',
    },
    {
      id: 4,
      name: 'Landing Page Mockup.fig',
      type: 'figma',
      size: '3.8 MB',
      uploadedBy: 'Pham Thi D',
      uploadedAt: '2 days ago',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member4',
    },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'image':
        return <Image className="w-5 h-5 text-purple-500" />;
      case 'markdown':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'figma':
        return <File className="w-5 h-5 text-pink-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900"># 📂 resources</h1>
            <p className="text-sm text-gray-600 mt-0.5">Shared files and documents</p>
          </div>
          <button className="bg-[#F27125] hover:bg-[#d96420] text-white px-4 py-2 rounded-lg font-medium transition">
            Upload File
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Folders */}
        <div>
          <h2 className="font-bold text-gray-900 mb-3">Folders</h2>
          <div className="grid grid-cols-3 gap-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-[#F27125] hover:shadow-md cursor-pointer transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {folder.name}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{folder.files} files</span>
                  <span>Updated {folder.updated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Files */}
        <div>
          <h2 className="font-bold text-gray-900 mb-3">Recent Files</h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                          {getFileIcon(file.type)}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{file.size}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={file.avatar}
                          alt={file.uploadedBy}
                          className="w-6 h-6 rounded"
                        />
                        <span className="text-sm text-gray-900">{file.uploadedBy}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{file.uploadedAt}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-gray-200 rounded transition">
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-200 rounded transition">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
