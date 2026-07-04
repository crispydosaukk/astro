'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';

const testimonials = [
{
  id: 'test-001',
  name: 'Ananya Krishnamurthy',
  role: 'Software Engineer, Bengaluru',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1a2f4decc-1763300127301.png",
  rating: 5,
  text: 'The AI gemstone recommendation was spot on! I started wearing Emerald as suggested and within weeks noticed improvements in communication and career opportunities. The Kundli analysis was incredibly detailed.'
},
{
  id: 'test-002',
  name: 'Rajan Mehta',
  role: 'Business Owner, Ahmedabad',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1d3885eb8-1777028192064.png",
  rating: 5,
  text: 'Pt. Rajendra\'s consultation helped me choose the perfect Muhurtham for my business launch. The entire booking process was seamless and the video call quality was excellent. Highly recommend!'
},
{
  id: 'test-003',
  name: 'Preethi Sundaram',
  role: 'Teacher, Chennai',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1742c1e21-1764653520338.png",
  rating: 5,
  text: 'The Ishta Devata module revealed Lord Muruga as my personal deity. The daily worship guide and stotra suggestions have brought so much peace into my life. Worth every rupee of premium.'
},
{
  id: 'test-004',
  name: 'Deepak Nambiar',
  role: 'Doctor, Kochi',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1e36f6bff-1773857215282.png",
  rating: 5,
  text: 'Best astrology platform I\'ve used. The Interactive Vastu feature helped me rearrange my clinic for better patient flow. Jyotishi Meera\'s insights were profound and practical.'
},
{
  id: 'test-005',
  name: 'Kavitha Reddy',
  role: 'Homemaker, Hyderabad',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1e464dca4-1768028671702.png",
  rating: 5,
  text: 'The Fasting Planner and Charity Planner are absolutely wonderful. It keeps me on track with my spiritual practices and sends timely reminders. The AI understands Vedic traditions so well.'
},
{
  id: 'test-006',
  name: 'Suresh Pillai',
  role: 'CA, Mumbai',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1edd4f175-1771327495737.png",
  rating: 5,
  text: 'The marriage Muhurtham generator gave us 3 perfect dates. Our wedding was on the first date and everything went beautifully. The planetary strength analysis was detailed and convincing.'
}];


export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14">
          
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20 mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            What Our <span className="text-gradient-gold">Community Says</span>
          </h2>
          <p className="text-muted-foreground">Trusted by 2,50,000+ spiritual seekers across India and beyond</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials?.map((t, i) =>
          <motion.div
            key={t?.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card-light dark:glass-card rounded-2xl p-6 border border-border card-hover">
            
              <Quote size={24} className="text-accent/40 mb-4" />
              <p className="text-sm text-foreground/80 leading-relaxed mb-6">{t?.text}</p>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(t?.rating)]?.map((_, ri) =>
              <Star key={`star-${t?.id}-${ri}`} size={12} fill="currentColor" className="text-accent" />
              )}
              </div>
              <div className="flex items-center gap-3">
                <AppImage
                src={t?.avatar}
                alt={`${t?.name} - ${t?.role} testimonial`}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover" />
              
                <div>
                  <div className="text-sm font-semibold text-foreground">{t?.name}</div>
                  <div className="text-xs text-muted-foreground">{t?.role}</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>);



}