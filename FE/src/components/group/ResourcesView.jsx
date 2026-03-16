import { useEffect, useMemo, useRef, useState } from 'react';
import { FolderOpen, File, FileText, Image, Download, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { submissionService } from '../../services/app.service';
import firebaseStorageService from '../../services/firebase-storage.service';

const inferType = (fileName = '') => {
  const lowered = fileName.toLowerCase();
  if (lowered.endsWith('.pdf')) return 'pdf';
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].some((ext) => lowered.endsWith(ext))) return 'image';
  if (['.md', '.txt'].some((ext) => lowered.endsWith(ext))) return 'markdown';
  return 'file';
};

const extractFileName = (url = '') => {
  if (!url) return 'Untitled file';
  try {
    const decoded = decodeURIComponent(url.split('?')[0] || '');
    const segments = decoded.split('/').filter(Boolean);
    return segments[segments.length - 1] || 'Untitled file';
  } catch {
    return 'Untitled file';
  }
};

const formatSize = (size) => {
  if (!size || Number.isNaN(Number(size))) return 'N/A';
  const bytes = Number(size);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (type) => {
  switch (type) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-500" />;
    case 'image':
      return <Image className="w-5 h-5 text-purple-500" />;
    case 'markdown':
      return <FileText className="w-5 h-5 text-blue-500" />;
    default:
      return <File className="w-5 h-5 text-gray-500" />;
  }
};

const getAvatarSrc = (user) => user?.avatarURL || user?.avatarUrl || user?.avatar_url || '';

const getInitials = (name) => String(name || 'U')
  .split(' ')
  .filter(Boolean)
  .map((part) => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase();

export function ResourcesView({ groupId }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const loadFiles = async () => {
    if (!groupId) {
      setFiles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await submissionService.getAllSubmissions({ groupId, limit: 100 });
      const rows = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
          ? response.data
          : [];
      const normalized = rows
        .filter((row) => row?.fileUrl || row?.filePath)
        .map((row) => {
          const url = row.fileUrl || row.filePath;
          const fileName = extractFileName(url);
          return {
            id: row.id,
            name: fileName,
            type: inferType(fileName),
            size: row.fileSize ? formatSize(row.fileSize) : 'N/A',
            uploadedBy: row.submitter?.fullName || 'Unknown',
            uploadedByUser: row.submitter || null,
            uploadedAt: row.submittedAt || row.createdAt,
            milestoneName: row.milestoneName || 'General',
            url
          };
        });

      setFiles(normalized);
    } catch (error) {
      console.error(error);
      setFiles([]);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [groupId]);

  const folders = useMemo(() => {
    const grouped = files.reduce((acc, file) => {
      const key = file.milestoneName || 'General';
      if (!acc[key]) acc[key] = [];
      acc[key].push(file);
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, items], index) => {
      const latest = items
        .map((file) => new Date(file.uploadedAt || 0).getTime())
        .filter((time) => !Number.isNaN(time))
        .sort((a, b) => b - a)[0];

      return {
        id: `${name}_${index}`,
        name,
        files: items.length,
        updated: latest ? new Date(latest).toLocaleString() : 'N/A'
      };
    });
  }, [files]);

  const recentFiles = useMemo(() => {
    return [...files]
      .sort((first, second) => new Date(second.uploadedAt || 0).getTime() - new Date(first.uploadedAt || 0).getTime())
      .slice(0, 20);
  }, [files]);

  const handleUploadClick = () => {
    if (!firebaseStorageService.isEnabled()) {
      toast.error('Firebase upload is not configured');
      return;
    }
    inputRef.current?.click();
  };

  const handleUploadFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !groupId) return;

    setUploading(true);
    try {
      const uploaded = await firebaseStorageService.uploadFile(file, 'resources');
      await submissionService.createSubmission({
        groupId,
        milestoneName: 'Resources',
        fileUrl: uploaded.url,
        notes: `Uploaded from resources: ${file.name}`
      });
      toast.success('File uploaded');
      await loadFiles();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || error?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50 overflow-y-auto">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900"># 📂 resources</h1>
            <p className="text-sm text-gray-600 mt-0.5">Shared files and documents</p>
          </div>
          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="inline-flex items-center gap-2 bg-[#F27125] hover:bg-[#d96420] text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-60"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
          <input ref={inputRef} type="file" className="hidden" onChange={handleUploadFile} />
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h2 className="font-bold text-gray-900 mb-3">Folders</h2>
          {folders.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-500">No folders yet</div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {folders.map((folder) => (
                <div key={folder.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-[#F27125] hover:shadow-md transition">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{folder.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{folder.files} files</span>
                    <span>Updated {folder.updated}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-bold text-gray-900 mb-3">Recent Files</h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="w-6 h-6 text-[#F27125] animate-spin" />
              </div>
            ) : recentFiles.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">No files uploaded yet</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Uploaded By</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Uploaded</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">{getFileIcon(file.type)}</div>
                          <span className="font-medium text-gray-900 text-sm">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="text-sm text-gray-600">{file.size}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getAvatarSrc(file.uploadedByUser) ? (
                            <img src={getAvatarSrc(file.uploadedByUser)} alt={file.uploadedBy} className="w-6 h-6 rounded object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded bg-[#F27125]/10 text-[#F27125] text-[10px] font-semibold flex items-center justify-center">
                              {getInitials(file.uploadedBy)}
                            </div>
                          )}
                          <span className="text-sm text-gray-900">{file.uploadedBy}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="text-sm text-gray-600">{new Date(file.uploadedAt).toLocaleString()}</span></td>
                      <td className="px-4 py-3">
                        <a href={file.url} target="_blank" rel="noreferrer" className="inline-flex p-1.5 hover:bg-gray-200 rounded transition">
                          <Download className="w-4 h-4 text-gray-600" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
