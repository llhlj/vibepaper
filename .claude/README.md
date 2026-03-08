# VibePaper - AI 驱动的轻量化出题系统

## 项目愿景
为中小学老师/家长打造一个极其轻量的、基于对话的出题与阅卷工具。主打“结构清晰、即刻生成、文件存储”。

## 核心流程
1. **对话出题**：用户通过 Chatbot 描述需求（如：“来10道六年级圆柱体体积题，难度中等”）。
2. **结构化存储**：AI 生成的题目以标准 `.json` 格式持久化到文件系统。
3. **试卷分发**：生成唯一的 Web 链接，学生在线答题。
4. **自动判卷**：客观题正则比对，主观题 LLM 辅助评分，结果存入 `records` 目录。

## 技术栈
- **全栈框架**: Next.js 14+ (App Router)
- **UI 组件**: Tailwind CSS + Shadcn UI + Lucide Icons
- **AI 集成**: Vercel AI SDK (支持 Stream 输出)
- **存储**: 
    - 试卷/记录：本地 JSON 文件 (Development) / Vercel Blob or KV (Production)
    - 账号：NextAuth.js (支持极简的邮件/GitHub 登录)
- **渲染**: Markdown-it + KaTeX (数学公式渲染)

## 目录结构
- `/papers`: 存放试卷定义文件 `[paperId].json`
- `/records`: 存放学生答题结果 `[studentId]_[paperId].json`
- `/app/chat`: 出题者交互界面
- `/app/exam`: 学生答题界面