import { Paper, StudentRecord } from '@/types/paper';

// Storage type detection
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// In-memory storage for Vercel (non-persistent)
const memoryPapers = new Map<string, Paper>();
const memoryRecords = new Map<string, StudentRecord>();

// ============================================================
// Vercel KV Storage (需要安装 @vercel/kv)
// ============================================================

// 要使用 Vercel KV，需要：
// 1. npm install @vercel/kv
// 2. 在 Vercel 项目中创建 KV 数据库
// 3. 取消下面代码的注释

/*
import { kv } from '@vercel/kv';

const KV_PREFIX_PAPERS = 'vibepaper:papers:';
const KV_PREFIX_RECORDS = 'vibepaper:records:';
const KV_PREFIX_PAPERS_LIST = 'vibepaper:papers_list';

async function savePaperKV(paper: Paper): Promise<void> {
  await kv.set(`${KV_PREFIX_PAPERS}${paper.id}`, JSON.stringify(paper));
  await kv.sadd(KV_PREFIX_PAPERS_LIST, paper.id);
}

async function getPaperKV(id: string): Promise<Paper | null> {
  const data = await kv.get<string>(`${KV_PREFIX_PAPERS}${id}`);
  return data ? JSON.parse(data) : null;
}

async function listPapersKV(): Promise<Paper[]> {
  const ids = await kv.smembers<string[]>(KV_PREFIX_PAPERS_LIST);
  const papers: Paper[] = [];
  for (const id of ids) {
    const paper = await getPaperKV(id);
    if (paper) papers.push(paper);
  }
  return papers.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

async function deletePaperKV(id: string): Promise<void> {
  await kv.del(`${KV_PREFIX_PAPERS}${id}`);
  await kv.srem(KV_PREFIX_PAPERS_LIST, id);
}

async function saveRecordKV(record: StudentRecord): Promise<void> {
  await kv.set(`${KV_PREFIX_RECORDS}${record.id}`, JSON.stringify(record));
}

async function getRecordKV(id: string): Promise<StudentRecord | null> {
  const data = await kv.get<string>(`${KV_PREFIX_RECORDS}${id}`);
  return data ? JSON.parse(data) : null;
}

async function getRecordsByPaperKV(paperId: string): Promise<StudentRecord[]> {
  // KV 中需要维护 paper -> records 的索引
  const keys = await kv.keys<string[]>(`${KV_PREFIX_RECORDS}*`);
  const records: StudentRecord[] = [];
  for (const key of keys) {
    const data = await kv.get<string>(key);
    if (data) {
      const record = JSON.parse(data) as StudentRecord;
      if (record.paperId === paperId) {
        records.push(record);
      }
    }
  }
  return records.sort((a, b) =>
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}
*/

// ============================================================
// In-Memory Storage (用于 Vercel，简单但数据不持久)
// ============================================================

async function savePaperMemory(paper: Paper): Promise<void> {
  memoryPapers.set(paper.id, paper);
}

async function getPaperMemory(id: string): Promise<Paper | null> {
  return memoryPapers.get(id) || null;
}

async function listPapersMemory(): Promise<Paper[]> {
  return Array.from(memoryPapers.values()).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

async function deletePaperMemory(id: string): Promise<void> {
  memoryPapers.delete(id);
}

async function saveRecordMemory(record: StudentRecord): Promise<void> {
  memoryRecords.set(record.id, record);
}

async function getRecordMemory(id: string): Promise<StudentRecord | null> {
  return memoryRecords.get(id) || null;
}

async function getRecordsByPaperMemory(paperId: string): Promise<StudentRecord[]> {
  return Array.from(memoryRecords.values())
    .filter(r => r.paperId === paperId)
    .sort((a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
}

// ============================================================
// File System Storage (仅用于本地开发)
// ============================================================

async function saveFile(paper: Paper): Promise<void> {
  if (isVercel) throw new Error('File system not available on Vercel');
  const { promises: fs } = await import('fs');
  const path = await import('path');
  const papersDir = path.join(process.cwd(), 'papers');

  try {
    await fs.mkdir(papersDir, { recursive: true });
  } catch {}

  const filePath = path.join(papersDir, `${paper.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(paper, null, 2), 'utf-8');
}

async function getFile(id: string): Promise<Paper | null> {
  if (isVercel) throw new Error('File system not available on Vercel');
  const { promises: fs } = await import('fs');
  const path = await import('path');
  const filePath = path.join(process.cwd(), 'papers', `${id}.json`);

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function listFiles(): Promise<Paper[]> {
  if (isVercel) throw new Error('File system not available on Vercel');
  const { promises: fs } = await import('fs');
  const path = await import('path');
  const papersDir = path.join(process.cwd(), 'papers');

  try {
    await fs.mkdir(papersDir, { recursive: true });
    const files = await fs.readdir(papersDir);
    const papers: Paper[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(papersDir, file);
        const data = await fs.readFile(filePath, 'utf-8');
        papers.push(JSON.parse(data));
      }
    }

    return papers.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

// ============================================================
// Unified API
// ============================================================

// 检测使用哪种存储
// 本地开发用文件系统，Vercel 用内存（或切换到 KV）
export async function savePaper(paper: Paper): Promise<void> {
  if (isVercel) {
    await savePaperMemory(paper);
    console.log('[Storage] Paper saved to memory (Vercel):', paper.id);
  } else {
    await saveFile(paper);
    console.log('[Storage] Paper saved to file (local):', paper.id);
  }
}

export async function getPaper(id: string): Promise<Paper | null> {
  if (isVercel) {
    return await getPaperMemory(id);
  } else {
    return await getFile(id);
  }
}

export async function listPapers(): Promise<Paper[]> {
  if (isVercel) {
    return await listPapersMemory();
  } else {
    return await listFiles();
  }
}

export async function deletePaper(id: string): Promise<void> {
  if (isVercel) {
    await deletePaperMemory(id);
  } else {
    if (!isVercel) {
      const { promises: fs } = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'papers', `${id}.json`);
      try {
        await fs.unlink(filePath);
      } catch {}
    }
  }
}

export async function saveRecord(record: StudentRecord): Promise<void> {
  if (isVercel) {
    await saveRecordMemory(record);
  } else {
    // Records 暂时只在内存中保存（本地开发时可选实现文件存储）
    await saveRecordMemory(record);
  }
}

export async function getRecord(id: string): Promise<StudentRecord | null> {
  return await getRecordMemory(id);
}

export async function getRecordsByPaper(paperId: string): Promise<StudentRecord[]> {
  return await getRecordsByPaperMemory(paperId);
}

export async function getRecordsByStudent(studentId: string): Promise<StudentRecord[]> {
  return Array.from(memoryRecords.values())
    .filter(r => r.studentId === studentId)
    .sort((a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
}

export async function listRecords(): Promise<StudentRecord[]> {
  return Array.from(memoryRecords.values())
    .sort((a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
}
