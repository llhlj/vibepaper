'use client';

import { useEffect, useRef } from 'react';
import MarkdownIt from 'markdown-it';
import katex from 'katex';

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

  // Handle display math: $$ ... $$ (must be before inline $)
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
    try {
      return katex.renderToString(math.trim(), { throwOnError: false, displayMode: true });
    } catch (e) {
      console.warn('KaTeX $$...$$ error:', e, math);
      return `<span class="katex-error">${match}</span>`;
    }
  });

  // Handle inline math: $ ... $ (but not $$)
  html = html.replace(/(?<!\$)\$([^\$]+?)\$(?!\$)/g, (match, math) => {
    try {
      return katex.renderToString(math.trim(), { throwOnError: false, displayMode: false });
    } catch (e) {
      console.warn('KaTeX $...$ error:', e, math);
      return `<span class="katex-error">${match}</span>`;
    }
  });

  // Handle LaTeX \[ ... \] for display math
  html = html.replace(/\\\[([\s\S]*?)\\\]/g, (match, math) => {
    try {
      return katex.renderToString(math.trim(), { throwOnError: false, displayMode: true });
    } catch (e) {
      console.warn('KaTeX \\[...\\] error:', e);
      return `<span class="katex-error">${match}</span>`;
    }
  });

  // Handle LaTeX \( ... \) for inline math
  html = html.replace(/\\\((.*?)\\\)/g, (match, math) => {
    try {
      return katex.renderToString(math, { throwOnError: false, displayMode: false });
    } catch (e) {
      console.warn('KaTeX \\(...\\) error:', e);
      return `<span class="katex-error">${match}</span>`;
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
