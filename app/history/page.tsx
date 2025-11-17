'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CallLog {
  _id: string;
  roomId: string;
  participants: string[];
  startTime: string;
  endTime: string;
  duration: number;
}

export default function History() {
  const router = useRouter();
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('User');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUsername(payload.username || 'User');
    } catch (error) {
      console.error('Token decode error:', error);
    }

    fetchCallHistory(token);
  }, [router]);

  const fetchCallHistory = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/call-logs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCallLogs(data.callLogs || []);
      }
    } catch (error) {
      console.error('Error fetching call history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/zetra-logo.svg" alt="Zetra" className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-black">Zetra</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {username}</span>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition"
            >
              Profile
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Call History</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-600 mt-4">Loading call history...</p>
          </div>
        ) : callLogs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📞</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Call History</h3>
            <p className="text-gray-600 mb-6">You haven't made any calls yet</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Start Your First Call
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {callLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {log.roomId}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.participants.length} participant{log.participants.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.startTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(log.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => router.push(`/room/${log.roomId}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Rejoin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
