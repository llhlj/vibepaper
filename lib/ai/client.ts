import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// AI Provider 类型
export type AIProvider = 'zhipu' | 'anthropic';

// 获取当前使用的AI提供商
export function getAIProvider(): AIProvider {
  return (process.env.AI_PROVIDER as AIProvider) || 'zhipu';
}

// 检查是否使用Anthropic兼容API
export function isUsingAnthropicAPI(): boolean {
  const baseURL = process.env.ZHIPU_BASE_URL || '';
  return baseURL.includes('/anthropic');
}

// 清理环境变量中的引号（Windows/bash 可能会添加引号）
function cleanEnvValue(value: string | undefined): string {
  if (!value) return '';
  // 移除首尾的引号
  let cleaned = value;
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned;
}

// 获取API配置
export function getAPIConfig() {
  const rawApiKey = process.env.ZHIPU_API_KEY;
  if (!rawApiKey) {
    throw new Error('ZHIPU_API_KEY is not set in environment variables');
  }

  // 清理引号
  const apiKey = cleanEnvValue(rawApiKey);

  const baseURL = process.env.ZHIPU_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';

  console.log('[Zhipu Client] baseURL:', baseURL);
  console.log('[Zhipu Client] API Key (raw):', rawApiKey.substring(0, 25) + '...');
  console.log('[Zhipu Client] API Key (cleaned):', apiKey.substring(0, 20) + '...');
  console.log('[Zhipu Client] Length:', apiKey.length);

  return { apiKey, baseURL };
}

// 联合类型 - 可以是OpenAI或Anthropic客户端
export type AIClient = OpenAI | Anthropic;

// 创建智谱AI客户端 - 返回联合类型
export function createZhipuClient(): AIClient {
  const { apiKey, baseURL } = getAPIConfig();

  // 使用Anthropic兼容API时，使用Anthropic SDK
  if (isUsingAnthropicAPI()) {
    return new Anthropic({
      apiKey: apiKey,
      baseURL: baseURL + '/v1',
      maxRetries: 2,
      dangerouslyAllowBrowser: true,  // For testing
    });
  }

  // 默认使用OpenAI兼容API
  return new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
  });
}

// 获取模型名称
export function getModelName(): string {
  const provider = getAIProvider();

  if (provider === 'zhipu') {
    return process.env.ZHIPU_MODEL || 'glm-4';
  }

  // Anthropic
  return process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
}

// 智谱AI支持的模型列表
export const ZHIPU_MODELS = {
  'glm-4-plus': 'GLM-4 Plus (最强性能)',
  'glm-4': 'GLM-4 (标准版)',
  'glm-4-air': 'GLM-4 Air (轻量快速)',
  'glm-4-flash': 'GLM-4 Flash (超高速)',
  'glm-3-turbo': 'GLM-3 Turbo (经济版)',
  'glm-4.7': 'GLM-4.7 (最新版本)',
};

// Anthropic支持的模型列表
export const ANTHROPIC_MODELS = {
  'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
  'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku',
  'claude-3-opus-20240229': 'Claude 3 Opus',
};
