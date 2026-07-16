'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, Check, X, Clock, Video } from 'lucide-react';
import { toast } from 'sonner';

const mockRequests = [
  {
    id: 'req-1',
    user: 'Amit Kumar',
    type: 'chat',
    duration: '15 mins',
    amount: '₹300',
    time: '2 mins ago',
    status: 'pending'
  },
  {
    id: 'req-2',
    user: 'Sneha Sharma',
    type: 'call',
    duration: '30 mins',
    amount: '₹600',
    time: '5 mins ago',
    status: 'pending'
  }
];

export default function ConsultationsPage() {
  const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'history'>('requests');
  const [requests, setRequests] = useState(mockRequests);

  const handleAccept = (id: string) => {
    setRequests(prev => prev.filter(req => req.id !== id));
    toast.success('Consultation accepted. Connecting...');
    // Connect logic would go here
  };

  const handleDecline = (id: string) => {
    setRequests(prev => prev.filter(req => req.id !== id));
    toast.error('Consultation declined.');
  };

  return (
    <div className="px-6 lg:px-8 py-8 max-w-screen-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Consultations</h1>
        <p className="text-muted-foreground mt-1">Manage your incoming customer requests and active sessions.</p>
      </div>

      <div className="flex border-b border-border gap-6">
        {[
          { id: 'requests', label: 'Incoming Requests', count: requests.length },
          { id: 'active', label: 'Active Sessions', count: 0 },
          { id: 'history', label: 'History', count: 45 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 font-medium text-sm transition-all relative ${
              activeTab === tab.id ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'
              }`}>
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabConsultations"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
              />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-3xl border border-dashed border-border">
              <Clock className="w-12 h-12 mb-4 opacity-50" />
              <p>No incoming requests at the moment.</p>
              <p className="text-sm">Stay online to receive consultations.</p>
            </div>
          ) : (
            requests.map(req => (
              <div key={req.id} className="glass-card-light dark:glass-card p-6 rounded-2xl border border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{req.user}</h3>
                      <p className="text-xs text-muted-foreground mt-1">Requested {req.time}</p>
                    </div>
                    <div className={`p-2 rounded-xl ${req.type === 'chat' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                      {req.type === 'chat' ? <MessageSquare size={18} /> : <Phone size={18} />}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Session Type:</span>
                      <span className="font-semibold capitalize">{req.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-semibold">{req.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Earnings:</span>
                      <span className="font-semibold text-green-400">{req.amount}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <button
                    onClick={() => handleDecline(req.id)}
                    className="py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <X size={16} /> Decline
                  </button>
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="py-2.5 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <Check size={16} /> Accept
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'active' && (
        <div className="py-12 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-3xl border border-dashed border-border">
          <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
          <p>No active sessions currently.</p>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="py-12 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-3xl border border-dashed border-border">
          <Clock className="w-12 h-12 mb-4 opacity-50" />
          <p>Your history will appear here.</p>
        </div>
      )}
    </div>
  );
}
