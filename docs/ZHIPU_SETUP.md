# 智谱AI (Zhipu AI) 配置指南

## 快速开始

### 1. 获取智谱AI API Key

1. 访问 [智谱AI开放平台](https://open.bigmodel.cn/)
2. 注册/登录账号
3. 进入 [API密钥管理](https://open.bigmodel.cn/usercenter/apikeys)
4. 创建新的API密钥并复制

### 2. 配置环境变量

编辑 `.env.local` 文件（完整路径：`C:\mywork\MissionControl\.env.local`）：

```env
# AI提供商选择
AI_PROVIDER=zhipu

# 智谱AI API密钥（必填）
ZHIPU_API_KEY=你的API密钥

# 模型选择（可选，默认glm-4）
ZHIPU_MODEL=glm-4
```

### 3. 启动应用

```bash
npm run dev
```

访问 http://localhost:3000 开始使用！

## 支持的模型

| 模型名称 | 描述 | 适用场景 |
|---------|------|---------|
| `glm-4-plus` | 最强性能 | 复杂数学题、需要深度推理的题目 |
| `glm-4` | 标准版 | 日常使用，平衡性能和速度 |
| `glm-4-air` | 轻量快速 | 一般题目生成 |
| `glm-4-flash` | 超高速 | 简单题目，快速响应 |
| `glm-3-turbo` | 经济版 | 成本敏感场景 |

## 使用示例

### 生成数学试卷

1. 访问 http://localhost:3000/chat
2. 在左侧表单填写：
   - **主题**: 圆柱体体积计算
   - **年级**: 6
   - **题目数量**: 5
   - **难度**: Medium
3. 点击 "Generate Paper"

### 对话式生成

直接在聊天框输入：
```
请帮我生成10道关于二元一次方程的初一数学题，中等难度
```

## 故障排除

### API调用失败
- 检查API密钥是否正确
- 确认账户有足够余额
- 查看控制台错误日志

### 题目格式错误
- 检查模型是否支持（建议使用glm-4或更高版本）
- 尝试降低题目复杂度

## API定价参考

（具体价格请参考智谱AI官方文档）

## 技术支持

- 智谱AI文档: https://open.bigmodel.cn/dev/api
- 问题反馈: 通过GitHub Issues
