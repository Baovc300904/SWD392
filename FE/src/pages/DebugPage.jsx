import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

export function DebugPage() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const localUser = localStorage.getItem('user');
  const sessionUser = sessionStorage.getItem('user');
  const rememberMe = localStorage.getItem('rememberMe');

  const handleClear = () => {
    localStorage.clear();
    sessionStorage.clear();
    alert('Đã xóa toàn bộ localStorage & sessionStorage');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🔍 Debug Storage</h1>

        {/* Current User */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-bold text-blue-900 mb-2">authService.getCurrentUser():</h2>
          <pre className="text-sm bg-white p-3 rounded overflow-auto">
            {JSON.stringify(user, null, 2) || 'null'}
          </pre>
        </div>

        {/* LocalStorage */}
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
          <h2 className="text-xl font-bold text-yellow-900 mb-2">localStorage.getItem('user'):</h2>
          <pre className="text-sm bg-white p-3 rounded overflow-auto">
            {localUser || 'null'}
          </pre>
        </div>

        {/* SessionStorage */}
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h2 className="text-xl font-bold text-green-900 mb-2">sessionStorage.getItem('user'):</h2>
          <pre className="text-sm bg-white p-3 rounded overflow-auto">
            {sessionUser || 'null'}
          </pre>
        </div>

        {/* Remember Me */}
        <div className="mb-6 p-4 bg-purple-50 rounded-lg">
          <h2 className="text-xl font-bold text-purple-900 mb-2">Remember Me:</h2>
          <pre className="text-sm bg-white p-3 rounded overflow-auto">
            {rememberMe || 'false'}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleClear}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
          >
            🗑️ Xóa toàn bộ Storage
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
          >
            🏠 Về Trang chủ
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-[#F27125] hover:bg-[#d96420] text-white font-semibold rounded-lg transition"
          >
            🔑 Đăng nhập
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-2">📋 Hướng dẫn:</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Nếu <code className="bg-gray-200 px-1">getCurrentUser()</code> trả về <code className="bg-gray-200 px-1">null</code>, bạn chưa đăng nhập</li>
            <li>Nếu có user nhưng bị kẹt ở /group, kiểm tra <code className="bg-gray-200 px-1">role</code> có đúng không</li>
            <li>Nếu bị lỗi, nhấn "Xóa toàn bộ Storage" rồi đăng nhập lại</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
