'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MeetingSummarizerProps {
  roomId: string;
  userId: string;
  username: string;
  isConnected: boolean;
}

export default function MeetingSummarizer({ roomId, userId, username, isConnected }: MeetingSummarizerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPiece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptPiece + ' ';
            } else {
              interimTranscript += transcriptPiece;
            }
          }

          if (finalTranscript) {
            setTranscript((prev) => prev + finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setSummary(null);
      setStartTime(new Date());
      recognitionRef.current.start();
      setIsRecording(true);
    } else {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const generateSummary = async () => {
    if (!transcript.trim()) {
      alert('No transcript available to summarize');
      return;
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const endTime = new Date();
      const duration = startTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/meeting-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId,
          userId,
          username,
          transcript,
          duration,
          startTime,
          endTime,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSummary(data.data);
        alert('Meeting summary generated successfully!');
      } else {
        throw new Error(data.message || 'Failed to generate summary');
      }
    } catch (error: any) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">AI Meeting Summarizer</h3>
        <div className="flex gap-2">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={!isConnected}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Stop Recording
            </Button>
          )}
          <Button
            onClick={generateSummary}
            disabled={!transcript.trim() || isProcessing}
            className="bg-black hover:bg-gray-900 text-white"
          >
            {isProcessing ? 'Processing...' : 'Generate Summary'}
          </Button>
        </div>
      </div>

      {isRecording && (
        <div className="flex items-center gap-2 text-white">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">Recording in progress...</span>
        </div>
      )}

      {transcript && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white">Transcript:</h4>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 max-h-40 overflow-y-auto">
            <p className="text-gray-200 text-sm">{transcript}</p>
          </div>
        </div>
      )}

      {summary && (
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">Summary:</h4>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
              <p className="text-gray-200 text-sm">{summary.summary}</p>
            </div>
          </div>

          {summary.keyPoints && summary.keyPoints.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white">Key Points:</h4>
              <ul className="bg-white/5 backdrop-blur-sm rounded-lg p-4 space-y-2">
                {summary.keyPoints.map((point: string, idx: number) => (
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
              <ul className="bg-white/5 backdrop-blur-sm rounded-lg p-4 space-y-2">
                {summary.actionItems.map((item: string, idx: number) => (
                  <li key={idx} className="text-gray-200 text-sm flex items-start gap-2">
                    <span className="text-white font-bold">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
