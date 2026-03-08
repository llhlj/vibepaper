import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { buildQuestionGenerationPrompt, GenerateQuestionsParams } from '@/lib/ai/prompts';
import { Paper, Question } from '@/types/paper';
import { savePaper } from '@/lib/storage';
import { createZhipuClient, getModelName, getAIProvider, isUsingAnthropicAPI, AIClient, getAPIConfig } from '@/lib/ai/client';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  try {
    // Debug: Log environment variables (without exposing full API key)
    console.log('[Debug] ZHIPU_API_KEY exists:', !!process.env.ZHIPU_API_KEY);
    console.log('[Debug] ZHIPU_API_KEY length:', process.env.ZHIPU_API_KEY?.length);
    console.log('[Debug] ZHIPU_API_KEY prefix:', process.env.ZHIPU_API_KEY?.substring(0, 20));
    console.log('[Debug] ZHIPU_BASE_URL:', process.env.ZHIPU_BASE_URL);
    console.log('[Debug] ZHIPU_MODEL:', process.env.ZHIPU_MODEL);

    const { message, context } = await req.json();

    // Check if this is a paper generation request
    const isGenerationRequest = context?.generatePaper;

    if (isGenerationRequest) {
      return await handlePaperGeneration(context.params);
    }

    // Regular chat message
    const provider = getAIProvider();

    if (provider === 'zhipu') {
      return await handleZhipuChat(message);
    }

    // Fallback or other providers can be added here
    return NextResponse.json(
      { error: 'AI provider not configured' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

// 智谱AI聊天处理 - 支持OpenAI和Anthropic两种SDK
async function handleZhipuChat(message: string) {
  const model = getModelName();
  const useAnthropic = isUsingAnthropicAPI();
  const { apiKey, baseURL } = getAPIConfig();

  if (useAnthropic) {
    // 使用原生fetch直接调用Anthropic兼容API
    const systemPrompt = '你是VibePaper的AI助手，专门帮助K-12教师和家长生成测试试卷。请用简洁、友好的方式回答问题。';

    const response = await fetch(`${baseURL}/v1/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${await response.text()}`);
    }

    // 创建一个转换流来处理SSE流
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();

    return new Response(
      new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') continue;

                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                      controller.enqueue(encoder.encode(parsed.delta.text));
                    }
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            }
          } catch (error) {
            controller.error(error);
          } finally {
            controller.close();
          }
        },
      }),
      {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      }
    );
  } else {
    // 使用OpenAI SDK
    const openai = createZhipuClient() as OpenAI;
    const stream = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: '你是VibePaper的AI助手，专门帮助K-12教师和家长生成测试试卷。请用简洁、友好的方式回答问题。',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      stream: true,
      max_tokens: 1024,
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            }
          } catch (error) {
            controller.error(error);
          } finally {
            controller.close();
          }
        },
      }),
      {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      }
    );
  }
}

// 试卷生成处理
async function handlePaperGeneration(params: GenerateQuestionsParams) {
  try {
    const provider = getAIProvider();

    if (provider === 'zhipu') {
      return await handleZhipuPaperGeneration(params);
    }

    return NextResponse.json(
      { error: 'AI provider not configured for paper generation' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Paper generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate paper',
      },
      { status: 500 }
    );
  }
}

// 智谱AI试卷生成 - 支持OpenAI和Anthropic两种SDK
async function handleZhipuPaperGeneration(params: GenerateQuestionsParams) {
  const model = getModelName();
  const prompt = buildQuestionGenerationPrompt(params);
  const useAnthropic = isUsingAnthropicAPI();
  const { apiKey, baseURL } = getAPIConfig();

  const systemPrompt = `你是VibePaper的试题生成引擎。你的任务是根据教师的要求生成高质量的K-12测试题目。

## 重要规则（必须严格遵守）
1. 只返回JSON对象，不要包含任何解释性文字、注释或其他内容
2. 不要使用markdown代码块（如 \`\`\`json），直接输出JSON
3. 必须生成正好 ${params.questionCount} 道题目
4. 每道题必须包含: id, type, content, answer, explanation
5. 选择题需要options数组，包含4个选项
6. 数学公式使用LaTeX语法：
   - 行内公式使用单美元符号：$公式$
   - 独立公式使用双美元符号：$$公式$$
   - 示例：计算 $2+3$ 的值，或求解 $$x^2 + 2x + 1 = 0$$

## 题目类型
- choice: 多选题（4个选项，1个正确答案）
- fill: 填空题（简短答案）
- essay: 问答题（需要详细解释）

## 输出格式（直接输出此格式，不要添加任何其他内容）
{"questions":[{"id":"q1","type":"choice","content":"题目内容","options":["选项A","选项B","选项C","选项D"],"answer":"正确答案","explanation":"详细解释"}]}`;

  let responseText = '';

  if (useAnthropic) {
    // 使用原生fetch直接调用Anthropic兼容API
    console.log('[Paper Generation] Using native fetch for Anthropic API with model:', model);
    console.log('[Paper Generation] API Key:', apiKey.substring(0, 20) + '...');
    console.log('[Paper Generation] Base URL:', baseURL);

    const requestBody = {
      model: model,
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    };

    const fullUrl = `${baseURL}/v1/messages`;
    console.log('[API Request] Full URL:', fullUrl);
    console.log('[API Request] Body:', JSON.stringify(requestBody).substring(0, 500));

    const apiResponse = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[API Response] Status:', apiResponse.status);
    console.log('[API Response] Headers:', Object.fromEntries(apiResponse.headers.entries()));

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('[API Error] Response:', errorText);
      throw new Error(`API request failed: ${apiResponse.status} ${errorText}`);
    }

    const jsonResponse = await apiResponse.json();
    console.log('[API Response] Full response:', JSON.stringify(jsonResponse, null, 2).substring(0, 1000));

    // Anthropic响应格式: response.content[0].text
    if (jsonResponse.content && jsonResponse.content.length > 0) {
      const block = jsonResponse.content[0];
      if (block.type === 'text') {
        responseText = block.text;
      }
    }
  } else {
    // 使用OpenAI SDK
    const openai = createZhipuClient() as OpenAI;
    console.log('[Paper Generation] Using OpenAI SDK with model:', model);

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 8192,
    });

    console.log('[API Response] OpenAI response structure:', JSON.stringify(response, null, 2).substring(0, 500));

    // OpenAI响应格式: response.choices[0].message.content
    responseText = response.choices[0]?.message?.content || '';
  }

  console.log('[API Response] Response text length:', responseText.length);
  console.log('[API Response] First 200 chars:', responseText.substring(0, 200));

  if (!responseText) {
    throw new Error('Empty response from API');
  }

  // 解析JSON响应
  let jsonText = responseText.trim();

  console.log('[JSON Parse] Original response (first 500 chars):', jsonText.substring(0, 500));

  // 移除可能的markdown代码块和额外内容
  if (jsonText.includes('```')) {
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
      console.log('[JSON Parse] Extracted from markdown code block');
    }
  }

  // 尝试找到JSON对象的起始和结束位置
  const firstBrace = jsonText.indexOf('{');
  const lastBrace = jsonText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    console.log('[JSON Parse] Extracted JSON object from response');
  }

  let parsed;
  let parseError;

  // First attempt: direct parse
  try {
    parsed = JSON.parse(jsonText);
    console.log('[JSON Parse] Success on first attempt');
  } catch (e) {
    parseError = e;
    console.log('[JSON Parse] First attempt failed:', (e as Error).message);

    // Second attempt: fix common JSON escaping issues from AI
    try {
      let fixedJson = jsonText;
      // Fix LaTeX backslash issues - match single backslash and replace with double
      const latexFixes: [string, string][] = [
        ['\\\\(', '\\\\\\\\('], ['\\\\)', '\\\\\\\\)'],
        ['\\\\[', '\\\\\\\\['], ['\\\\]', '\\\\\\\\]'],
        ['\\\\sqrt', '\\\\\\\\sqrt'], ['\\\\frac', '\\\\\\\\frac'],
        ['\\\\pi', '\\\\\\\\pi'], ['\\\\text', '\\\\\\\\text'],
        ['\\\\times', '\\\\\\\\times'], ['\\\\div', '\\\\\\\\div'],
      ];
      for (const [from, to] of latexFixes) {
        fixedJson = fixedJson.split(from).join(to);
      }

      console.log('[JSON Parse] Attempting with LaTeX escaping fixes...');
      parsed = JSON.parse(fixedJson);
      console.log('[JSON Parse] Success with escaping fixes');
    } catch (e2) {
      console.error('[JSON Parse Error] All attempts failed');
      console.error('[JSON Parse Error] Full response:', responseText.substring(0, 1000));
      console.error('[JSON Parse Error] Extracted text:', jsonText.substring(0, 500));
      throw new Error(`Failed to parse JSON from response. ${(parseError as Error).message}`);
    }
  }

  const questions: Question[] = parsed.questions || [];

  if (questions.length === 0) {
    throw new Error('No questions generated');
  }

  // 创建试卷
  const paper: Paper = {
    id: uuidv4(),
    title: `${params.topic} - ${params.grade}年级`,
    questions,
    createdAt: new Date().toISOString(),
  };

  // 保存到存储
  await savePaper(paper);

  return NextResponse.json(
    {
      success: true,
      paper,
    },
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }
  );
}

export const runtime = 'nodejs';
