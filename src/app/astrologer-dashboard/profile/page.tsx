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
} from 'lucide-react';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [experience, setExperience] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'astrologers', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          setAmount(data.amount || '');
          setExperience(data.experienceYears || '');
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
      
      await updateDoc(docRef, {
        amount: Number(amount) || 0,
        experienceYears: Number(experience) || 0,
        ...(isNewImage && { profileImageUrl: localPreview }),
      });

      if (isNewImage) {
        setProfile({ ...profile, profileImageUrl: localPreview });
      }

      toast.success('Profile updated successfully');
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your public astrologer profile.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold flex items-center gap-2 hover:bg-accent/90 transition-colors w-fit disabled:opacity-70"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-1 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-light dark:glass-card p-8 rounded-3xl border border-border flex flex-col items-center text-center"
          >
            <div className="relative w-32 h-32 mb-4 group">
              {(localPreview || profile.profileImageUrl) ? (
                <img 
                  src={localPreview || profile.profileImageUrl} 
                  alt={profile.name} 
                  className="w-full h-full object-cover rounded-full shadow-xl"
                />
              ) : (
                <div className="w-full h-full rounded-full gold-gradient-bg flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                  {profile.name?.charAt(0).toUpperCase()}
                </div>
              )}
              
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-8 h-8 text-white" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
            <p className="text-accent font-medium mt-1">{profile.skills}</p>

            <div className="flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-semibold text-green-400">Online & Available</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card-light dark:glass-card p-6 rounded-3xl border border-border space-y-6"
          >
            <h3 className="font-bold text-lg text-foreground border-b border-border pb-3">
              Contact Info
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">City</p>
                  <p className="text-sm font-medium text-foreground">{profile.city}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone Type</p>
                  <p className="text-sm font-medium text-foreground">{profile.phoneType}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card-light dark:glass-card p-8 rounded-3xl border border-border"
          >
            <h3 className="font-bold text-xl text-foreground mb-6">Professional Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-accent" /> Specialties & Skills
                  </label>
                  <div className="px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground">
                    {profile.skills}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                    <Languages size={16} className="text-accent" /> Languages Spoken
                  </label>
                  <div className="px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground">
                    {profile.languages}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                    <Briefcase size={16} className="text-accent" /> Learning Source
                  </label>
                  <div className="px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground">
                    {profile.learningSource}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-accent" /> Daily Hours Available
                  </label>
                  <div className="px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground">
                    {profile.dailyHours}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-accent" /> Date of Birth
                  </label>
                  <div className="px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground">
                    {profile.dob}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                    <User size={16} className="text-accent" /> Working Elsewhere
                  </label>
                  <div className="px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground">
                    {profile.workingElsewhere}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                      <IndianRupee size={16} className="text-accent" /> Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:border-accent transition-colors"
                      placeholder="e.g. 500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                      <Briefcase size={16} className="text-accent" /> Experience (Yrs)
                    </label>
                    <input
                      type="number"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:border-accent transition-colors"
                      placeholder="e.g. 5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card-light dark:glass-card p-8 rounded-3xl border border-border"
          >
            <h3 className="font-bold text-xl text-foreground mb-2">System Information</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Internal data associated with your account.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <p className="font-semibold text-green-400 capitalize">{profile.status}</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Token Number</p>
                <p className="font-semibold text-foreground font-mono">#{profile.tokenNumber}</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Join Date</p>
                <p className="font-semibold text-foreground">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
