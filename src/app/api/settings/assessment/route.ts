import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { THEORY_QUESTIONS } from '@/lib/theoryQuestions';

export const dynamic = 'force-dynamic';

const DEFAULT_CHART_CASES = [
  {
    id: 'case-k402',
    title: 'Blind Kundali Case Study #K-402 (Career & Business Crisis)',
    clientQuery: 'Severe career delays and mental restlessness over past 8 months despite hard work. Will my business venture launch successfully, and what spiritual remedies do you recommend?',
    lagna: 'Scorpio (Vrishchika) - Mars is Lagna lord with Digbala in 10th house (Leo)',
    moonSign: 'Capricorn (Makara) - Shravana Nakshatra',
    dasha: 'Saturn Mahadasha with Rahu Antardasha (Shani-Rahu chhidra dasha)',
    keyPlacements: 'Mars in 10th house (Leo) with Digbala; Sun in 11th house (Virgo) conferring income recovery; Saturn in 12th.',
    expectedObservations: 'Candidate must recognize Scorpio Lagna, Mars Digbala in 10th house, and identify the Saturn-Rahu dasha causing friction and timing of revival.',
    recommendedRemedies: 'Sattvic Shani & Rahu pacification, Hanuman Chalisa, Shiva puja, sesame oil lighting, charity, disciplined ethical counseling without fear-mongering.',
    enabled: true
  },
  {
    id: 'case-k508',
    title: 'Blind Kundali Case Study #K-508 (Delayed Marriage & Compatibility)',
    clientQuery: 'Candidate is 31 years old and experiencing recurring proposal cancellations and emotional friction. What does the 7th house and Navamsha (D9) indicate regarding marriage timing and partner nature?',
    lagna: 'Taurus (Vrishabha) - Venus is Lagna lord in 1st house (Malavya Pancha Mahapurusha Yoga)',
    moonSign: 'Cancer (Karka) - Pushya Nakshatra',
    dasha: 'Jupiter Mahadasha with Saturn Antardasha',
    keyPlacements: 'Mars in 7th house (Scorpio - Swa-kshetra Kuja Dosha with Ruchaka influence); Saturn aspecting 7th; Venus in D9 exalted in Pisces.',
    expectedObservations: 'Candidate must recognize Malavya Yoga in D1, evaluate 7th house Mars in Scorpio, identify cancellation factors, and verify D9 exalted Venus signifying a supportive spiritual spouse with delay.',
    recommendedRemedies: 'Parvati Swayamvara Puja, Katyayani Vrata, respecting women, offering white sweets on Friday, avoiding hasty impulsive decisions.',
    enabled: true
  }
];

export async function GET() {
  try {
    if (db) {
      const docRef = doc(db, 'settings', 'assessment_config');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return NextResponse.json({
          success: true,
          config: {
            useCustomQuestions: data.useCustomQuestions !== undefined ? Boolean(data.useCustomQuestions) : true,
            questionCount: Number(data.questionCount) || 15,
            customQuestions: Array.isArray(data.customQuestions) && data.customQuestions.length > 0 
              ? data.customQuestions 
              : THEORY_QUESTIONS,
            useCustomChartCases: data.useCustomChartCases !== undefined ? Boolean(data.useCustomChartCases) : true,
            chartCasesCount: Number(data.chartCasesCount) || 1,
            customChartCases: Array.isArray(data.customChartCases) && data.customChartCases.length > 0
              ? data.customChartCases
              : DEFAULT_CHART_CASES,
            passingThreshold: Number(data.passingThreshold) || 75,
            theoryWeight: Number(data.theoryWeight) || 35,
            chartCaseWeight: Number(data.chartCaseWeight) || 25,
            aiInterviewWeight: Number(data.aiInterviewWeight) || 40,
            updatedAt: data.updatedAt || new Date().toISOString()
          }
        });
      }
    }

    // Default configuration if not yet in database
    return NextResponse.json({
      success: true,
      config: {
        useCustomQuestions: true,
        questionCount: 15,
        customQuestions: THEORY_QUESTIONS,
        useCustomChartCases: true,
        chartCasesCount: 1,
        customChartCases: DEFAULT_CHART_CASES,
        passingThreshold: 75,
        theoryWeight: 35,
        chartCaseWeight: 25,
        aiInterviewWeight: 40,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Error fetching assessment settings:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch assessment settings',
      config: {
        useCustomQuestions: true,
        questionCount: 15,
        customQuestions: THEORY_QUESTIONS,
        useCustomChartCases: true,
        chartCasesCount: 1,
        customChartCases: DEFAULT_CHART_CASES,
        passingThreshold: 75,
        theoryWeight: 35,
        chartCaseWeight: 25,
        aiInterviewWeight: 40,
      }
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      useCustomQuestions = true,
      questionCount = 15,
      customQuestions = [],
      useCustomChartCases = true,
      chartCasesCount = 1,
      customChartCases = [],
      passingThreshold = 75,
      theoryWeight = 35,
      chartCaseWeight = 25,
      aiInterviewWeight = 40,
    } = body;

    const payload = {
      useCustomQuestions: Boolean(useCustomQuestions),
      questionCount: Math.max(1, Math.min(50, Number(questionCount) || 15)),
      customQuestions: Array.isArray(customQuestions) ? customQuestions : [],
      useCustomChartCases: Boolean(useCustomChartCases),
      chartCasesCount: Math.max(1, Math.min(10, Number(chartCasesCount) || 1)),
      customChartCases: Array.isArray(customChartCases) ? customChartCases : [],
      passingThreshold: Number(passingThreshold) || 75,
      theoryWeight: Number(theoryWeight) || 35,
      chartCaseWeight: Number(chartCaseWeight) || 25,
      aiInterviewWeight: Number(aiInterviewWeight) || 40,
      updatedAt: new Date().toISOString()
    };

    if (db) {
      const docRef = doc(db, 'settings', 'assessment_config');
      await setDoc(docRef, payload, { merge: true });
    }

    return NextResponse.json({
      success: true,
      message: 'Assessment configuration and questions saved successfully.',
      config: payload
    });
  } catch (error: any) {
    console.error('Error saving assessment settings:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to save assessment settings'
    }, { status: 500 });
  }
}
