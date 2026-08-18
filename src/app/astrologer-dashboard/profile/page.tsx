'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  MapPin,
  Languages,
  Sparkles,
  Clock,
  Calendar,
  Briefcase,
  Phone,
  Loader2,
  Save,
  IndianRupee,
  Camera,
  ChevronDown,
  Lock,
  BookOpen,
  Award,
  FileText,
  Star,
} from 'lucide-react';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // Editable Profile States
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [languages, setLanguages] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [education, setEducation] = useState('');
  const [certifications, setCertifications] = useState('');
  const [learningSource, setLearningSource] = useState('');
  const [dailyHours, setDailyHours] = useState('');
  const [workingElsewhere, setWorkingElsewhere] = useState('No');
  const [phoneType, setPhoneType] = useState('Android');
  const [dob, setDob] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'astrologers', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          setAmount(data.amount || '0');
          setExperience(data.experienceYears || data.experience || '');
          setSkills(data.skills || 'Vedic Astrology');
          setLanguages(data.languages || 'English, Hindi');
          setCity(data.city || 'Varanasi, India');
          setBio(
            data.bio ||
              data.about ||
              `${data.name || 'Pt. Astrologer'} is a renowned Vedic astrologer with ${
                data.experienceYears || 10
              } years of dedicated practice. Specializes in accurate predictions and Parihara remedies.`
          );
          setEducation(data.education || 'M.A. Jyotish Shastra, Banaras Hindu University');
          setCertifications(
            Array.isArray(data.certifications)
              ? data.certifications.join(', ')
              : data.certifications || 'Jyotish Acharya, KP Astrology Certified'
          );
          setLearningSource(data.learningSource || 'Gurukul / Institution');
          setDailyHours(data.dailyHours || '6 Hours');
          setWorkingElsewhere(data.workingElsewhere || 'No');
          setPhoneType(data.phoneType || 'Android');
          setDob(data.dob || '1985-05-15');
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'astrologers', auth.currentUser.uid);
      const isNewImage = localPreview && localPreview.startsWith('data:image');

      const updatedFields = {
        experienceYears: Number(experience) || 0,
        skills,
        languages,
        city,
        bio,
        about: bio,
        education,
        certifications: certifications.split(',').map((s) => s.trim()).filter(Boolean),
        learningSource,
        dailyHours,
        workingElsewhere,
        phoneType,
        dob,
        ...(isNewImage && { profileImageUrl: localPreview }),
      };

      await updateDoc(docRef, updatedFields);

      setProfile((prev: any) => ({
        ...prev,
        ...updatedFields,
        ...(isNewImage && { profileImageUrl: localPreview }),
      }));

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to JPEG to keep size small for Firestore
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setLocalPreview(dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  if (!profile) {
    return <div className="p-8 text-center text-muted-foreground">Failed to load profile.</div>;
  }

  return (
    <div className="px-6 lg:px-8 py-8 max-w-screen-xl mx-auto space-y-8">
      {/* Top Header & Save Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Astrologer Profile</h1>
          <p className="text-muted-foreground mt-1">
            Update your public credentials, bio, education, certifications, and expertise details.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 rounded-xl gold-gradient-bg text-white font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#C9952B]/20 w-fit disabled:opacity-70"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Avatar Card & Admin Stats */}
        <div className="lg:col-span-1 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-light dark:glass-card p-8 rounded-3xl border border-border flex flex-col items-center text-center space-y-4"
          >
            <div className="relative w-32 h-32 group">
              {localPreview || profile.profileImageUrl ? (
                <img
                  src={localPreview || profile.profileImageUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover rounded-full shadow-xl border-2 border-[#C9952B]/40"
                />
              ) : (
                <div className="w-full h-full rounded-full gold-gradient-bg flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                  {profile.name?.charAt(0).toUpperCase()}
                </div>
              )}

              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-8 h-8 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
              <p className="text-accent font-semibold mt-1">{skills || profile.skills}</p>
            </div>

            {profile.badge && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C9952B]/20 text-[#C9952B] border border-[#C9952B]/40">
                ⭐ {profile.badge}
              </span>
            )}

            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-semibold text-green-400">Online & Available</span>
            </div>

            {/* Admin Metrics Display */}
            <div className="w-full grid grid-cols-2 gap-2 pt-4 border-t border-border text-xs">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border text-center">
                <span className="text-muted-foreground block text-[10px]">Rating</span>
                <span className="font-bold text-[#C9952B] flex items-center justify-center gap-1 mt-0.5">
                  <Star size={12} fill="currentColor" /> {profile.rating || 4.9} ({profile.reviewsCount || profile.reviews || 2847})
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border text-center">
                <span className="text-muted-foreground block text-[10px]">Consultations</span>
                <span className="font-bold text-foreground block mt-0.5">
                  {(profile.consultations || 12480).toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card-light dark:glass-card p-6 rounded-3xl border border-border space-y-6"
          >
            <h3 className="font-bold text-lg text-foreground border-b border-border pb-3 flex items-center gap-2">
              <MapPin size={18} className="text-accent" /> Location & Contact
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Email</label>
                <input
                  type="text"
                  value={profile.email || ''}
                  readOnly
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/40 border border-border text-muted-foreground text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">City / Location</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Varanasi, Uttar Pradesh, India"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Phone Device</label>
                <select
                  value={phoneType}
                  onChange={(e) => setPhoneType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-accent"
                >
                  <option value="Android">Android</option>
                  <option value="iPhone (iOS)">iPhone (iOS)</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Main Details & Qualifications Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Me Bio Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card-light dark:glass-card p-8 rounded-3xl border border-border space-y-6"
          >
            <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
              <FileText size={20} className="text-accent" /> About Me & Biography
            </h3>
            <p className="text-xs text-muted-foreground">
              Provide a comprehensive bio highlighting your astrological background, lineage, strengths, and advice methodology.
            </p>
            <textarea
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your background, specialization, experience, and guidance principles..."
              className="w-full p-4 rounded-2xl bg-background border border-border text-foreground text-sm outline-none focus:border-accent leading-relaxed"
            />
          </motion.div>

          {/* Qualifications & Education */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card-light dark:glass-card p-8 rounded-3xl border border-border space-y-6"
          >
            <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
              <BookOpen size={20} className="text-accent" /> Education & Certifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <BookOpen size={16} className="text-accent" /> Highest Education
                </label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. M.A. Jyotish Shastra, Banaras Hindu University"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <Award size={16} className="text-accent" /> Certifications (Comma Separated)
                </label>
                <input
                  type="text"
                  value={certifications}
                  onChange={(e) => setCertifications(e.target.value)}
                  placeholder="e.g. Jyotish Acharya, KP Astrology Certified, Prashna Expert"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-accent"
                />
              </div>
            </div>
          </motion.div>

          {/* Professional Details & Admin Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card-light dark:glass-card p-8 rounded-3xl border border-border space-y-6"
          >
            <h3 className="font-bold text-xl text-foreground">Professional Attributes</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-accent" /> Primary Skill / Specialty
                </label>
                <div className="relative">
                  <select
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:border-accent cursor-pointer appearance-none pr-10 text-sm"
                  >
                    <option value="Vedic Astrology">Vedic Astrology</option>
                    <option value="Vedic Astrology, Numerology">Vedic Astrology, Numerology</option>
                    <option value="Vedic Astrology, Vastu">Vedic Astrology, Vastu</option>
                    <option value="Vedic Astrology, Palmistry">Vedic Astrology, Palmistry</option>
                    <option value="Numerology">Numerology</option>
                    <option value="Palmistry">Palmistry</option>
                    <option value="Vastu Shastra">Vastu Shastra</option>
                    <option value="Tarot Reading">Tarot Reading</option>
                    <option value="Face Reading">Face Reading</option>
                    <option value="KP Astrology">KP Astrology</option>
                    <option value="Prashna Kundli">Prashna Kundli</option>
                    <option value="Gemstone Consultancy">Gemstone Consultancy</option>
                    <option value="Nadi Astrology">Nadi Astrology</option>
                    <option value="Lal Kitab">Lal Kitab</option>
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <Languages size={16} className="text-accent" /> Languages Spoken
                </label>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="e.g. English, Hindi, Sanskrit"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <Briefcase size={16} className="text-accent" /> Experience (Years)
                </label>
                <input
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-accent"
                  placeholder="e.g. 18"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center justify-between gap-1 mb-2">
                  <span className="flex items-center gap-1.5">
                    <IndianRupee size={15} className="text-accent" /> Rate / Min (₹)
                  </span>
                  <span className="text-[10px] font-semibold text-[#C9952B] bg-[#C9952B]/10 px-2 py-0.5 rounded-full border border-[#C9952B]/30 flex items-center gap-1">
                    <Lock size={10} /> Set by Admin
                  </span>
                </label>
                <input
                  type="text"
                  value={amount ? `₹${amount}/min` : '₹0/min'}
                  readOnly
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border text-muted-foreground cursor-not-allowed font-semibold opacity-85 select-none text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-accent" /> Daily Hours Available
                </label>
                <input
                  type="text"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(e.target.value)}
                  placeholder="e.g. 6 Hours"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <User size={16} className="text-accent" /> Working Elsewhere
                </label>
                <select
                  value={workingElsewhere}
                  onChange={(e) => setWorkingElsewhere(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-accent cursor-pointer"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
