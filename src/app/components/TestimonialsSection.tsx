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
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1a2f4decc-1763300127301.png',
    rating: 5,
    text: 'The gemstone recommendation was spot on! I started wearing Emerald as suggested and within weeks noticed improvements in communication and career opportunities. The Kundli analysis was incredibly detailed.',
  },
  {
    id: 'test-002',
    name: 'Rajan Mehta',
    role: 'Business Owner, Ahmedabad',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1d3885eb8-1777028192064.png',
    rating: 5,
    text: "Pt. Rajendra's consultation helped me choose the perfect Muhurtham for my business launch. The entire booking process was seamless and the video call quality was excellent. Highly recommend!",
  },
  {
    id: 'test-003',
    name: 'Preethi Sundaram',
    role: 'Teacher, Chennai',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1742c1e21-1764653520338.png',
    rating: 5,
    text: 'The Ishta Devata module revealed Lord Muruga as my personal deity. The daily worship guide and stotra suggestions have brought so much peace into my life. Worth every rupee of premium.',
  },
  {
    id: 'test-004',
    name: 'Deepak Nambiar',
    role: 'Doctor, Kochi',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1e36f6bff-1773857215282.png',
    rating: 5,
    text: "Best astrology platform I've used. The Interactive Vastu feature helped me rearrange my clinic for better patient flow. Jyotishi Meera's insights were profound and practical.",
  },
  {
    id: 'test-005',
    name: 'Kavitha Reddy',
    role: 'Homemaker, Hyderabad',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1e464dca4-1768028671702.png',
    rating: 5,
    text: 'The Fasting Planner and Charity Planner are absolutely wonderful. It keeps me on track with my spiritual practices and sends timely reminders. The platform understands Vedic traditions so well.',
  },
  {
    id: 'test-006',
    name: 'Suresh Pillai',
    role: 'CA, Mumbai',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1edd4f175-1771327495737.png',
    rating: 5,
    text: 'The marriage Muhurtham generator gave us 3 perfect dates. Our wedding was on the first date and everything went beautifully. The planetary strength analysis was detailed and convincing.',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-[#F8F3EA]">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#EDE4D5] text-[#713B32] border border-[#E5D9C8] mb-4">
            Seeker Reviews
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#292522] mb-4">
            What Our <span className="text-gradient-gold">Community Says</span>
          </h2>
          <p className="text-[#6B5E55] font-medium">
            Trusted by 2,50,000+ spiritual seekers across India and beyond
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials?.map((t, i) => (
            <motion.div
              key={t?.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#FFFDFC] rounded-3xl p-7 border border-[#E5D9C8] shadow-sm hover:shadow-xl transition-all card-hover flex flex-col justify-between"
            >
              <div>
                <Quote size={28} className="text-[#713B32]/30 mb-4" />
                <p className="text-sm text-[#292522]/90 leading-relaxed mb-6 font-normal">
                  {t?.text}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t?.rating)]?.map((_, ri) => (
                    <Star
                      key={`star-${t?.id}-${ri}`}
                      size={14}
                      fill="#D8B66A"
                      className="text-[#B88A44]"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-[#E5D9C8]">
                  <AppImage
                    src={t?.avatar}
                    alt={`${t?.name} - ${t?.role} testimonial`}
                    width={42}
                    height={42}
                    className="w-10 h-10 rounded-full object-cover border border-[#E5D9C8]"
                  />

                  <div>
                    <div className="text-sm font-bold text-[#292522]">{t?.name}</div>
                    <div className="text-xs text-[#6B5E55]">{t?.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
