'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChatMessages } from '@/components/chat-message';
import { ChatMessage, GeneratePaperRequest } from '@/types/paper';
import { Send, Loader2, Sparkles, Plus, FileText, Home } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'Welcome to VibePaper! I can help you create customized test papers for your students.\n\nTo get started, use the form below to specify your requirements, or just tell me what you need in plain language.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState<GeneratePaperRequest>({
    topic: '',
    grade: '',
    questionCount: 5,
    difficulty: 'medium',
    questionTypes: ['choice', 'fill', 'essay'],
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, content: buffer }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePaper = async () => {
    if (!formData.topic || !formData.grade) return;

    setIsLoading(true);
    setShowForm(false);

    const prompt = `Generate ${formData.questionCount} ${formData.difficulty} difficulty ${formData.topic} questions for grade ${formData.grade}${formData.questionTypes ? ` with question types: ${formData.questionTypes.join(', ')}` : ''}.`;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          message: prompt,
          context: { generatePaper: true, params: formData },
        }),
      });

      const data = await response.json();

      if (data.success && data.paper) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `I've generated a test paper "${data.paper.title}" with ${data.paper.questions.length} questions. You can view it below or share the link with your students.`,
            timestamp: new Date().toISOString(),
            paper: data.paper,
          },
        ]);
      } else {
        throw new Error(data.error || 'Failed to generate paper');
      }
    } catch (error) {
      console.error('Paper generation error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Sorry, I encountered an error generating the paper. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPaper = (paperId: string) => {
    window.open(`/exam?id=${paperId}`, '_blank');
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Starting a new chat! What would you like to create today?',
        timestamp: new Date().toISOString(),
      },
    ]);
    setShowForm(true);
    setFormData({
      topic: '',
      grade: '',
      questionCount: 5,
      difficulty: 'medium',
      questionTypes: ['choice', 'fill', 'essay'],
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Home className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
            </Link>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              VibePaper
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewChat}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar - Paper Generation Form */}
        <aside className="w-80 flex-shrink-0">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generate Paper
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Cylinder volume"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="grade">Grade</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) => setFormData({ ...formData, grade: value })}
                >
                  <SelectTrigger id="grade">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                      <SelectItem key={grade} value={grade.toString()}>
                        Grade {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="count">Questions: {formData.questionCount}</Label>
                <input
                  id="count"
                  type="range"
                  min="1"
                  max="20"
                  value={formData.questionCount}
                  onChange={(e) => setFormData({ ...formData, questionCount: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: 'easy' | 'medium' | 'hard') =>
                    setFormData({ ...formData, difficulty: value })
                  }
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Question Types</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(['choice', 'fill', 'essay'] as const).map((type) => (
                    <Badge
                      key={type}
                      variant={
                        formData.questionTypes?.includes(type) ? 'default' : 'outline'
                      }
                      className="cursor-pointer"
                      onClick={() => {
                        const types = formData.questionTypes || [];
                        setFormData({
                          ...formData,
                          questionTypes: types.includes(type)
                            ? types.filter((t) => t !== type)
                            : [...types, type],
                        });
                      }}
                    >
                      {type === 'choice' ? 'Multiple Choice' : type === 'fill' ? 'Fill-in' : 'Essay'}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGeneratePaper}
                disabled={isLoading || !formData.topic || !formData.grade}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Paper
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          <div className="flex-1 overflow-y-auto p-6">
            <ChatMessages messages={messages} onViewPaper={handleViewPaper} />
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Or describe what you need in plain language..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
