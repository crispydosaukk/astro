'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Languages, Sparkles, Clock, Calendar, Briefcase, Phone, Loader2, Save } from 'lucide-react';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'astrologers', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Failed to load profile.
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-8 py-8 max-w-screen-xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">View and manage your public astrologer profile.</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold flex items-center gap-2 hover:bg-accent/90 transition-colors w-fit">
          <Save size={18} /> Save Changes
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
            <div className="w-32 h-32 rounded-full gold-gradient-bg flex items-center justify-center text-white text-5xl font-bold mb-4 shadow-xl">
              {profile.name?.charAt(0).toUpperCase()}
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
            <h3 className="font-bold text-lg text-foreground border-b border-border pb-3">Contact Info</h3>
            
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
            <p className="text-sm text-muted-foreground mb-6">Internal data associated with your account.</p>
            
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
