# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
**VibePaper** - AI-driven lightweight test paper generation system for K-12 teachers/parents.

### Core Workflow
1. **Chat-based paper generation**: User describes requirements via Chatbot (e.g., "Generate 10 grade-6 cylinder volume problems, medium difficulty")
2. **Structured storage**: AI-generated questions persisted as standard `.json` files
3. **Paper distribution**: Unique web links for students to take exams online
4. **Auto-grading**: Objective questions via regex, subjective questions via LLM assistance

### Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **UI**: Tailwind CSS + Shadcn UI + Lucide Icons
- **AI**: Vercel AI SDK (streaming output)
- **Storage**:
  - Papers/records: Local JSON files (Dev) / Vercel Blob or KV (Prod)
  - Auth: NextAuth.js (minimal email/GitHub login)
- **Rendering**: Markdown-it + KaTeX (math formulas)

## Directory Structure
```
/papers          - Paper definition files [paperId].json
/records         - Student submission records [studentId]_[paperId].json
/app/chat        - Paper creator interface
/app/exam        - Student exam interface
```

## Core Design Philosophy
- **Minimalism**: Use files instead of databases where possible, use CSS instead of libraries
- **AI-Native**: All question generation logic designed around LLM, backend only handles forwarding and file I/O
- **Type Safety**: Strict TypeScript definitions, especially for Paper and Record schemas

## Technical Guidelines
- **Components**: Use Shadcn UI, maintain clean interface with high contrast (suitable for K-12)
- **File I/O**: Backend logic centralized in `lib/storage.ts`, unified JSON read/write handling, consider basic locking or atomicity for concurrent writes
- **Prompt Engineering**: Define System Prompts in `lib/ai/prompts.ts`, require LLM to return JSON code blocks conforming to specified interface protocols

## Development Constraints
- No heavy backend frameworks, use Next.js API Routes only
- Math formula rendering: Must support both frontend preview and export/print modes
- Interactive feedback: Chat process must have Loading state and streaming text display
- Code style: Short, modular functions; prefer composition over inheritance

## Data Protocols (Strict)
```typescript
interface Question {
  id: string;
  type: 'choice' | 'fill' | 'essay';
  content: string; // Supports Markdown & LaTeX
  options?: string[]; // Choice questions only
  answer: string;
  explanation: string;
}

interface Paper {
  id: string;
  title: string;
  questions: Question[];
  createdAt: string;
}
```
