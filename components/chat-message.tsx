'use client';

import { ChatMessage } from '@/types/paper';
import { User, Bot, FileText } from 'lucide-react';
import { MathRenderer } from './math-render';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ChatMessageProps {
  message: ChatMessage;
  onViewPaper?: (paperId: string) => void;
}

export function ChatMessageComponent({ message, onViewPaper }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return null; // Don't display system messages
  }

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? 'order-2' : ''}`}>
        <Card className={isUser ? 'bg-primary/5 border-primary/20' : ''}>
          <CardContent className="p-4">
            {message.content && (
              <div className={isUser ? 'text-foreground' : ''}>
                <MathRenderer content={message.content} />
              </div>
            )}

            {message.paper && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <FileText className="w-4 h-4" />
                  <span>Paper Generated: {message.paper.title}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {message.paper.questions.length} questions • Created{' '}
                  {new Date(message.paper.createdAt).toLocaleString()}
                </div>
                <Button
                  size="sm"
                  onClick={() => onViewPaper?.(message.paper!.id)}
                  className="w-full sm:w-auto"
                >
                  View Paper
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center order-1">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  onViewPaper?: (paperId: string) => void;
  className?: string;
}

export function ChatMessages({ messages, onViewPaper, className = '' }: ChatMessagesProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      {messages.map((message) => (
        <ChatMessageComponent
          key={message.id}
          message={message}
          onViewPaper={onViewPaper}
        />
      ))}
    </div>
  );
}
