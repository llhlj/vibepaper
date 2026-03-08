'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Paper, Question, StudentRecord } from '@/types/paper';
import { QuestionCard } from '@/components/question-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Clock, GraduationCap, Home } from 'lucide-react';
import Link from 'next/link';

export function ExamContent() {
  const searchParams = useSearchParams();
  const paperId = searchParams.get('id');

  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string>('');
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (paperId) {
      fetch(`/api/papers?id=${paperId}`)
        .then((res) => res.json())
        .then((data) => {
          setPaper(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [paperId]);

  useEffect(() => {
    if (!submitted && paper) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [submitted, paper]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!paper || !studentName.trim()) return;

    const record: StudentRecord = {
      id: `${Date.now()}_${paper.id}`,
      paperId: paper.id,
      studentId: Date.now().toString(),
      studentName: studentName.trim(),
      answers,
      submittedAt: new Date().toISOString(),
    };

    // In production, save to server
    // await fetch('/api/records', { method: 'POST', body: JSON.stringify(record) });

    setSubmitted(true);
    setSubmittedAt(record.submittedAt);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    if (!paper) return 0;
    let correct = 0;
    paper.questions.forEach((q) => {
      if (q.type === 'choice' && answers[q.id] === q.answer) {
        correct++;
      }
      // For fill and essay, auto-grading is simplified
      if (q.type === 'fill' && answers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim()) {
        correct++;
      }
    });
    return Math.round((correct / paper.questions.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Exam Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The exam you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="mb-6 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-800 dark:text-green-200">
                <CheckCircle2 className="w-8 h-8" />
                Exam Submitted Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Student</p>
                  <p className="font-semibold">{studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="font-semibold text-2xl text-green-600 dark:text-green-400">{score}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="font-semibold">{paper.questions.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time Taken</p>
                  <p className="font-semibold">{formatTime(timeElapsed)}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <Link href="/">
                  <Button variant="outline">Back to Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="w-6 h-6" />
              Review Your Answers
            </h2>
            {paper.questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                userAnswer={answers[question.id]}
                showAnswer
                readonly
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Home className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
            </Link>
            <h1 className="text-lg font-semibold truncate">{paper.title}</h1>
          </div>
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(timeElapsed)}
          </Badge>
        </div>
      </header>

      {/* Student Name Input */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {!studentName && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="p-4">
              <Label htmlFor="studentName">Enter your name to begin</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="studentName"
                  placeholder="Your full name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && studentName.trim() && document.getElementById('questions')?.scrollIntoView()}
                />
                {studentName.trim() && (
                  <Button onClick={() => document.getElementById('questions')?.scrollIntoView()}>
                    Start
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions */}
        {studentName && (
          <div id="questions" className="space-y-6 mb-24">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Student: {studentName}</p>
                <p className="text-lg font-semibold">{paper.title}</p>
              </div>
              <Badge variant="secondary">{paper.questions.length} Questions</Badge>
            </div>

            {paper.questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                userAnswer={answers[question.id]}
                onAnswerChange={(answer: string) => handleAnswerChange(question.id, answer)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Submit Bar */}
      {studentName && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-white dark:bg-gray-800 shadow-lg">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-4xl">
            <div>
              <p className="text-sm text-muted-foreground">Answered</p>
              <p className="font-semibold">
                {Object.keys(answers).length} / {paper.questions.length}
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={Object.keys(answers).length === 0}
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Submit Exam
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
