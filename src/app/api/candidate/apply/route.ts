import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { sendSmtpEmail } from '@/lib/emailSender';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      candidateId,
      name,
      email,
      phone,
      whatsapp,
      location,
      source,
      campaignName,
      campaign,
      // Mandatory Documents
      aadhaarNumber = '',
      aadhaarDocument = '',
      aadhaarFileName = '',
      panNumber = '',
      panDocument = '',
      panFileName = '',
      // Optional Supporting Documents (Astro certificates, experience letters, etc.)
      otherDocuments = [],
      specialisations = ['Vedic Jyotish'],
      experience = '10+ years',
      bio = '',
      learningBackground = '',
      courseDetails = '',
      idProofType = 'aadhaar',
      idProofNumber = '',
      idProofDocument = '',
      languages = ['Hindi', 'English'],
      theoryScore = 0,
      chartCaseScore = 0,
      aiInterviewScore = 0,
      aiInterviewEvaluation = null,
      theoryAnswers = {},
      theoryQuestionsList = [],
      chartCaseAnalysis = '',
      chartRemedy = '',
      chartEvaluation = null,
      chartCaseTitle = '',
      chartCaseLagna = '',
      chartCaseQuery = '',
      chartCasePlacements = [],
      conversationHistory = [],
      interviewDurationSeconds = 0,
      interviewDurationFormatted = '',
      assessmentDurationSeconds = 0,
      assessmentDurationFormatted = '',
      assessmentLanguage = 'en',
      // Dynamic AI Score & Assessment Settings
      passingThreshold = 75,
      theoryWeight = 35,
      chartCaseWeight = 25,
      aiInterviewWeight = 40,
      isAiDynamicQuestions = false,
      questionCount = 5,
      // Anti-Cheating & Proctoring Metadata
      tabViolations = 0,
      proctorLogs = [],
      isDisqualified = false,
      disqualificationReason = '',
    } = body;

    if (!name || !phone) {
      return NextResponse.json({
        success: false,
        error: 'Candidate name and phone number are required',
      }, { status: 400 });
    }

    const effectiveId = candidateId || `ast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Check if candidate already exists in Firestore to retain existing source/campaign details
    let resolvedSource = source || '';
    let resolvedCampaignName = campaignName || campaign || '';

    if (effectiveId && db) {
      try {
        const existingCandSnap = await getDoc(doc(db, 'candidates', effectiveId));
        if (existingCandSnap.exists()) {
          const existingData = existingCandSnap.data();
          if (!resolvedSource && existingData.source) {
            resolvedSource = existingData.source;
          }
          if (!resolvedCampaignName && (existingData.campaignName || existingData.campaign)) {
            resolvedCampaignName = existingData.campaignName || existingData.campaign;
          }
        }
      } catch (err) {
        console.warn('Could not read existing candidate doc for campaign preservation:', err);
      }
    }

    // Dynamic Weighted Composite Score Calculation
    const totalWeight = (Number(theoryWeight) || 35) + (Number(chartCaseWeight) || 25) + (Number(aiInterviewWeight) || 40);
    const normalizedTheoryWeight = (Number(theoryWeight) || 35) / totalWeight;
    const normalizedChartWeight = (Number(chartCaseWeight) || 25) / totalWeight;
    const normalizedInterviewWeight = (Number(aiInterviewWeight) || 40) / totalWeight;

    const safeTheory = typeof theoryScore === 'number' && !isNaN(theoryScore) ? theoryScore : Number(theoryScore) || 0;
    const safeChart = typeof chartCaseScore === 'number' && !isNaN(chartCaseScore) ? chartCaseScore : Number(chartCaseScore) || 0;
    const safeInterview = typeof aiInterviewScore === 'number' && !isNaN(aiInterviewScore) ? aiInterviewScore : Number(aiInterviewScore) || 0;

    const calculatedOverall = Math.round(
      (safeTheory * normalizedTheoryWeight) + 
      (safeChart * normalizedChartWeight) + 
      (safeInterview * normalizedInterviewWeight)
    );
    const overallScore = (!isNaN(calculatedOverall) && calculatedOverall >= 0) ? calculatedOverall : 0;

    const isQualifiedByThreshold = !isDisqualified && (overallScore >= (Number(passingThreshold) || 75));

    // Handle large base64 ID document to avoid exceeding Firestore 1MB limit
    const safeIdProofDoc = (typeof idProofDocument === 'string' && idProofDocument.length > 500000)
      ? idProofDocument.slice(0, 500000)
      : idProofDocument;

    const safeAadhaarDoc = (typeof aadhaarDocument === 'string' && aadhaarDocument.length > 500000)
      ? aadhaarDocument.slice(0, 500000)
      : aadhaarDocument || (idProofType === 'aadhaar' ? safeIdProofDoc : '');

    const safePanDoc = (typeof panDocument === 'string' && panDocument.length > 500000)
      ? panDocument.slice(0, 500000)
      : panDocument || (idProofType === 'pan' ? safeIdProofDoc : '');

    const safeOtherDocs = Array.isArray(otherDocuments)
      ? otherDocuments.slice(0, 6).map((d: any, idx: number) => ({
          id: d.id || `doc-${Date.now()}-${idx}`,
          title: d.title || d.name || 'Supporting Document',
          category: d.category || 'Professional Credential',
          document: (typeof d.document === 'string' && d.document.length > 400000) ? d.document.slice(0, 400000) : (d.document || d.fileUrl || ''),
          fileUrl: (typeof d.document === 'string' && d.document.length > 400000) ? d.document.slice(0, 400000) : (d.document || d.fileUrl || ''),
          fileName: d.fileName || 'Document',
          fileSize: d.fileSize || '1 MB',
          uploadedAt: d.uploadedAt || new Date().toISOString(),
        }))
      : [];

    const applicationPayload = {
      id: effectiveId,
      name,
      email: email || '',
      phone: phone || '',
      whatsapp: whatsapp || phone || '',
      location: location || 'India',
      source: resolvedSource || 'Direct Intake',
      campaignName: resolvedCampaignName || '',
      campaign: resolvedCampaignName || '',
      specialisations: Array.isArray(specialisations) ? specialisations : [specialisations],
      experience,
      bio,
      learningBackground,
      courseDetails,
      // Government Identity & Compliance Documents
      aadhaarNumber: aadhaarNumber || (idProofType === 'aadhaar' ? idProofNumber : '') || '',
      aadhaarDocument: safeAadhaarDoc,
      aadhaarFileName: aadhaarFileName || 'Aadhaar_Document',
      panNumber: panNumber || (idProofType === 'pan' ? idProofNumber : '') || '',
      panDocument: safePanDoc,
      panFileName: panFileName || 'PAN_Document',
      idProofType: idProofType || 'aadhaar',
      idProofNumber: idProofNumber || aadhaarNumber || panNumber || '',
      idProofDocument: safeIdProofDoc || safeAadhaarDoc || safePanDoc,
      otherDocuments: safeOtherDocs,
      languages,
      aiScore: isDisqualified ? 0 : overallScore,
      theoryScore: safeTheory,
      chartCaseScore: safeChart,
      aiInterviewScore: safeInterview,
      // Top-level assessment & interview fields for immediate dashboard access
      chartCaseAnalysis,
      chartRemedy,
      chartEvaluation,
      chartCaseTitle,
      chartCaseLagna,
      chartCaseQuery,
      chartCasePlacements,
      conversationHistory,
      aiInterviewEvaluation,
      theoryAnswers,
      theoryQuestionsList,
      interviewDurationSeconds: Number(interviewDurationSeconds) || 0,
      interviewDurationFormatted: interviewDurationFormatted || (interviewDurationSeconds ? `${Math.floor(interviewDurationSeconds / 60)}m ${interviewDurationSeconds % 60}s` : 'Not recorded'),
      assessmentDurationSeconds: Number(assessmentDurationSeconds) || 0,
      assessmentDurationFormatted: assessmentDurationFormatted || 'Completed',
      assessmentLanguage,
      // Dynamic Score & Threshold Metadata
      passingThreshold: Number(passingThreshold) || 75,
      theoryWeight: Number(theoryWeight) || 35,
      chartCaseWeight: Number(chartCaseWeight) || 25,
      aiInterviewWeight: Number(aiInterviewWeight) || 40,
      isAiDynamicQuestions: Boolean(isAiDynamicQuestions),
      questionCount: Number(questionCount) || 5,
      // Anti-Cheating & Proctoring Fields
      tabViolations: Number(tabViolations) || 0,
      proctorLogs: Array.isArray(proctorLogs) ? proctorLogs : [],
      isDisqualified: Boolean(isDisqualified),
      disqualificationReason: disqualificationReason || '',
      isQualifiedByThreshold,
      lifecycleStatus: isDisqualified ? 'rejected' : 'human-review',
      applicationStatus: isDisqualified 
        ? 'Disqualified (Proctoring Violation / Cheating)' 
        : (isQualifiedByThreshold ? 'Qualified (Under Review)' : 'Review Required'),
      outreachStatus: isDisqualified ? 'Disqualified' : 'Applied & Tested',
      appliedAt: new Date().toISOString(),
      updatedAt: serverTimestamp(),
      applicationData: {
        learningBackground,
        courseDetails,
        idProofType,
        idProofNumber: idProofNumber || aadhaarNumber || panNumber || '',
        aadhaarNumber: aadhaarNumber || (idProofType === 'aadhaar' ? idProofNumber : '') || '',
        aadhaarDocument: safeAadhaarDoc,
        panNumber: panNumber || (idProofType === 'pan' ? idProofNumber : '') || '',
        panDocument: safePanDoc,
        otherDocuments: safeOtherDocs,
        theoryScore: safeTheory,
        chartCaseScore: safeChart,
        aiInterviewScore: safeInterview,
        theoryAnswers,
        theoryQuestionsList,
        chartCaseAnalysis,
        chartRemedy,
        chartEvaluation,
        chartCaseTitle,
        chartCaseLagna,
        chartCaseQuery,
        chartCasePlacements,
        aiInterviewEvaluation,
        conversationHistory,
        interviewDurationSeconds: Number(interviewDurationSeconds) || 0,
        interviewDurationFormatted: interviewDurationFormatted || (interviewDurationSeconds ? `${Math.floor(interviewDurationSeconds / 60)}m ${interviewDurationSeconds % 60}s` : 'Not recorded'),
        assessmentDurationSeconds: Number(assessmentDurationSeconds) || 0,
        assessmentDurationFormatted: assessmentDurationFormatted || 'Completed',
        assessmentLanguage,
        proctoring: {
          tabViolations: Number(tabViolations) || 0,
          proctorLogs: Array.isArray(proctorLogs) ? proctorLogs : [],
          isDisqualified: Boolean(isDisqualified),
          disqualificationReason: disqualificationReason || '',
        },
        scoringConfig: {
          passingThreshold: Number(passingThreshold) || 75,
          theoryWeight: Number(theoryWeight) || 35,
          chartCaseWeight: Number(chartCaseWeight) || 25,
          aiInterviewWeight: Number(aiInterviewWeight) || 40,
          isAiDynamicQuestions: Boolean(isAiDynamicQuestions),
          questionCount: Number(questionCount) || 5,
        }
      },
      history: [
        {
          stage: isDisqualified ? 'Disqualified for Malpractice' : 'Application & Screening Completed',
          timestamp: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          notes: isDisqualified
            ? `Candidate DISQUALIFIED during online exam. Reason: ${disqualificationReason || '3 Tab switches / unauthorized window loss detected'}. Total Violations: ${tabViolations}.`
            : `Completed Vedic Theory Assessment (${safeTheory}/100, ${theoryWeight}% wt), Blind Kundali Case (${safeChart}/100, ${chartCaseWeight}% wt), and AI Technical Interview (${safeInterview}/100, ${aiInterviewWeight}% wt). Overall Score: ${overallScore}/100 (Threshold: ${passingThreshold}%, Status: ${isQualifiedByThreshold ? 'QUALIFIED' : 'NEEDS REVIEW'}). Proctoring Violations: ${tabViolations}. Question Mode: ${isAiDynamicQuestions ? 'AI Dynamic Random' : 'Curated Bank'} (${questionCount} questions).`,
          actor: isDisqualified ? 'AI Anti-Cheating Proctor Engine' : 'Candidate Self-Service & AI Examiner',
          status: isDisqualified ? 'error' : (isQualifiedByThreshold ? 'success' : 'info'),
        }
      ]
    };

    // Save to Firestore candidates collection and provision astrologer account
    try {
      if (db) {
        const candidateRef = doc(db, 'candidates', effectiveId);
        await setDoc(candidateRef, applicationPayload, { merge: true });

        // Create or update entry in 'astrologers' collection so candidate record exists
        if (email || phone) {
          const astRef = doc(db, 'astrologers', effectiveId);
          await setDoc(astRef, {
            id: effectiveId,
            name,
            email: email || '',
            phone,
            location: location || 'India',
            speciality: specialisations[0] || 'Vedic Astrology',
            experience,
            about: bio,
            languages,
            isVerified: false,
            status: 'under_review',
            aiScore: overallScore,
            appliedAt: new Date().toISOString(),
          }, { merge: true });
        }
      }
    } catch (dbErr) {
      console.warn('Firestore candidate application save warning:', dbErr);
      // Fallback: If document was too large due to base64 ID proof, retry without the attachment
      try {
        if (db && applicationPayload.idProofDocument) {
          const strippedPayload = { ...applicationPayload, idProofDocument: '[Document Attached - Saved on Staging]' };
          const candidateRef = doc(db, 'candidates', effectiveId);
          await setDoc(candidateRef, strippedPayload, { merge: true });
        }
      } catch (retryErr) {
        console.error('Firestore save retry error:', retryErr);
      }
    }

    // If an email address is provided, dispatch confirmation email via Gmail SMTP
    if (email && email.includes('@')) {
      try {
        const confirmationHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #713B32;">
              <h2 style="color: #713B32; margin: 0; font-size: 22px;">AstroParihar Astrologer Onboarding</h2>
              <p style="color: #718096; margin: 4px 0 0 0; font-size: 14px;">Application & Screening Submission Received</p>
            </div>
            
            <p style="font-size: 16px;">Namaste <strong>${name} Ji</strong> 🙏,</p>
            
            <p>Thank you for completing your self-service profile verification, Vedic knowledge assessment, and AI screening interview for <strong>AstroParihar</strong>.</p>
            
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #1e293b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Submission Summary</h4>
              <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.8;">
                <li><strong>Application ID:</strong> ${effectiveId}</li>
                <li><strong>Specialisation:</strong> ${Array.isArray(specialisations) ? specialisations.join(', ') : specialisations}</li>
                <li><strong>Theory Assessment:</strong> Completed (${theoryScore}/100)</li>
                <li><strong>Kundali Chart Case:</strong> Completed (${chartCaseScore}/100)</li>
                <li><strong>AI Screening Interview:</strong> Completed (${aiInterviewScore}/100)</li>
                <li><strong>Current Status:</strong> <span style="color: #d97706; font-weight: bold;">Under Human Review</span></li>
              </ul>
            </div>
            
            <p>Our Astrological Verification Committee is currently reviewing your responses and credentials. Once approved by our team, your astrologer dashboard access will be activated, and you will receive an official welcome notification.</p>
            
            <p style="margin-top: 24px;">Warm regards,<br/>
            <strong>Astrologer Verification & Onboarding Panel</strong><br/>
            AstroParihar (astropariharuk@gmail.com)</p>
          </div>
        `;

        await sendSmtpEmail({
          to: email,
          subject: `Application Received: AstroParihar Astrologer Onboarding (Ref: ${effectiveId})`,
          body: `Namaste ${name} Ji,\n\nThank you for completing your screening for AstroParihar. Your application (Ref: ${effectiveId}) is under review by our Astrological Verification Committee. You will receive an official notification upon approval.\n\nWarm regards,\nAstroParihar Recruitment Team`,
          html: confirmationHtml,
          candidateName: name,
          candidateId: effectiveId,
        });
      } catch (emailErr) {
        console.warn('Application confirmation email dispatch warning:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      applicationId: effectiveId,
      message: 'Application and screening assessments submitted successfully for human review.',
      overallScore,
    });
  } catch (error: any) {
    console.error('Apply submission error:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to submit candidate application',
    }, { status: 500 });
  }
}
