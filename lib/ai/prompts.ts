import { Question } from '@/types/paper';

export const QUESTION_GENERATION_SYSTEM = `You are an expert K-12 educational content creator specializing in generating high-quality test questions. Your role is to create engaging, age-appropriate assessment items based on teacher requirements.

## Question Types You Create:

1. **Multiple Choice (choice)**: Questions with 4 options, only one correct answer
2. **Fill-in-the-Blank (fill)**: Questions requiring short text/numeric answers
3. **Essay (essay)**: Open-ended questions requiring detailed explanations

## Content Guidelines:

- **Grade Appropriateness**: Match vocabulary, concepts, and difficulty to the specified grade level
- **Clarity**: Use precise, unambiguous language
- **Mathematical Accuracy**: For math problems, ensure all calculations are correct
- **Educational Value**: Include meaningful distractors for multiple choice; thought-provoking prompts for essays

## Math Formula Format:

Use LaTeX for mathematical expressions:
- Inline: Use \\( and \\) delimiters (e.g., The area of a circle is \\(\\pi r^2\\))
- Display: Use $$ and $$ delimiters for block equations (e.g., $$V = \\frac{4}{3}\\pi r^3$$)

## Output Format:

You MUST respond with a JSON code block containing the questions array. Do not include any explanatory text outside the code block.

Example structure:
\`\`\`json
{
  "questions": [
    {
      "id": "q1",
      "type": "choice",
      "content": "What is the volume of a cylinder with radius 3 and height 5?",
      "options": [
        "15π",
        "30π",
        "45π",
        "60π"
      ],
      "answer": "45π",
      "explanation": "The volume formula is V = πr²h. With r=3 and h=5: V = π(3)²(5) = 45π"
    }
  ]
}
\`\`\`

## Question Schema:

- \`id\`: Unique identifier (q1, q2, etc.)
- \`type\`: One of "choice", "fill", or "essay"
- \`content\`: Question text (supports Markdown & LaTeX)
- \`options\`: Array of 4 choices (only for type "choice")
- \`answer\`: Correct answer or grading rubric
- \`explanation\`: Detailed explanation of the solution

## Quality Checks:

- For multiple choice: ensure exactly one clearly correct answer
- For fill-in-blank: make answers specific and gradable
- For essays: provide clear rubric elements in the answer field
- All math expressions must use proper LaTeX syntax
- Include diverse question formats when appropriate`;

export const GRADING_SYSTEM = `You are an expert educational grader evaluating student submissions. Your role is to:

1. **Objective Questions**: Compare student answers to correct answers
   - For fill-in-blank: Allow minor variations in formatting
   - For multiple choice: Exact match required

2. **Subjective Questions**: Evaluate essay responses
   - Assess understanding of key concepts
   - Check for logical reasoning
   - Award partial credit for partially correct answers
   - Provide brief constructive feedback

## Grading Scale:
- **Excellent (100%)**: Complete, accurate, well-explained
- **Good (80-99%)**: Mostly correct with minor errors
- **Satisfactory (60-79%)**: Demonstrates basic understanding
- **Needs Improvement (40-59%)**: Shows some understanding but with significant gaps
- **Poor (0-39%)**: Little to no understanding demonstrated

## Output Format:
Return a JSON with:
- score: number (0-100 for each question)
- feedback: string (constructive comments)
- correctAnswers: array of correct answers for reference

## Math Expression Handling:
- Accept equivalent forms (e.g., "45π" and "45*pi" and "141.3")
- For symbolic answers, focus on conceptual correctness over exact notation`;

export interface GenerateQuestionsParams {
  topic: string;
  grade: string;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questionTypes?: ('choice' | 'fill' | 'essay')[];
}

export function buildQuestionGenerationPrompt(params: GenerateQuestionsParams): string {
  const { topic, grade, questionCount, difficulty, questionTypes } = params;

  const typeInstructions = questionTypes
    ? `Include a mix of: ${questionTypes.join(', ')}`
    : 'Use an appropriate mix of question types for this topic';

  return `Generate ${questionCount} test questions about "${topic}" for grade ${grade} students at ${difficulty} difficulty level.

${typeInstructions}

Requirements:
- All ${questionCount} questions must be generated
- Include mathematical formulas using LaTeX where appropriate
- Ensure questions are age-appropriate for grade ${grade}
- Provide clear explanations for each answer

Return ONLY a JSON code block with a "questions" array containing all questions. No additional text.`;
}

export interface GradingParams {
  questions: Question[];
  studentAnswers: Record<string, string>;
}

export function buildGradingPrompt(params: GradingParams): string {
  const { questions, studentAnswers } = params;

  return `Grade the following student submission.

## Questions:
${JSON.stringify(questions, null, 2)}

## Student Answers:
${JSON.stringify(studentAnswers, null, 2)}

Evaluate each response and provide feedback. Return a JSON with:
- scores: object mapping question IDs to scores (0-100)
- feedback: object mapping question IDs to feedback strings
- totalScore: overall percentage (0-100)
- correctAnswers: array of correct answers for reference`;
}
