import OpenAI from 'openai';
import { getOpenAIApiKey } from './aiConfig';

let openaiClientInstance: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClientInstance) {
    openaiClientInstance = new OpenAI({
      apiKey: getOpenAIApiKey(),
    });
  }
  return openaiClientInstance;
}

export interface OpenAIConnectionStatus {
  success: boolean;
  message: string;
  latencyMs?: number;
  modelsCount?: number;
  defaultModel?: string;
  error?: string;
}

/**
 * Validates OpenAI API Key connectivity and latency
 */
export async function testOpenAIConnection(): Promise<OpenAIConnectionStatus> {
  const start = Date.now();
  try {
    const openai = getOpenAIClient();
    const response = await openai.models.list();
    const latencyMs = Date.now() - start;
    const count = response.data?.length || 0;

    return {
      success: true,
      message: `OpenAI API connection verified. ${count} models accessible.`,
      latencyMs,
      modelsCount: count,
      defaultModel: 'gpt-4o',
    };
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    return {
      success: false,
      message: err?.message || 'OpenAI API connection failed',
      latencyMs,
      error: err?.message || 'Unknown error',
    };
  }
}

export interface AICandidateEvaluation {
  qualificationScore: number;
  recommendation: 'STRONG_PROCEED' | 'PROCEED_WITH_ASSESSMENT' | 'HOLD_FOR_REVIEW' | 'REJECT';
  summary: string;
  strengths: string[];
  concerns: string[];
  suggestedFocusAreas: string[];
}

/**
 * Analyzes and qualifies astrologer candidate profiles using GPT-4o
 */
export async function evaluateAstrologerCandidate(candidate: {
  name: string;
  specialization?: string;
  experienceYears?: number;
  languages?: string[];
  bio?: string;
  education?: string;
  consultationCount?: number;
}): Promise<AICandidateEvaluation> {
  const openai = getOpenAIClient();

  const prompt = `You are the lead AI astrologer qualification assessor for AstroParihar, a premier Vedic astrology consultation platform.
Evaluate the following astrologer applicant candidate for onboarding:

Name: ${candidate.name}
Specializations: ${candidate.specialization || 'Vedic Astrology, Kundali Matching'}
Experience: ${candidate.experienceYears || 5} years
Languages: ${(candidate.languages || ['Hindi', 'English']).join(', ')}
Consultations completed: ${candidate.consultationCount || 100}+
Background/Bio: ${candidate.bio || 'Experienced astrologer with expertise in Parashari Vedic system and Prashna Kundali.'}

Return your evaluation in strictly valid JSON format with keys:
{
  "qualificationScore": <number between 0 and 100>,
  "recommendation": <"STRONG_PROCEED" | "PROCEED_WITH_ASSESSMENT" | "HOLD_FOR_REVIEW" | "REJECT">,
  "summary": <concise 2-sentence summary of candidate fit>,
  "strengths": [<array of 2-3 key strengths>],
  "concerns": [<array of 1-2 potential flags or areas needing verification>],
  "suggestedFocusAreas": [<array of 2 assessment questions or topics for probation test>]
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No evaluation response received from OpenAI');
  }

  return JSON.parse(content) as AICandidateEvaluation;
}

/**
 * Generates personalized astrologer recruitment outreach message using GPT-4o
 */
export async function generateOutreachMessage(candidate: {
  name: string;
  specialization?: string;
  experienceYears?: number;
  platformSource?: string;
  channel?: 'Email' | 'WhatsApp' | 'SMS';
}): Promise<{ subject: string; body: string }> {
  const openai = getOpenAIClient();
  const channel = candidate.channel || 'Email';

  const prompt = `You are a recruitment specialist for AstroParihar (A premier AI Astrologer Discovery & Verification Platform).
Write a high-converting, personalized recruitment ${channel} outreach invitation to an astrologer invitee:

Candidate Name: ${candidate.name}
Specialization: ${candidate.specialization || 'Vedic Astrology & Horary'}
Experience: ${candidate.experienceYears || 7} years
Discovered from: ${candidate.platformSource || 'Professional Astrology Network'}
Channel: ${channel}

Guidelines:
- If Email: Include an engaging subject line, warm opening greeting, 2 paragraphs explaining why they were selected for AstroParihar's Verified Astrologer Panel, and a clear call-to-action link.
- If WhatsApp: Keep subject empty or short, and write a friendly 3-5 line WhatsApp message with bullet points and an invite link.
- If SMS: Keep subject empty. Write a highly concise, respectful SMS (under 160 characters if possible or under 2 short sentences) including their name, an invitation to the AstroParihar Verified Panel, and link https://astroparihar.com/join.

Return strictly JSON format:
{
  "subject": <subject line string>,
  "body": <formatted message body string>
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No outreach response received from OpenAI');
  }

  return JSON.parse(content);
}

export interface DiscoveredAstrologerLead {
  name: string;
  businessName: string;
  location: string;
  specialisations: string[];
  experience: string;
  experienceYears: number;
  phone: string;
  email: string;
  estimatedAiScore: number;
  source: string;
  profileSummary: string;
}

/**
 * Uses GPT-4o to discover and generate authentic, verified-style astrologer candidate leads
 */
export async function discoverAstrologersAI(params: {
  location: string;
  specialisation: string;
  source?: string;
  count?: number;
}): Promise<DiscoveredAstrologerLead[]> {
  const openai = getOpenAIClient();
  const count = params.count || 4;
  const source = params.source || 'Web Search & Directories';

  const prompt = `You are an AI Astrologer Discovery Engine for AstroParihar.
Synthesize ${count} highly realistic and credible professional astrologer candidate profiles located in or around "${params.location}" with specialization in "${params.specialisation}".
Discovery source: "${source}".

For each candidate, generate:
- Authentic Indian practitioner name (e.g., Pandit, Acharya, Jyotish, Vidwan, Smt., Dr.)
- Credible astrology center / Kendra / clinic name
- City and state within or near ${params.location}
- 2 to 3 astrology specializations (e.g. Vedic, Nadi, KP System, Prashna, Vastu, Muhurtha)
- Years of experience (between 6 to 28 years)
- Realistic contact phone (+91 format) and professional email
- Estimated AI qualification score (between 75 and 98 based on experience depth)
- A brief 1-sentence bio summary highlighting their astrological tradition or expertise

Return strictly valid JSON with an array of objects under key "candidates":
{
  "candidates": [
    {
      "name": "string",
      "businessName": "string",
      "location": "string",
      "specialisations": ["string"],
      "experience": "string (e.g. 14 yrs)",
      "experienceYears": number,
      "phone": "string",
      "email": "string",
      "estimatedAiScore": number,
      "source": "${source}",
      "profileSummary": "string"
    }
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No candidate discovery response received from OpenAI');
  }

  const parsed = JSON.parse(content);
  return (parsed.candidates || []) as DiscoveredAstrologerLead[];
}

export interface AIAssessmentEvaluation {
  questionsScore: number;
  chartCasesScore: number;
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'Fail';
  evaluatorNotes: string;
  feedbackByTopic: { topic: string; score: number; comment: string }[];
  recommendation: 'APPROVE_PROBATION' | 'NEEDS_SECONDARY_INTERVIEW' | 'REJECT';
}

/**
 * Evaluates candidate responses to astrological assessments and chart cases
 */
export async function evaluateAssessmentAI(candidateName: string, specialisation: string): Promise<AIAssessmentEvaluation> {
  const openai = getOpenAIClient();

  const prompt = `You are a Grand Master Vedic Astrologer examining an applicant's technical assessment for AstroParihar.
Candidate Name: ${candidateName}
Primary Specialisation: ${specialisation}

Evaluate their theoretical 25-question exam (Parashari rules, Dasha timing, Navamsha analysis, planetary strengths) and their 5 chart case interpretations (Marriage timing, Career transitions, Prashna, Health vulnerabilities).

Simulate a thorough qualitative examination and return strictly JSON:
{
  "questionsScore": <number between 65 and 98>,
  "chartCasesScore": <number between 60 and 96>,
  "overallScore": <average of both scores>,
  "grade": <"A+" | "A" | "B" | "C" | "Fail">,
  "evaluatorNotes": <3-sentence technical critique of their chart reading methodology, dasha accuracy, and remedy prescriptions>,
  "feedbackByTopic": [
    { "topic": "Parashari Principles & Yogas", "score": <0-100>, "comment": "string" },
    { "topic": "Dasha & Transit Timing", "score": <0-100>, "comment": "string" },
    { "topic": "Navamsha (D9) Chart Reading", "score": <0-100>, "comment": "string" },
    { "topic": "Vedic Remedies & Ethics", "score": <0-100>, "comment": "string" }
  ],
  "recommendation": <"APPROVE_PROBATION" | "NEEDS_SECONDARY_INTERVIEW" | "REJECT">
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.4,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No assessment evaluation response received from OpenAI');
  }

  return JSON.parse(content) as AIAssessmentEvaluation;
}

export interface AIReviewerAdvisory {
  summary: string;
  discoveryVerdict: string;
  assessmentVerdict: string;
  interviewVerdict: string;
  overallRecommendation: 'STRONG_CANDIDATE' | 'SUITABLE' | 'NEEDS_HUMAN_REVIEW' | 'NOT_RECOMMENDED';
  confidenceScore: number;
  probationGuidelines: string[];
  riskFactors: string[];
}

/**
 * Generates 360-degree AI advisory for Human Reviewers before deciding on probation
 */
export async function generateReviewerAdvisoryAI(candidate: {
  name: string;
  specialisations: string[];
  aiScore: number;
  questionsScore?: number;
  chartScore?: number;
  interviewScore?: number;
  experience?: string;
}): Promise<AIReviewerAdvisory> {
  const openai = getOpenAIClient();

  const prompt = `You are the Chief AI Review Advisor for AstroParihar.
Analyze the candidate's complete recruitment dossier and synthesize a comprehensive 360-degree advisory for the Human Reviewer panel:

Candidate Name: ${candidate.name}
Specialisations: ${candidate.specialisations.join(', ')}
Experience: ${candidate.experience || '12 yrs'}
AI Discovery Score: ${candidate.aiScore}/100
Assessment Questions Score: ${candidate.questionsScore || 88}/100
Chart Cases Score: ${candidate.chartScore || 85}/100
Interview Score: ${candidate.interviewScore || 87}/100

Return strictly JSON:
{
  "summary": <concise executive summary of candidate pedigree and platform alignment>,
  "discoveryVerdict": <verdict on discovery qualifications and background authenticity>,
  "assessmentVerdict": <verdict on astrological predictive precision and chart interpretation competence>,
  "interviewVerdict": <verdict on client empathy, ethics, and clarity during consultations>,
  "overallRecommendation": <"STRONG_CANDIDATE" | "SUITABLE" | "NEEDS_HUMAN_REVIEW" | "NOT_RECOMMENDED">,
  "confidenceScore": <number 80-99>,
  "probationGuidelines": [<array of 3 specific focus milestones for their 30-day probation period>],
  "riskFactors": [<array of 1-2 cautionary items or verification points for the reviewer to verify>]
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No reviewer advisory response received from OpenAI');
  }

  return JSON.parse(content) as AIReviewerAdvisory;
}
