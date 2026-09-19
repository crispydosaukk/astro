import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Firestore db not initialized' });
    }
    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get('id');

    if (targetId) {
      const docSnap = await getDocs(collection(db, 'candidates'));
      let found: any = null;
      docSnap.forEach(d => {
        if (d.id === targetId) found = { id: d.id, ...d.data() };
      });
      return NextResponse.json({ candidate: found });
    }

    const snap = await getDocs(collection(db, 'candidates'));
    const candidates: any[] = [];
    snap.forEach(d => {
      candidates.push({ id: d.id, ...d.data() });
    });
    return NextResponse.json({
      count: candidates.length,
      candidates: candidates.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        appliedAt: c.appliedAt,
        theoryScore: c.theoryScore,
        chartCaseScore: c.chartCaseScore,
        aiInterviewScore: c.aiInterviewScore,
        aiScore: c.aiScore,
        chartCaseAnalysis: c.chartCaseAnalysis ? c.chartCaseAnalysis.slice(0, 100) : 'none',
        hasAnswers: Boolean(c.theoryAnswers),
        answersCount: c.theoryAnswers ? Object.keys(c.theoryAnswers).length : 0,
        hasQuestionsList: Boolean(c.theoryQuestionsList && c.theoryQuestionsList.length > 0),
        questionsCount: c.theoryQuestionsList ? c.theoryQuestionsList.length : 0,
        hasConversation: Boolean(c.conversationHistory && c.conversationHistory.length > 0),
        conversationCount: c.conversationHistory ? c.conversationHistory.length : 0,
      }))
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
