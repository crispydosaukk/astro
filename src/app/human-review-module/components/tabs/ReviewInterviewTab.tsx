import React from 'react';
import AIScoreBadge from '@/components/ui/AIScoreBadge';
import type { ReviewCandidate } from '../ReviewWorkspace';
import { Bot, User, Clock } from 'lucide-react';

interface ReviewInterviewTabProps {
  candidate: ReviewCandidate;
}

const interviewTranscript = [
  {
    id: 'int-q-001',
    speaker: 'AI Interviewer',
    message: 'Welcome to the AstroParihar astrologer assessment interview. I will ask you a series of questions to understand your expertise and approach. Let\'s begin — could you tell me about your journey into Vedic astrology and what drew you to specialise in Prashna Jyotish?',
    timestamp: '10:02:14',
  },
  {
    id: 'int-a-001',
    speaker: 'Candidate',
    message: 'Thank you. I began my study of Jyotish under Pandit Subramaniam Iyer in Chennai in 2004. My initial focus was on natal chart analysis, but I became deeply interested in Prashna after witnessing its immediate practical utility. Prashna allows us to address urgent life questions without requiring an accurate birth time — which is particularly relevant in India where many people do not have reliable birth records. Over 18 years, I have handled over 2,000 Prashna consultations alongside my regular Vedic practice.',
    timestamp: '10:02:48',
  },
  {
    id: 'int-q-002',
    speaker: 'AI Interviewer',
    message: 'That is a compelling background. In your experience, how do you approach a situation where a client\'s chart shows contradictory indicators — for example, strong 7th house for marriage but a severely afflicted Venus?',
    timestamp: '10:05:22',
  },
  {
    id: 'int-a-002',
    speaker: 'Candidate',
    message: 'This is a very common scenario and requires careful synthesis. The 7th house and its lord, Venus as Karaka, and the Navamsha all speak to different dimensions of relationship. A strong 7th house with afflicted Venus often indicates a marriage that happens but with challenges — particularly around harmony and partnership quality. I always check the Navamsha Venus placement, the Dasha-Antardasha timing, and any remedial considerations. I would never give a binary yes/no — I explain the nuance clearly to the client and suggest appropriate timing and remedies.',
    timestamp: '10:06:15',
  },
  {
    id: 'int-q-003',
    speaker: 'AI Interviewer',
    message: 'How do you maintain professional boundaries with clients who become emotionally dependent on astrological consultations?',
    timestamp: '10:09:40',
  },
  {
    id: 'int-a-003',
    speaker: 'Candidate',
    message: 'This is an ethical matter I take very seriously. I maintain a clear consultation structure — I do not offer unlimited follow-ups, I set clear expectations at the start of each session, and I actively encourage clients to make their own decisions rather than wait for astrological confirmation for every choice. Astrology is a guidance tool, not a decision-making substitute. I have declined consultations where I felt a client was developing unhealthy dependency.',
    timestamp: '10:10:28',
  },
];

const interviewEvaluation = {
  overallScore: 90,
  duration: '28 minutes',
  questionsAsked: 8,
  dimensions: [
    { id: 'dim-knowledge', label: 'Astrology Knowledge Depth', score: 94 },
    { id: 'dim-comm', label: 'Communication Clarity', score: 91 },
    { id: 'dim-ethics', label: 'Professional Ethics', score: 95 },
    { id: 'dim-practical', label: 'Practical Application', score: 88 },
    { id: 'dim-client', label: 'Client Management', score: 90 },
    { id: 'dim-confidence', label: 'Subject Confidence', score: 89 },
  ],
  aiSummary: 'Candidate demonstrates exceptional depth of Vedic astrology knowledge with 18+ years of documented practice. Communication is clear, structured and client-centric. Ethical approach to professional boundaries is commendable. Strong practical application in Prashna Jyotish with detailed case experience. Highly recommended for probation placement.',
};

export default function ReviewInterviewTab({ candidate }: ReviewInterviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Interview summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-muted/40 rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-bold text-foreground">Interview Summary</h4>
            <AIScoreBadge score={candidate.interviewScore} size="md" showLabel />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-semibold flex items-center gap-1"><Clock size={12} />{interviewEvaluation.duration}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Questions Asked</span>
              <span className="font-semibold">{interviewEvaluation.questionsAsked}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">AI Recommendation</span>
              <span className="font-bold text-green-700">Strong Candidate</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {interviewEvaluation.dimensions.map(d => (
            <div key={d.id} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-40 flex-shrink-0">{d.label}</span>
              <div className="flex-1 progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${d.score}%` }} />
              </div>
              <AIScoreBadge score={d.score} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* AI Summary */}
      <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-2.5">
          <Bot size={16} className="text-blue-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-blue-900 mb-1">AI Interview Assessment Summary</p>
            <p className="text-sm text-blue-800 leading-relaxed">{interviewEvaluation.aiSummary}</p>
            <p className="text-xs text-blue-600 mt-2 font-medium italic">
              Note: This AI recommendation is advisory only. Human reviewer decision is final.
            </p>
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div>
        <h4 className="text-md font-bold text-foreground mb-4">Interview Transcript</h4>
        <div className="space-y-4">
          {interviewTranscript.map(entry => (
            <div
              key={entry.id}
              className={`flex gap-3 ${entry.speaker === 'Candidate' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                entry.speaker === 'AI Interviewer' ?'bg-blue-100 text-blue-700' :'terracotta-gradient text-white'
              }`}>
                {entry.speaker === 'AI Interviewer' ? <Bot size={14} /> : <User size={14} />}
              </div>
              <div className={`max-w-[80%] ${entry.speaker === 'Candidate' ? 'items-end' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold ${entry.speaker === 'AI Interviewer' ? 'text-blue-700' : 'text-primary'}`}>
                    {entry.speaker}
                  </span>
                  <span className="text-2xs text-muted-foreground font-mono">{entry.timestamp}</span>
                </div>
                <div className={`p-3.5 rounded-xl text-sm leading-relaxed ${
                  entry.speaker === 'AI Interviewer' ?'bg-blue-50 border border-blue-200 text-blue-900' :'bg-muted/60 border border-border text-foreground'
                }`}>
                  {entry.message}
                </div>
              </div>
            </div>
          ))}
          <div className="p-3 bg-muted/40 rounded-lg text-center text-xs text-muted-foreground">
            Showing 4 of 8 interview exchanges — <span className="text-primary font-semibold cursor-pointer hover:underline">View full transcript</span>
          </div>
        </div>
      </div>
    </div>
  );
}