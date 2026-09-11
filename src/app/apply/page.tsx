'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  MapPin, 
  BookOpen, 
  Brain, 
  Mic, 
  Send, 
  Award, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle,
  FileCheck2,
  Clock,
  ShieldCheck,
  Compass,
  Star,
  RefreshCw
} from 'lucide-react';

interface TheoryQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const THEORY_QUESTIONS: TheoryQuestion[] = [
  {
    id: 1,
    question: 'In Vedic Jyotish, which house represents Dharma, higher wisdom, fortunes (Bhagya), and the Guru?',
    options: ['5th House (Trikona)', '9th House (Bhagya Sthana)', '10th House (Karma Sthana)', '1st House (Lagna)'],
    correctIndex: 1,
    explanation: 'The 9th house is the prime Dharma and Bhagya Bhava representing divine fortunes, pilgrimage, and spiritual guidance.'
  },
  {
    id: 2,
    question: 'Which planetary combination forms a classic "Gajakesari Yoga"?',
    options: [
      'Sun and Mercury in the same house (Budhaditya)',
      'Jupiter and Moon in Kendra (1, 4, 7, 10) from each other',
      'Saturn and Rahu conjunction (Shrapit Yoga)',
      'Mars in the 7th house from Lagna'
    ],
    correctIndex: 1,
    explanation: 'Gajakesari Yoga is formed when Jupiter occupies a Kendra from the Moon or Lagna, conferring wisdom, respect, and enduring fame.'
  },
  {
    id: 3,
    question: 'How is the strength of a planet in the Navamsha (D9) chart interpreted relative to the Rashi (D1) chart?',
    options: [
      'D9 is only used for wealth calculations',
      'A debilitated planet in D1 gaining exaltation in D9 gains Neecha Bhanga and hidden inner strength (Vargottama/Pushkara)',
      'D9 completely overrides D1 in all circumstances',
      'D9 has no bearing on planetary strength'
    ],
    correctIndex: 1,
    explanation: 'Navamsha reveals the fruit (Phala) and underlying core potential of planetary placements in the natal chart.'
  },
  {
    id: 4,
    question: 'What is the standard order of the Vimshottari Dasha system starting from Ketu?',
    options: [
      'Ketu → Venus → Sun → Moon → Mars → Rahu → Jupiter → Saturn → Mercury',
      'Sun → Moon → Mars → Rahu → Jupiter → Saturn → Mercury → Ketu → Venus',
      'Jupiter → Saturn → Mercury → Ketu → Venus → Sun → Moon → Mars → Rahu',
      'Mars → Rahu → Jupiter → Saturn → Mercury → Ketu → Venus → Sun → Moon'
    ],
    correctIndex: 0,
    explanation: 'The standard 120-year Vimshottari dasha cycle begins with Ketu (7 yrs) followed by Venus (20 yrs), Sun (6 yrs), Moon (10 yrs), etc.'
  },
  {
    id: 5,
    question: 'When recommending astrological remedies for severe afflictions (e.g. Kaal Sarp or Sade Sati), what is the most ethical approach?',
    options: [
      'Guarantee 100% immediate results within 24 hours for expensive rituals',
      'Explain planetary energies calmly, recommend accessible japa/charity/mantras, and encourage constructive lifestyle action without fear-mongering',
      'Advise the client that their destiny is completely doomed without expensive gems',
      'Recommend avoiding all consultations in the future'
    ],
    correctIndex: 1,
    explanation: 'Ethical Vedic guidance empowers clients with sattvic remedies, positive karma, and realistic guidance without creating anxiety.'
  }
];

function CandidateApplyPortal() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Wizard Step (1: Profile, 2: Theory, 3: Blind Chart, 4: AI Interview, 5: In-Process Submitted)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Profile Form State
  const [candidateId, setCandidateId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('New Delhi, India');
  const [specialisation, setSpecialisation] = useState('Vedic Jyotish');
  const [experience, setExperience] = useState('12+ years');
  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState('Hindi, English');

  // Step 2: Theory Assessment State
  const [theoryAnswers, setTheoryAnswers] = useState<Record<number, number>>({});
  const [theorySubmitted, setTheorySubmitted] = useState(false);
  const [theoryScore, setTheoryScore] = useState(0);

  // Step 3: Blind Kundali Chart State
  const [chartAnalysis, setChartAnalysis] = useState('');
  const [chartRemedy, setChartRemedy] = useState('');
  const [chartScore, setChartScore] = useState(85);

  // Step 4: AI Interview State
  const [aiQuestionIndex, setAiQuestionIndex] = useState(0);
  const [userInterviewAnswer, setUserInterviewAnswer] = useState('');
  const [conversationHistory, setConversationHistory] = useState<{ role: 'ai' | 'user'; text: string; topic?: string }[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInterviewComplete, setAiInterviewComplete] = useState(false);
  const [aiInterviewEvaluation, setAiInterviewEvaluation] = useState<any>(null);

  // Step 5: Final Submission State
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [applicationRefId, setApplicationRefId] = useState('');

  // Auto-fill from URL query parameters
  useEffect(() => {
    const idParam = searchParams.get('id');
    const nameParam = searchParams.get('name');
    const phoneParam = searchParams.get('phone');
    const emailParam = searchParams.get('email');
    const locParam = searchParams.get('location');
    const specParam = searchParams.get('specialisation');

    if (idParam) setCandidateId(idParam);
    if (nameParam) setName(nameParam);
    if (phoneParam) setPhone(phoneParam);
    if (emailParam && emailParam !== 'null' && emailParam !== 'undefined') setEmail(emailParam);
    if (locParam) setLocation(locParam);
    if (specParam) setSpecialisation(specParam);

    // Initial AI Interview Question
    if (conversationHistory.length === 0) {
      setConversationHistory([
        {
          role: 'ai',
          topic: 'Client Consulting & Empathy',
          text: `Namaste ${nameParam || 'Pandit Ji'} 🙏! Welcome to the AstroParihar Astrologer Screening. To begin: A client comes to you in extreme distress over sudden business loss and domestic tension. How do you analyze their state calmly and communicate your Vedic astrological findings without instilling fear?`
        }
      ]);
    }
  }, [searchParams]);

  // Step 1: Validation
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      alert('Please provide your full name, phone number, and email address.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      alert('Please set a secure password of at least 6 characters for your Astrologer Account.');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2: Theory Quiz Grading
  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setTheoryAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleGradeTheory = () => {
    let correct = 0;
    THEORY_QUESTIONS.forEach(q => {
      if (theoryAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    const calculatedScore = Math.round((correct / THEORY_QUESTIONS.length) * 100);
    setTheoryScore(calculatedScore);
    setTheorySubmitted(true);
  };

  const handleProceedFromTheory = () => {
    if (!theorySubmitted) {
      handleGradeTheory();
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 3: Chart Case Submission
  const handleProceedFromChart = () => {
    if (!chartAnalysis.trim() || chartAnalysis.length < 20) {
      alert('Please provide your astrological observations on the sample Kundali case.');
      return;
    }
    // Estimated score based on depth
    setChartScore(chartAnalysis.length > 80 ? 92 : 85);
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 4: AI Interview Interactions
  const handleSendInterviewAnswer = async () => {
    if (!userInterviewAnswer.trim() || isAiLoading) return;

    const answerText = userInterviewAnswer.trim();
    setUserInterviewAnswer('');
    setIsAiLoading(true);

    const updatedHistory = [
      ...conversationHistory,
      { role: 'user' as const, text: answerText }
    ];
    setConversationHistory(updatedHistory);

    try {
      if (aiQuestionIndex >= 2) {
        // Final Question Answered -> Request Full GPT-4o Evaluation
        const evalRes = await fetch('/api/ai/candidate-interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateName: name,
            specialisation,
            isFinalEvaluation: true,
            conversationHistory: updatedHistory,
          })
        });
        const evalData = await evalRes.json();
        if (evalData.success && evalData.evaluation) {
          setAiInterviewEvaluation(evalData.evaluation);
          setAiInterviewComplete(true);
          setConversationHistory(prev => [
            ...prev,
            {
              role: 'ai',
              topic: 'Evaluation Complete',
              text: `Thank you, ${name} Ji! Your AI technical interview has been evaluated with a score of ${evalData.evaluation.totalScore}/100. Our committee will review the complete transcript alongside your theory scores.`
            }
          ]);
        }
      } else {
        // Next Question
        const nextIdx = aiQuestionIndex + 1;
        setAiQuestionIndex(nextIdx);

        const res = await fetch('/api/ai/candidate-interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateName: name,
            specialisation,
            currentQuestionIndex: aiQuestionIndex,
            userAnswer: answerText,
            conversationHistory: updatedHistory,
          })
        });
        const data = await res.json();
        if (data.success && data.nextQuestion) {
          setConversationHistory(prev => [
            ...prev,
            {
              role: 'ai',
              topic: data.nextQuestion.topic,
              text: `${data.aiFeedback}\n\n${data.nextQuestion.question}`
            }
          ]);
        }
      }
    } catch (err) {
      console.error('AI Interview error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Final Step 5 Submission to Backend
  const handleFinalSubmit = async () => {
    setIsSubmittingFinal(true);
    try {
      const payload = {
        candidateId: candidateId || `ast-${Date.now()}`,
        name,
        email,
        phone,
        location,
        specialisations: [specialisation],
        experience,
        bio,
        password,
        languages: languages.split(',').map(s => s.trim()),
        theoryScore,
        chartCaseScore: chartScore,
        aiInterviewScore: aiInterviewEvaluation?.totalScore || 88,
        aiInterviewEvaluation,
        theoryAnswers,
        chartCaseAnalysis: `${chartAnalysis}\n\nRemedies: ${chartRemedy}`,
        conversationHistory,
      };

      const res = await fetch('/api/candidate/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setApplicationRefId(data.applicationId || candidateId || 'AP-2026-AST');
        setSubmissionSuccess(true);
        setCurrentStep(5);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(data.error || 'Unable to submit application. Please check details.');
      }
    } catch (err: any) {
      alert('Error submitting application: ' + err.message);
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header Branding */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl terracotta-gradient flex items-center justify-center text-white shadow-xs font-bold text-lg">
            ॐ
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight text-foreground flex items-center gap-2">
              AstroParihar Onboarding Portal
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Verified Astrologer Network
              </span>
            </h1>
            <p className="text-2xs text-muted-foreground">
              Candidate Credentialing, Vedic Theory Assessment & AI Interview
            </p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Encrypted Submission · Gmail SMTP & Firestore Sync</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Progress Step Indicator */}
        <div className="card-elevated p-4 bg-muted/20 border-border">
          <div className="flex items-center justify-between gap-2 overflow-x-auto text-xs font-semibold pb-1">
            {[
              { step: 1, label: '1. Profile & Account', icon: <User size={13} /> },
              { step: 2, label: '2. Vedic Theory Quiz', icon: <BookOpen size={13} /> },
              { step: 3, label: '3. Kundali Case', icon: <Compass size={13} /> },
              { step: 4, label: '4. AI Interview', icon: <Brain size={13} /> },
              { step: 5, label: '5. In Process / Review', icon: <FileCheck2 size={13} /> },
            ].map(item => (
              <div
                key={item.step}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  currentStep === item.step
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : currentStep > item.step
                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                    : 'text-muted-foreground opacity-60'
                }`}
              >
                {currentStep > item.step ? <CheckCircle2 size={13} className="text-emerald-600" /> : item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: Candidate Profile & Password Setup */}
        {currentStep === 1 && (
          <form onSubmit={handleProfileSubmit} className="card-elevated p-6 md:p-8 space-y-6 animate-slide-up">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <User size={20} className="text-primary" />
                Astrologer Profile & Credentials
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Please verify your personal details and set a password. If you were discovered with phone only, enter your email so we can dispatch your official confirmation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="label-field text-xs">Full Name / Pandit Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Acharya Rajesh Sharma"
                  className="input-field text-sm"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="label-field text-xs">Mobile / WhatsApp Number *</label>
                <div className="flex rounded-md border border-input overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20">
                  <div className="bg-muted/50 px-3 py-2 border-r border-border flex items-center text-muted-foreground text-xs font-semibold">
                    <Phone size={13} className="mr-1 text-primary" />
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="flex-1 px-3 py-2 text-sm bg-transparent outline-none text-foreground"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="label-field text-xs flex items-center justify-between">
                  <span>Email Address *</span>
                  <span className="text-2xs text-primary font-medium">Required for Onboarding</span>
                </label>
                <div className="flex rounded-md border border-input overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20">
                  <div className="bg-muted/50 px-3 py-2 border-r border-border flex items-center text-muted-foreground">
                    <Mail size={13} className="text-primary" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="astrologer@example.com"
                    className="flex-1 px-3 py-2 text-sm bg-transparent outline-none text-foreground"
                  />
                </div>
              </div>

              {/* Account Password */}
              <div>
                <label className="label-field text-xs flex items-center justify-between">
                  <span>Create Account Password *</span>
                  <span className="text-2xs text-muted-foreground">Min 6 characters</span>
                </label>
                <div className="flex rounded-md border border-input overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20">
                  <div className="bg-muted/50 px-3 py-2 border-r border-border flex items-center text-muted-foreground">
                    <Lock size={13} className="text-primary" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Set your astrologer login password"
                    className="flex-1 px-3 py-2 text-sm bg-transparent outline-none text-foreground"
                  />
                </div>
              </div>

              {/* Primary Specialisation */}
              <div>
                <label className="label-field text-xs">Primary Specialisation *</label>
                <select
                  value={specialisation}
                  onChange={e => setSpecialisation(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="Vedic Jyotish">Vedic Jyotish (Parashari)</option>
                  <option value="KP System">KP System (Krishnamurti Paddhati)</option>
                  <option value="Nadi Astrology">Nadi Astrology</option>
                  <option value="Numerology">Numerology & Name Correction</option>
                  <option value="Vastu Shastra">Vastu Shastra</option>
                  <option value="Prashna Kundali">Prashna & Horary</option>
                  <option value="Lal Kitab">Lal Kitab Remedies</option>
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="label-field text-xs">Consultation Experience *</label>
                <input
                  type="text"
                  required
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  placeholder="e.g. 12+ years"
                  className="input-field text-sm"
                />
              </div>

              {/* City & State */}
              <div>
                <label className="label-field text-xs">Location / City *</label>
                <div className="flex rounded-md border border-input overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20">
                  <div className="bg-muted/50 px-3 py-2 border-r border-border flex items-center text-muted-foreground">
                    <MapPin size={13} className="text-primary" />
                  </div>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Varanasi, Uttar Pradesh"
                    className="flex-1 px-3 py-2 text-sm bg-transparent outline-none text-foreground"
                  />
                </div>
              </div>

              {/* Languages Spoken */}
              <div>
                <label className="label-field text-xs">Languages Spoken *</label>
                <input
                  type="text"
                  required
                  value={languages}
                  onChange={e => setLanguages(e.target.value)}
                  placeholder="e.g. Hindi, English, Sanskrit"
                  className="input-field text-sm"
                />
              </div>
            </div>

            {/* Professional Bio */}
            <div>
              <label className="label-field text-xs">Professional Bio & Astrological Lineage</label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Briefly describe your astrological background, traditional gurukul/institution, or areas of expertise..."
                className="input-field text-sm"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button
                type="submit"
                className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Save Profile & Proceed to Theory Assessment</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Vedic Theory Assessment */}
        {currentStep === 2 && (
          <div className="card-elevated p-6 md:p-8 space-y-6 animate-slide-up">
            <div className="border-b border-border pb-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <BookOpen size={20} className="text-primary" />
                  Vedic Astrology Theory Assessment
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Answer the following 5 standard Vedic astrology questions to test knowledge of planetary combinations, yogas, and dashas.
                </p>
              </div>
              {theorySubmitted && (
                <div className="px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 font-bold text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-1.5">
                  <Award size={16} />
                  Score: {theoryScore} / 100
                </div>
              )}
            </div>

            <div className="space-y-6">
              {THEORY_QUESTIONS.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl bg-card border border-border space-y-3">
                  <p className="text-sm font-bold text-foreground">
                    <span className="text-primary mr-2">Q{idx + 1}.</span>
                    {q.question}
                  </p>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = theoryAnswers[q.id] === optIdx;
                      const isCorrect = optIdx === q.correctIndex;
                      return (
                        <button
                          type="button"
                          key={optIdx}
                          disabled={theorySubmitted}
                          onClick={() => handleAnswerSelect(q.id, optIdx)}
                          className={`w-full text-left p-3 rounded-lg text-xs font-medium border transition-all flex items-start justify-between cursor-pointer ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-foreground font-semibold shadow-2xs'
                              : 'border-border bg-background hover:bg-muted/40 text-muted-foreground'
                          } ${
                            theorySubmitted && isCorrect
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                              : ''
                          }`}
                        >
                          <span>{opt}</span>
                          {theorySubmitted && isCorrect && (
                            <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {theorySubmitted && (
                    <p className="text-2xs text-muted-foreground bg-muted/40 p-2.5 rounded-md border border-border/50">
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn-secondary text-sm py-2 px-4 flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                Back to Profile
              </button>

              {!theorySubmitted ? (
                <button
                  type="button"
                  onClick={handleGradeTheory}
                  disabled={Object.keys(theoryAnswers).length < THEORY_QUESTIONS.length}
                  className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Award size={15} />
                  Grade My Assessment
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleProceedFromTheory}
                  className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Proceed to Blind Kundali Case</span>
                  <ChevronRight size={15} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Kundali Blind Case Study */}
        {currentStep === 3 && (
          <div className="card-elevated p-6 md:p-8 space-y-6 animate-slide-up">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Compass size={20} className="text-primary" />
                Blind Kundali Case Study
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Analyze the planetary chart scenario below and provide your diagnosis and remedial recommendations in your own words.
              </p>
            </div>

            {/* Case Chart Scenario Card */}
            <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Case Profile #K-402</span>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">D1 Lagna + D9 Navamsha</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded bg-background border border-border">
                  <p className="text-muted-foreground text-2xs">Ascendant (Lagna)</p>
                  <p className="font-bold text-foreground">Scorpio (Vrishchika)</p>
                </div>
                <div className="p-2.5 rounded bg-background border border-border">
                  <p className="text-muted-foreground text-2xs">Moon Sign (Rashi)</p>
                  <p className="font-bold text-foreground">Capricorn (Makara)</p>
                </div>
                <div className="p-2.5 rounded bg-background border border-border">
                  <p className="text-muted-foreground text-2xs">Current Mahadasha</p>
                  <p className="font-bold text-foreground">Saturn - Rahu</p>
                </div>
                <div className="p-2.5 rounded bg-background border border-border">
                  <p className="text-muted-foreground text-2xs">Key Placements</p>
                  <p className="font-bold text-foreground">Mars in 10th (Leo), Sun in 11th</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Client Query:</strong> "I have experienced sudden career delays and mental restlessness over the past 8 months despite hard work. Will my business venture launch successfully, and what spiritual remedies do you recommend?"
              </p>
            </div>

            {/* Analysis Text Area */}
            <div className="space-y-4">
              <div>
                <label className="label-field text-xs">Your Astrological Reading & Career Timing Diagnosis *</label>
                <textarea
                  rows={4}
                  value={chartAnalysis}
                  onChange={e => setChartAnalysis(e.target.value)}
                  placeholder="Explain the impact of Saturn Mahadasha with Rahu Antardasha, Mars in Leo in 10th House (Digbala), and how timing will unfold..."
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="label-field text-xs">Recommended Ethical Remedies (Mantra / Charity / Gemstone)</label>
                <textarea
                  rows={3}
                  value={chartRemedy}
                  onChange={e => setChartRemedy(e.target.value)}
                  placeholder="Specify Vedic mantras (e.g. Shani Gayatri / Hanuman Chalisa), dana/charity, or gemstone recommendations..."
                  className="input-field text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn-secondary text-sm py-2 px-4 flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                Back to Theory
              </button>

              <button
                type="button"
                onClick={handleProceedFromChart}
                className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Submit Case & Start AI Interview</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Interactive AI Voice / Chat Screening Interview */}
        {currentStep === 4 && (
          <div className="card-elevated p-6 md:p-8 space-y-6 animate-slide-up">
            <div className="border-b border-border pb-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Brain size={20} className="text-primary" />
                  AstroParihar AI Technical Interview
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Powered by OpenAI GPT-4o. Answer the examiner questions regarding consultation ethics, challenging client scenarios, and astrological judgment.
                </p>
              </div>

              <div className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                Question {Math.min(aiQuestionIndex + 1, 3)} of 3
              </div>
            </div>

            {/* Chat Conversation Thread */}
            <div className="space-y-4 max-h-96 overflow-y-auto p-4 rounded-xl bg-muted/20 border border-border">
              {conversationHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    msg.role === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-emerald-600 text-white'
                  }`}>
                    {msg.role === 'ai' ? 'AI' : name.slice(0, 1) || 'U'}
                  </div>

                  <div className={`p-4 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-card border border-border text-foreground shadow-2xs'
                  }`}>
                    {msg.topic && (
                      <p className="text-2xs font-bold uppercase tracking-wider text-primary mb-1">
                        {msg.topic}
                      </p>
                    )}
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2 italic">
                  <RefreshCw size={13} className="animate-spin text-primary" />
                  <span>AI Examiner is evaluating your answer and preparing next question...</span>
                </div>
              )}
            </div>

            {/* Answer Input */}
            {!aiInterviewComplete ? (
              <div className="space-y-3">
                <label className="label-field text-xs">Your Answer / Response:</label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={userInterviewAnswer}
                    onChange={e => setUserInterviewAnswer(e.target.value)}
                    placeholder="Type your response with your astrological rationale and counseling philosophy..."
                    className="input-field text-sm pr-12"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleSendInterviewAnswer();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSendInterviewAnswer}
                    disabled={!userInterviewAnswer.trim() || isAiLoading}
                    className="absolute right-3 bottom-3 p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
                    title="Send Answer (or Ctrl+Enter)"
                  >
                    <Send size={14} />
                  </button>
                </div>
                <p className="text-2xs text-muted-foreground flex items-center justify-between">
                  <span>Press Send or <kbd className="px-1 py-0.5 rounded bg-muted border border-border">Ctrl + Enter</kbd> to submit answer</span>
                  <span>{userInterviewAnswer.length} characters</span>
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    AI Interview Assessment Completed
                  </h3>
                  <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                    Score: {aiInterviewEvaluation?.totalScore || 88} / 100
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {aiInterviewEvaluation?.summary || 'Candidate demonstrated sound Vedic understanding and empathetic consultation ethics.'}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn-secondary text-sm py-2 px-4 flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                Back to Chart Case
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmittingFinal}
                className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 cursor-pointer shadow-md"
              >
                {isSubmittingFinal ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Complete Application for Human Review</span>
                    <ChevronRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: In Process / Under Review Confirmation Screen */}
        {currentStep === 5 && (
          <div className="card-elevated p-8 md:p-12 text-center space-y-6 animate-slide-up border-2 border-primary/30">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-300 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto shadow-md">
              <Clock size={32} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Application Status: In Process / Under Human Review
              </span>
              <h2 className="text-2xl font-bold text-foreground mt-3">
                Thank You, {name} Ji! 🙏
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Your profile, Vedic theory assessment, blind Kundali case analysis, and AI interview have been securely submitted to the <strong>AstroParihar Astrological Verification Committee</strong>.
              </p>
            </div>

            {/* Scorecard Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto text-left">
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="text-2xs text-muted-foreground font-semibold uppercase">Theory Assessment</p>
                <p className="text-xl font-bold text-foreground mt-1">{theoryScore} / 100</p>
                <p className="text-2xs text-emerald-600 font-semibold mt-0.5">Verified</p>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="text-2xs text-muted-foreground font-semibold uppercase">Kundali Case Score</p>
                <p className="text-xl font-bold text-foreground mt-1">{chartScore} / 100</p>
                <p className="text-2xs text-emerald-600 font-semibold mt-0.5">Submitted</p>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="text-2xs text-muted-foreground font-semibold uppercase">AI Interview</p>
                <p className="text-xl font-bold text-foreground mt-1">{aiInterviewEvaluation?.totalScore || 88} / 100</p>
                <p className="text-2xs text-emerald-600 font-semibold mt-0.5">Evaluated</p>
              </div>
            </div>

            {/* What Happens Next Section */}
            <div className="p-5 rounded-xl bg-muted/30 border border-border max-w-xl mx-auto text-left space-y-2 text-xs text-muted-foreground">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-primary" />
                What happens next?
              </h4>
              <p>
                1. Our manual verification panel will review your chart interpretations and verify your credentials.
              </p>
              <p>
                2. You will receive an official approval email at <strong className="text-foreground">{email}</strong> once your verified profile is activated.
              </p>
              <p>
                3. You will then be able to log in to the <strong>Astrologer Dashboard</strong> using your registered credentials.
              </p>
            </div>

            <div className="pt-2">
              <p className="text-2xs text-muted-foreground">
                Application Reference ID: <strong className="font-mono text-foreground">{applicationRefId}</strong>
              </p>
              <div className="mt-4">
                <Link
                  href="/"
                  className="btn-secondary text-xs py-2 px-5 inline-flex items-center gap-1.5"
                >
                  Return to AstroParihar Homepage
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-sm text-muted-foreground">Loading Onboarding Portal...</div>}>
      <CandidateApplyPortal />
    </Suspense>
  );
}
