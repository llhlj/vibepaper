import { promises as fs } from 'fs';
import path from 'path';
import { Paper, StudentRecord } from '@/types/paper';

const PAPERS_DIR = path.join(process.cwd(), 'papers');
const RECORDS_DIR = path.join(process.cwd(), 'records');

// Ensure directories exist
async function ensureDirs() {
  try {
    await fs.access(PAPERS_DIR);
  } catch {
    await fs.mkdir(PAPERS_DIR, { recursive: true });
  }
  try {
    await fs.access(RECORDS_DIR);
  } catch {
    await fs.mkdir(RECORDS_DIR, { recursive: true });
  }
}

// Atomic write using temp file + rename
async function atomicWrite(filePath: string, data: string): Promise<void> {
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, data, 'utf-8');
  await fs.rename(tempPath, filePath);
}

// Paper operations
export async function savePaper(paper: Paper): Promise<void> {
  await ensureDirs();
  const filePath = path.join(PAPERS_DIR, `${paper.id}.json`);
  await atomicWrite(filePath, JSON.stringify(paper, null, 2));
}

export async function getPaper(id: string): Promise<Paper | null> {
  await ensureDirs();
  const filePath = path.join(PAPERS_DIR, `${id}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as Paper;
  } catch {
    return null;
  }
}

export async function listPapers(): Promise<Paper[]> {
  await ensureDirs();
  try {
    const files = await fs.readdir(PAPERS_DIR);
    const papers: Paper[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(PAPERS_DIR, file);
        const data = await fs.readFile(filePath, 'utf-8');
        papers.push(JSON.parse(data) as Paper);
      }
    }

    return papers.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export async function deletePaper(id: string): Promise<void> {
  await ensureDirs();
  const filePath = path.join(PAPERS_DIR, `${id}.json`);
  try {
    await fs.unlink(filePath);
  } catch {
    // File doesn't exist, ignore
  }
}

// Record operations
export async function saveRecord(record: StudentRecord): Promise<void> {
  await ensureDirs();
  const filePath = path.join(RECORDS_DIR, `${record.id}.json`);
  await atomicWrite(filePath, JSON.stringify(record, null, 2));
}

export async function getRecord(id: string): Promise<StudentRecord | null> {
  await ensureDirs();
  const filePath = path.join(RECORDS_DIR, `${id}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as StudentRecord;
  } catch {
    return null;
  }
}

export async function getRecordsByPaper(paperId: string): Promise<StudentRecord[]> {
  await ensureDirs();
  try {
    const files = await fs.readdir(RECORDS_DIR);
    const records: StudentRecord[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(RECORDS_DIR, file);
        const data = await fs.readFile(filePath, 'utf-8');
        const record = JSON.parse(data) as StudentRecord;
        if (record.paperId === paperId) {
          records.push(record);
        }
      }
    }

    return records.sort((a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  } catch {
    return [];
  }
}

export async function getRecordsByStudent(studentId: string): Promise<StudentRecord[]> {
  await ensureDirs();
  try {
    const files = await fs.readdir(RECORDS_DIR);
    const records: StudentRecord[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(RECORDS_DIR, file);
        const data = await fs.readFile(filePath, 'utf-8');
        const record = JSON.parse(data) as StudentRecord;
        if (record.studentId === studentId) {
          records.push(record);
        }
      }
    }

    return records.sort((a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  } catch {
    return [];
  }
}

export async function listRecords(): Promise<StudentRecord[]> {
  await ensureDirs();
  try {
    const files = await fs.readdir(RECORDS_DIR);
    const records: StudentRecord[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(RECORDS_DIR, file);
        const data = await fs.readFile(filePath, 'utf-8');
        records.push(JSON.parse(data) as StudentRecord);
      }
    }

    return records.sort((a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  } catch {
    return [];
  }
}
