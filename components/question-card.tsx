'use client';

import { Question } from '@/types/paper';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MathRenderer } from './math-render';
import { CheckCircle2, Circle, FileText } from 'lucide-react';
import { useState } from 'react';

interface QuestionCardProps {
  question: Question;
  index: number;
  showAnswer?: boolean;
  userAnswer?: string;
  onAnswerChange?: (answer: string) => void;
  readonly?: boolean;
}

export function QuestionCard({
  question,
  index,
  showAnswer = false,
  userAnswer = '',
  onAnswerChange,
  readonly = false,
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState(userAnswer);

  const handleOptionChange = (option: string) => {
    if (!readonly && onAnswerChange) {
      setSelectedOption(option);
      onAnswerChange(option);
    }
  };

  const getQuestionTypeLabel = (type: Question['type']) => {
    switch (type) {
      case 'choice':
        return 'Multiple Choice';
      case 'fill':
        return 'Fill in the Blank';
      case 'essay':
        return 'Essay';
      default:
        return type;
    }
  };

  const getQuestionTypeColor = (type: Question['type']) => {
    switch (type) {
      case 'choice':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'fill':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'essay':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span>Question {index + 1}</span>
          </CardTitle>
          <Badge className={getQuestionTypeColor(question.type)}>
            {getQuestionTypeLabel(question.type)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question Content */}
        <div className="text-base">
          <MathRenderer content={question.content} />
        </div>

        {/* Multiple Choice Options */}
        {question.type === 'choice' && question.options && (
          <div className="space-y-2">
            {question.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isAnswer = showAnswer && option === question.answer;

              return (
                <div
                  key={idx}
                  className={`
                    flex items-start gap-3 p-3 rounded-lg border transition-all
                    ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'}
                    ${isAnswer ? 'bg-green-100 dark:bg-green-900/30 border-green-500' : ''}
                    ${readonly ? 'cursor-default' : 'cursor-pointer'}
                  `}
                  onClick={() => handleOptionChange(option)}
                >
                  {readonly ? (
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      {isAnswer ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : isSelected ? (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground opacity-50" />
                      )}
                    </div>
                  ) : (
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                    </div>
                  )}
                  <span className="flex-1">
                    <MathRenderer content={option} />
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Fill-in-the-Blank Input */}
        {question.type === 'fill' && !readonly && (
          <input
            type="text"
            value={selectedOption}
            onChange={(e) => handleOptionChange(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={readonly}
          />
        )}

        {/* Fill-in-the-Blank Display (readonly) */}
        {question.type === 'fill' && readonly && (
          <div className="p-3 bg-muted/30 rounded-lg border">
            {selectedOption ? (
              <MathRenderer content={selectedOption} />
            ) : (
              <span className="text-muted-foreground italic">No answer provided</span>
            )}
          </div>
        )}

        {/* Essay Input */}
        {question.type === 'essay' && !readonly && (
          <textarea
            value={selectedOption}
            onChange={(e) => handleOptionChange(e.target.value)}
            placeholder="Write your answer here..."
            rows={6}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            disabled={readonly}
          />
        )}

        {/* Essay Display (readonly) */}
        {question.type === 'essay' && readonly && (
          <div className="p-3 bg-muted/30 rounded-lg border min-h-[100px]">
            {selectedOption ? (
              <MathRenderer content={selectedOption} />
            ) : (
              <span className="text-muted-foreground italic">No answer provided</span>
            )}
          </div>
        )}

        {/* Answer and Explanation (when shown) */}
        {showAnswer && (
          <div className="pt-4 border-t space-y-3">
            {question.type !== 'choice' && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="font-medium text-green-800 dark:text-green-200 mb-1">
                  Correct Answer:
                </div>
                <MathRenderer content={question.answer} />
              </div>
            )}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                Explanation:
              </div>
              <MathRenderer content={question.explanation} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
