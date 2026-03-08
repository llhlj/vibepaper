'use client';

import { useEffect, useRef } from 'react';
import MarkdownIt from 'markdown-it';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  className?: string;
}

// Custom renderer for LaTeX in markdown
function renderMath(content: string): string {
  const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
  });

  let html = md.render(content);

  // Render inline math: \( ... \)
  html = html.replace(/\\\((.*?)\\\)/g, (match, math) => {
    try {
      return katex.renderToString(math, { throwOnError: false, displayMode: false });
    } catch (e) {
      return match;
    }
  });

  // Render display math: $$ ... $$
  html = html.replace(/\$\$(.*?)\$\$/gs, (match, math) => {
    try {
      return katex.renderToString(math.trim(), { throwOnError: false, displayMode: true });
    } catch (e) {
      return match;
    }
  });

  // Also support \( ... \) patterns that might be in the original text
  html = html.replace(/\\\\\((.*?)\\\\\)/g, (match, math) => {
    try {
      return katex.renderToString(math, { throwOnError: false, displayMode: false });
    } catch (e) {
      return match;
    }
  });

  return html;
}

export function MathRenderer({ content, className = '' }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = renderMath(content);
    }
  }, [content]);

  return (
    <div
      ref={containerRef}
      className={`prose prose-slate max-w-none ${className}`}
      suppressHydrationWarning
    />
  );
}
