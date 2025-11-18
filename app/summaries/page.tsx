'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Card } from '@/components/ui/card';

interface MeetingSummary {
  _id: string;
  roomId: string;
  username: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  duration: number;
  startTime: string;
  createdAt: string;
}

export default function SummariesPage() {
  const router = useRouter();
  const [summaries, setSummaries] = useState<MeetingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.userId || 'anonymous');
      fetchSummaries(payload.userId);
    } catch (error) {
      console.error('Token decode error:', error);
      router.push('/');
    }
  }, [router]);

  const fetchSummaries = async (uid: string) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      
      const response = await fetch(
        `${apiUrl}/api/meeting-summary/user/${uid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setSummaries(data.data);
      }
    } catch (error) {
      console.error('Error fetching summaries:', error);
      setSummaries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSummary = async (id: string) => {
    if (!confirm('Are you sure you want to delete this summary?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      
      const response = await fetch(
        `${apiUrl}/api/meeting-summary/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setSummaries(summaries.filter((s) => s._id !== id));
        alert('Summary deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting summary:', error);
      alert('Failed to delete summary');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://i.postimg.cc/P5w0yP5X/ds.png')",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url('https://i.postimg.cc/P5w0yP5X/ds.png')",
          opacity: 1,
          mixBlendMode: 'overlay',
        }}
      ></div>

      <div className="relative z-10 min-h-screen">
        <div className="bg-white/10 backdrop-blur-md border-b-2 border-white/20 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/zetra-logo.svg" alt="Zetra" className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-white">Meeting Summaries</h1>
          </div>
          <AnimatedButton
            onClick={() => router.push('/dashboard')}
            size="md"
          >
            Back to Dashboard
          </AnimatedButton>
        </div>

        <div className="container mx-auto px-6 py-8">
          {isLoading ? (
            <div className="text-center text-white">
              <p>Loading summaries...</p>
            </div>
          ) : summaries.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 text-center">
              <p className="text-white text-lg">No meeting summaries yet</p>
              <p className="text-gray-300 text-sm mt-2">
                Start a meeting and use the AI summarizer to create your first summary
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {summaries.map((summary) => (
                <Card
                  key={summary._id}
                  className="bg-white/10 backdrop-blur-md border-white/20 p-6 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Room: {summary.roomId.substring(0, 8)}...
                      </h3>
                      <p className="text-sm text-gray-300">
                        {new Date(summary.startTime).toLocaleString()} • Duration:{' '}
                        {formatDuration(summary.duration)}
                      </p>
                    </div>
                    <AnimatedButton
                      onClick={() => deleteSummary(summary._id)}
                      size="sm"
                      className="bg-red-600/20"
                    >
                      Delete
                    </AnimatedButton>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-white">Summary:</h4>
                    <p className="text-gray-200 text-sm">{summary.summary}</p>
                  </div>

                  {summary.keyPoints && summary.keyPoints.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-white">Key Points:</h4>
                      <ul className="space-y-1">
                        {summary.keyPoints.map((point, idx) => (
                          <li key={idx} className="text-gray-200 text-sm flex items-start gap-2">
                            <span className="text-white font-bold">-</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {summary.actionItems && summary.actionItems.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-white">Action Items:</h4>
                      <ul className="space-y-1">
                        {summary.actionItems.map((item, idx) => (
                          <li key={idx} className="text-gray-200 text-sm flex items-start gap-2">
                            <span className="text-white font-bold">→</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
