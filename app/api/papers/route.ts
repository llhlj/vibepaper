import { NextRequest, NextResponse } from 'next/server';
import { getPaper, listPapers, deletePaper } from '@/lib/storage';

// GET /api/papers - List all papers or get specific paper
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const paper = await getPaper(id);
      if (!paper) {
        return NextResponse.json(
          { error: 'Paper not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(paper);
    }

    const papers = await listPapers();
    return NextResponse.json(papers);
  } catch (error) {
    console.error('Papers API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch papers' },
      { status: 500 }
    );
  }
}

// DELETE /api/papers - Delete a paper
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Paper ID required' },
        { status: 400 }
      );
    }

    await deletePaper(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Paper deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete paper' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
