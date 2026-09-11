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
      location,
      specialisations = ['Vedic Jyotish'],
      experience = '10+ years',
      bio = '',
      password = '',
      languages = ['Hindi', 'English'],
      theoryScore = 0,
      chartCaseScore = 0,
      aiInterviewScore = 0,
      aiInterviewEvaluation = null,
      theoryAnswers = {},
      chartCaseAnalysis = '',
      conversationHistory = [],
    } = body;

    if (!name || !phone) {
      return NextResponse.json({
        success: false,
        error: 'Candidate name and phone number are required',
      }, { status: 400 });
    }

    const effectiveId = candidateId || `ast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const overallScore = Math.round(
      (theoryScore * 0.35) + 
      (chartCaseScore * 0.25) + 
      (aiInterviewScore * 0.40)
    ) || theoryScore || 85;

    const applicationPayload = {
      id: effectiveId,
      name,
      email: email || '',
      phone: phone || '',
      location: location || 'India',
      specialisations: Array.isArray(specialisations) ? specialisations : [specialisations],
      experience,
      bio,
      languages,
      password: password || '', // For staging astrologer account
      aiScore: overallScore,
      theoryScore,
      chartCaseScore,
      aiInterviewScore,
      lifecycleStatus: 'human-review',
      applicationStatus: 'Under Review',
      outreachStatus: 'Applied & Tested',
      appliedAt: new Date().toISOString(),
      updatedAt: serverTimestamp(),
      applicationData: {
        theoryAnswers,
        chartCaseAnalysis,
        aiInterviewEvaluation,
        conversationHistory,
      },
      history: [
        {
          stage: 'Application & Screening Completed',
          timestamp: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          notes: `Completed Vedic Theory Assessment (${theoryScore}/100), Blind Kundali Case (${chartCaseScore}/100), and GPT-4o AI Technical Interview (${aiInterviewScore}/100). Overall Score: ${overallScore}/100.`,
          actor: 'Candidate Self-Service & AI Examiner',
          status: 'success',
        }
      ]
    };

    // Save to Firestore candidates collection
    try {
      if (db) {
        const candidateRef = doc(db, 'candidates', effectiveId);
        await setDoc(candidateRef, applicationPayload, { merge: true });

        // Also create a pending/unverified entry in 'astrologers' collection so credentials exist
        if (email) {
          const astRef = doc(db, 'astrologers', effectiveId);
          await setDoc(astRef, {
            id: effectiveId,
            name,
            email,
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
