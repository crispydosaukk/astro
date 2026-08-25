'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export interface SpokeItem {
  id: string;
  number: string;
  name: string;
  sanskrit: string;
  direction: string;
  directionFull: string;
  mantra: string;
  explanation: string;
  href: string;
  angle: number; // center angle in degrees (N is -90)
  bgGradientId: string;
  startColor: string;
  endColor: string;
  accentColor: string;
  icon: React.ReactNode;
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeDonutSegment(
  x: number,
  y: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number
) {
  const outerStart = polarToCartesian(x, y, rOuter, startAngle);
  const outerEnd = polarToCartesian(x, y, rOuter, endAngle);
  const innerStart = polarToCartesian(x, y, rInner, startAngle);
  const innerEnd = polarToCartesian(x, y, rInner, endAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', outerStart.x, outerStart.y,
    'A', rOuter, rOuter, 0, largeArcFlag, 1, outerEnd.x, outerEnd.y,
    'L', innerEnd.x, innerEnd.y,
    'A', rInner, rInner, 0, largeArcFlag, 0, innerStart.x, innerStart.y,
    'Z',
  ].join(' ');
}

export interface AshtaDigbandhanaWheelProps {
  onHoverSpoke?: (spoke: SpokeItem | null) => void;
  activeSpokeId?: string | null;
  hideInfoCard?: boolean;
  hideFooter?: boolean;
  className?: string;
}

export default function AshtaDigbandhanaWheel({
  onHoverSpoke,
  activeSpokeId,
  hideInfoCard = false,
  hideFooter = false,
  className = '',
}: AshtaDigbandhanaWheelProps) {
  const router = useRouter();
  const [internalHoveredSpoke, setInternalHoveredSpoke] = useState<string | null>(null);

  const hoveredSpoke = activeSpokeId !== undefined && activeSpokeId !== null
    ? activeSpokeId
    : internalHoveredSpoke;

  const center = 360;
  const rOuter = 330;
  const rInner = 115;
  const rMid = 226;

  // 8 Spokes matching the reference diagram clockwise starting from North 1 to 8
  const spokes: SpokeItem[] = [
    {
      id: 'mantra',
      number: '1',
      name: 'MANTRA',
      sanskrit: 'मन्त्र',
      direction: 'N',
      directionFull: 'उत्तर (North)',
      mantra: 'ॐ ह्रीं श्रीं क्लीं चामुण्डायै विच्चे ॥',
      explanation: 'जप से मन, वाणी और कर्म की शुद्धि, ग्रहों की अनुकूलता और आत्मिक शक्ति प्राप्त होती है।',
      href: '/remedies/mantra',
      angle: -90, // North (Top) - 1
      bgGradientId: 'grad-n-mantra',
      startColor: '#5C111A',
      endColor: '#36060C',
      accentColor: '#FBD38D',
      icon: (
        // Japa Mala & Sacred ॐ - Large Crisp Vector
        <g transform="scale(1.35)">
          <ellipse cx="0" cy="1" rx="13" ry="9" fill="none" stroke="#F6AD55" strokeWidth="1.8" strokeDasharray="3.2 3.2" />
          <circle cx="0" cy="10" r="2" fill="#ECC94B" stroke="#742A2A" strokeWidth="0.8" />
          <path d="M0,12 L-2,18 L2,18 Z" fill="#E53E3E" />
          <text x="0" y="4.5" fontSize="11" fontWeight="900" textAnchor="middle" fill="#FFFFFF" fontFamily="serif">
            ॐ
          </text>
        </g>
      ),
    },
    {
      id: 'yantra',
      number: '2',
      name: 'YANTRA',
      sanskrit: 'यन्त्र',
      direction: 'NE',
      directionFull: 'ईशान (North-East)',
      mantra: 'ॐ श्रीं ह्रीं क्लीं नमः ॥',
      explanation: 'पवित्र ज्यामिति व यंत्र स्थापना से ऊर्जा का संरक्षण, दिशाओं की स्थिरता और दिव्य संतुलन मिलता है।',
      href: '/remedies/yantra',
      angle: -45, // North-East (Top-Right) - 2
      bgGradientId: 'grad-ne-yantra',
      startColor: '#6B3014',
      endColor: '#3D1706',
      accentColor: '#FEEBC8',
      icon: (
        // Sri Yantra Sacred Geometry - Large Crisp Vector
        <g transform="scale(1.35)">
          <rect x="-12" y="-12" width="24" height="24" rx="2" fill="none" stroke="#F6E05E" strokeWidth="1.4" />
          <circle cx="0" cy="0" r="10" fill="none" stroke="#F6E05E" strokeWidth="1" />
          <polygon points="0,-9 8,5 -8,5" fill="none" stroke="#ECC94B" strokeWidth="1.2" />
          <polygon points="0,9 8,-5 -8,-5" fill="none" stroke="#ECC94B" strokeWidth="1.2" />
          <circle cx="0" cy="0" r="2" fill="#F6AD55" />
        </g>
      ),
    },
    {
      id: 'homa',
      number: '3',
      name: 'HOMA',
      sanskrit: 'होम',
      direction: 'E',
      directionFull: 'पूर्व (East)',
      mantra: 'ॐ अग्नये स्वाहा ॥',
      explanation: 'पवित्र अग्नि अनुष्ठान नकारात्मकता को भस्म कर ग्रहों को शांत व जीवन में सकारात्मक ऊर्जा लाते हैं।',
      href: '/remedies/homa',
      angle: 0, // East (Right) - 3
      bgGradientId: 'grad-e-homa',
      startColor: '#8C4810',
      endColor: '#542805',
      accentColor: '#FAF089',
      icon: (
        // Sacred Homa Kund with Agni Flames - Large Crisp Vector
        <g transform="scale(1.35)">
          <polygon points="-12,6 12,6 9,11 -9,11" fill="#C05621" stroke="#D69E2E" strokeWidth="0.8" />
          <polygon points="-9,2 9,2 12,6 -12,6" fill="#DD6B20" stroke="#ECC94B" strokeWidth="0.8" />
          <polygon points="-6,-1 6,-1 9,2 -9,2" fill="#ED8936" />
          <path d="M-3,-1 C-5,-6 -1,-11 0,-14 C1,-11 5,-6 3,-1 Z" fill="#ECC94B" />
          <path d="M-1.5,-1 C-2.5,-4 -0.5,-8 0,-10 C0.5,-8 2.5,-4 1.5,-1 Z" fill="#F56565" />
        </g>
      ),
    },
    {
      id: 'devata',
      number: '4',
      name: 'DEVATA UPASANA',
      sanskrit: 'देवता उपासना',
      direction: 'SE',
      directionFull: 'आग्नेय (South-East)',
      mantra: 'ॐ नमः शिवाय ॥',
      explanation: 'इष्ट देव की उपासना से आध्यात्मिक संरक्षण, दिव्य कृपा, शक्ति और आशीर्वाद प्राप्त होता है।',
      href: '/remedies/ishta-devata',
      angle: 45, // South-East (Bottom-Right) - 4
      bgGradientId: 'grad-se-devata',
      startColor: '#1B4D2E',
      endColor: '#0C2B18',
      accentColor: '#9AE6B4',
      icon: (
        // Lord Shiva Trishula & Damru - Large Crisp Vector
        <g transform="scale(1.35)">
          <line x1="0" y1="-14" x2="0" y2="12" stroke="#ECC94B" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M-7,-7 C-7,-1 0,1 0,1 C0,1 7,-1 7,-7" fill="none" stroke="#ECC94B" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="-7" y1="-12" x2="-7" y2="-7" stroke="#ECC94B" strokeWidth="1.5" />
          <line x1="7" y1="-12" x2="7" y2="-7" stroke="#ECC94B" strokeWidth="1.5" />
          <polygon points="-4,-2 4,-2 0,2" fill="#ED8936" />
          <polygon points="-4,6 4,6 0,2" fill="#ED8936" />
        </g>
      ),
    },
    {
      id: 'gemstone',
      number: '5',
      name: 'RATNA',
      sanskrit: 'रत्न',
      direction: 'S',
      directionFull: 'दक्षिण (South)',
      mantra: 'ॐ ग्रहाय नमः ॥',
      explanation: 'उचित रत्न धारण से शुभ ग्रह बलवान होते हैं और जीवन में संतुलन व सकारात्मकता आती है।',
      href: '/remedies/gemstone',
      angle: 90, // South (Bottom) - 5
      bgGradientId: 'grad-s-gemstone',
      startColor: '#7C5814',
      endColor: '#4A3205',
      accentColor: '#FEEBC8',
      icon: (
        // Navaratna Gems Cluster - Large Crisp Vector
        <g transform="scale(1.35)">
          <polygon points="0,-11 4.5,-7 4.5,-3 -4.5,-3 -4.5,-7" fill="#E53E3E" stroke="#FFF" strokeWidth="0.6" />
          <circle cx="9" cy="-5" r="3.6" fill="#3182CE" stroke="#FFF" strokeWidth="0.6" />
          <circle cx="-9" cy="-5" r="3.6" fill="#ECC94B" stroke="#FFF" strokeWidth="0.6" />
          <circle cx="-8" cy="4" r="3.6" fill="#38A169" stroke="#FFF" strokeWidth="0.6" />
          <polygon points="0,-1 4,3 0,7 -4,3" fill="#EDF2F7" stroke="#CBD5E0" strokeWidth="0.7" />
          <circle cx="8" cy="4" r="3.6" fill="#ED8936" stroke="#FFF" strokeWidth="0.6" />
        </g>
      ),
    },
    {
      id: 'rudraksha',
      number: '6',
      name: 'RUDRĀKṢA',
      sanskrit: 'रुद्राक्ष',
      direction: 'SW',
      directionFull: 'नैऋत्य (South-West)',
      mantra: 'ॐ नमः शिवाय ॥',
      explanation: 'भगवान शिव के पावन रुद्राक्ष मन को स्थिर, कष्टों का निवारण और आत्मिक ऊर्जा में वृद्धि करते हैं।',
      href: '/remedies/rudraksha',
      angle: 135, // South-West (Bottom-Left) - 6
      bgGradientId: 'grad-sw-rudraksha',
      startColor: '#122E5C',
      endColor: '#07152D',
      accentColor: '#90CDF4',
      icon: (
        // 5-Mukhi Sacred Rudraksha Bead - Large Crisp Vector
        <g transform="scale(1.35)">
          <circle cx="0" cy="0" r="10.5" fill="#9C4221" stroke="#DD6B20" strokeWidth="1.2" />
          <path d="M0,-10.5 C-3,-4 -3,4 0,10.5" fill="none" stroke="#4A1E0D" strokeWidth="1.4" />
          <path d="M0,-10.5 C3,-4 3,4 0,10.5" fill="none" stroke="#4A1E0D" strokeWidth="1.4" />
          <path d="M-8,-4 C-3,0 -3,0 -8,4" fill="none" stroke="#4A1E0D" strokeWidth="1.2" />
          <path d="M8,-4 C3,0 3,0 8,4" fill="none" stroke="#4A1E0D" strokeWidth="1.2" />
          <circle cx="0" cy="0" r="1.6" fill="#ECC94B" />
        </g>
      ),
    },
    {
      id: 'vastu',
      number: '7',
      name: 'VĀSTU',
      sanskrit: 'वास्तु',
      direction: 'W',
      directionFull: 'पश्चिम (West)',
      mantra: 'ॐ वास्तुपुरुषाय नमः ॥',
      explanation: 'वास्तु संतुलन से घर और कार्यस्थल में ऊर्जा का सकारात्मक प्रवाह, सुख, शांति और समृद्धि आती है।',
      href: '/remedies/vastu',
      angle: 180, // West (Left) - 7
      bgGradientId: 'grad-w-vastu',
      startColor: '#0E535C',
      endColor: '#042C32',
      accentColor: '#81E6D9',
      icon: (
        // Vastu Purusha Mandala Compass Grid - Large Crisp Vector
        <g transform="scale(1.35)">
          <rect x="-11" y="-11" width="22" height="22" rx="1.5" fill="none" stroke="#81E6D9" strokeWidth="1.4" />
          <line x1="-11" y1="0" x2="11" y2="0" stroke="#81E6D9" strokeWidth="1" />
          <line x1="0" y1="-11" x2="0" y2="11" stroke="#81E6D9" strokeWidth="1" />
          <circle cx="0" cy="0" r="7" fill="none" stroke="#ECC94B" strokeWidth="1" />
          <circle cx="0" cy="0" r="2.2" fill="#ECC94B" />
        </g>
      ),
    },
    {
      id: 'dana',
      number: '8',
      name: 'DĀNA & SEVA',
      sanskrit: 'दान एवं सेवा',
      direction: 'NW',
      directionFull: 'वायव्य (North-West)',
      mantra: 'ॐ परोपकाराय नमः ॥',
      explanation: 'निःस्वार्थ दान और सेवा से कर्मों की शुद्धि होती है, ग्रहों की शांति और जीवन में सुरक्षा मिलती है।',
      href: '/remedies/charity',
      angle: 225, // North-West (Top-Left) - 8
      bgGradientId: 'grad-nw-dana',
      startColor: '#401A4F',
      endColor: '#200929',
      accentColor: '#D6BCFA',
      icon: (
        // Cupped Giving Hands with Sacred Offering / Grain Bowl - Large Crisp Vector
        <g transform="scale(1.35)">
          <ellipse cx="0" cy="-3" rx="8" ry="4.5" fill="#ECC94B" stroke="#D69E2E" strokeWidth="0.8" />
          <ellipse cx="0" cy="-4.5" rx="5.5" ry="2.5" fill="#FAF089" />
          <circle cx="-3" cy="-4.5" r="0.8" fill="#D69E2E" />
          <circle cx="0" cy="-5" r="0.9" fill="#B7791F" />
          <circle cx="3" cy="-4.5" r="0.8" fill="#D69E2E" />
          <path d="M-13,5 C-11,2 -7,-1 -1,-1 L-1,1 C-6,1 -9,4 -11,7 Z" fill="#E2E8F0" stroke="#CBD5E0" strokeWidth="0.5" />
          <path d="M13,5 C11,2 7,-1 1,-1 L1,1 C6,1 9,4 11,7 Z" fill="#E2E8F0" stroke="#CBD5E0" strokeWidth="0.5" />
          <path d="M0,4 C-1.8,2 -5,3.2 -5,5.5 C-5,8 0,11 0,11 C0,11 5,8 5,5.5 C5,3.2 1.8,2 0,4 Z" fill="#F56565" stroke="#E53E3E" strokeWidth="0.5" />
        </g>
      ),
    },
  ];

  const activeSpoke = hoveredSpoke
    ? spokes.find((s) => s.id === hoveredSpoke)
    : spokes[0];

  return (
    <div className={`w-full max-w-[475px] sm:max-w-[500px] md:max-w-[530px] lg:max-w-[560px] xl:max-w-[590px] mx-auto flex flex-col items-center select-none space-y-2 ${className}`}>
      {/* Main Wheel Container */}
      <div className="relative w-full aspect-square flex items-center justify-center p-0.5 sm:p-1">
        {/* Ambient Radial Background Glow */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-r from-amber-500/20 via-rose-500/10 to-indigo-500/20 blur-3xl pointer-events-none" />

        <svg
          viewBox="0 0 720 720"
          className="w-full h-full drop-shadow-[0_16px_50px_rgba(0,0,0,0.7)]"
        >
          <defs>
            {/* Center Hub Clip Path */}
            <clipPath id="centerHubClip">
              <circle cx={center} cy={center} r={rInner} />
            </clipPath>

            {/* Segment Gradients matching the reference image */}
            {spokes.map((spoke) => (
              <radialGradient
                key={spoke.bgGradientId}
                id={spoke.bgGradientId}
                cx="50%"
                cy="50%"
                r="65%"
              >
                <stop offset="0%" stopColor={spoke.startColor} />
                <stop offset="100%" stopColor={spoke.endColor} />
              </radialGradient>
            ))}

            {/* Hover Highlight Gradient */}
            <radialGradient id="hoverHighlighter" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </radialGradient>

            {/* Gold Glow Filter */}
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Decorative Gold Rim Circles */}
          <circle
            cx={center}
            cy={center}
            r={rOuter + 10}
            fill="none"
            stroke="#C9952B"
            strokeWidth="1.8"
            strokeDasharray="5 5"
            opacity="0.7"
          />
          <circle
            cx={center}
            cy={center}
            r={rOuter}
            fill="none"
            stroke="#D69E2E"
            strokeWidth="4"
            opacity="0.95"
          />

          {/* 8 Sector Segments */}
          {spokes.map((spoke) => {
            const startAngle = spoke.angle - 22.5;
            const endAngle = spoke.angle + 22.5;
            const pathData = describeDonutSegment(center, center, rInner, rOuter, startAngle, endAngle);
            const isHovered = hoveredSpoke === spoke.id;

            // Anchor center of each sector
            const pos = polarToCartesian(center, center, rMid, spoke.angle);
            const badgePos = polarToCartesian(center, center, rOuter + 2, spoke.angle);

            return (
              <g
                key={spoke.id}
                onClick={() => router.push(spoke.href)}
                onMouseEnter={() => {
                  setInternalHoveredSpoke(spoke.id);
                  if (onHoverSpoke) onHoverSpoke(spoke);
                }}
                onMouseLeave={() => {
                  setInternalHoveredSpoke(null);
                  if (onHoverSpoke) onHoverSpoke(null);
                }}
                className="cursor-pointer transition-all duration-300 group"
              >
                {/* Sector Wedge Background */}
                <path
                  d={pathData}
                  fill={`url(#${spoke.bgGradientId})`}
                  stroke="#ECC94B"
                  strokeWidth={isHovered ? '3.5' : '2'}
                  className="transition-all duration-300"
                  style={{
                    filter: isHovered ? 'drop-shadow(0 0 20px rgba(246, 173, 85, 0.8))' : 'none',
                  }}
                />

                {/* Hover overlay brightness */}
                {isHovered && (
                  <path
                    d={pathData}
                    fill="url(#hoverHighlighter)"
                    pointerEvents="none"
                  />
                )}

                {/* Radial Dividing Boundary Line */}
                <line
                  x1={polarToCartesian(center, center, rInner, startAngle).x}
                  y1={polarToCartesian(center, center, rInner, startAngle).y}
                  x2={polarToCartesian(center, center, rOuter, startAngle).x}
                  y2={polarToCartesian(center, center, rOuter, startAngle).y}
                  stroke="#ECC94B"
                  strokeWidth="2"
                  opacity="0.85"
                />

                {/* Sector Content Group (Rock-solid static position with zero shift on hover) */}
                <g transform={`translate(${pos.x}, ${pos.y})`}>
                  {/* 1. SECTOR TITLE (Top of the wedge) */}
                  <text
                    x="0"
                    y="-48"
                    textAnchor="middle"
                    fontSize={
                      spoke.name.length > 13
                        ? '11.5'
                        : spoke.name.length > 10
                        ? '12'
                        : '13'
                    }
                    fontWeight="900"
                    letterSpacing="0.4"
                    fill="#FFFFFF"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    style={{
                      filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.95))',
                    }}
                  >
                    {spoke.number}. {spoke.name}
                  </text>

                  {/* 2. SANSKRIT SUB-TITLE (Below Title with ample spacing) */}
                  <text
                    x="0"
                    y="-30"
                    textAnchor="middle"
                    fontSize="11.5"
                    fontWeight="800"
                    fill={spoke.accentColor}
                    fontFamily="serif"
                    style={{
                      filter: 'drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.95))',
                    }}
                  >
                    {spoke.sanskrit}
                  </text>

                  {/* 3. CENTER VECTOR ICON (With comfortable top and bottom padding) */}
                  <g transform="translate(0, 2)">
                    {spoke.icon}
                  </g>

                  {/* 4. SACRED SHLOKA / MANTRA (Bottom with generous spacing) */}
                  <text
                    x="0"
                    y="36"
                    textAnchor="middle"
                    fontSize={spoke.mantra.length > 20 ? '9.5' : '11'}
                    fontWeight="800"
                    fill="#FFFFFF"
                    fontFamily="serif"
                    style={{
                      filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.95))',
                    }}
                  >
                    {spoke.mantra}
                  </text>
                </g>

                {/* Direction Badge on Outer Rim (N, NE, E, SE, S, SW, W, NW) */}
                <g transform={`translate(${badgePos.x}, ${badgePos.y})`}>
                  <circle
                    cx="0"
                    cy="0"
                    r="17"
                    fill={spoke.startColor}
                    stroke="#ECC94B"
                    strokeWidth="2.5"
                    filter="url(#goldGlow)"
                  />
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="900"
                    fill="#FFFFFF"
                    fontFamily="system-ui, sans-serif"
                    style={{
                      filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))',
                    }}
                  >
                    {spoke.direction}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Center Logo Emblem Hub (COMPLETELY PRESERVED AS REQUESTED) */}
          <g onClick={() => router.push('#remedies-grid')} className="cursor-pointer group">
            {/* Outer Hub Border Rings */}
            <circle
              cx={center}
              cy={center}
              r={rInner + 3}
              fill="none"
              stroke="#ECC94B"
              strokeWidth="3.5"
              filter="url(#goldGlow)"
            />

            {/* High-Resolution AstroParihar Logo Emblem in the Middle */}
            <image
              href="/AstroParihar_Emblem.png"
              x={center - rInner}
              y={center - rInner}
              width={rInner * 2}
              height={rInner * 2}
              preserveAspectRatio="xMidYMid meet"
              clipPath="url(#centerHubClip)"
              className="transition-transform duration-500 group-hover:scale-105"
              style={{ transformOrigin: `${center}px ${center}px` }}
            />

            {/* Inner Hub Border Ring */}
            <circle
              cx={center}
              cy={center}
              r={rInner}
              fill="none"
              stroke="#C9952B"
              strokeWidth="2"
            />
          </g>
        </svg>
      </div>

      {/* Title & Vedic Banner Below The Wheel */}
      <div className="text-center space-y-0.5 px-2 pt-1">
        <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#F3C068] tracking-wider uppercase font-serif drop-shadow-md">
          ASHTADIGBANDHANA WHEEL
        </h3>
        <p className="text-[11px] sm:text-xs text-slate-200 font-serif tracking-wide">
          ॥ आठों दिशाओं की रक्षा – जीवन की पूर्ण स्थिरता और समृद्धि ॥
        </p>
      </div>

      {/* Interactive Active Spoke Detailed Information Card (Only if not hidden) */}
      {!hideInfoCard && activeSpoke && (
        <motion.div
          key={activeSpoke.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full p-5 sm:p-6 rounded-3xl border border-amber-500/40 bg-slate-950/95 backdrop-blur-md shadow-2xl text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span
              className="px-4 py-1 rounded-full text-xs font-extrabold text-slate-950 shadow-md"
              style={{ backgroundColor: activeSpoke.accentColor }}
            >
              दिशा: {activeSpoke.directionFull}
            </span>
            <h4 className="text-lg sm:text-2xl font-bold text-white font-serif">
              {activeSpoke.number}. {activeSpoke.name} ({activeSpoke.sanskrit})
            </h4>
          </div>

          <p className="text-base sm:text-lg font-bold text-amber-300 font-serif">
            {activeSpoke.mantra}
          </p>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl mx-auto font-medium">
            {activeSpoke.explanation}
          </p>
        </motion.div>
      )}

      {/* Bottom Classical Vedic Shloka Footer (Only if not hidden) */}
      {!hideFooter && (
        <div className="text-center text-sm sm:text-base text-amber-300 font-serif pt-2 space-y-1">
          <p className="font-bold">
            मंत्र – यंत्र – होम – देवता उपासना – रत्न – रुद्राक्ष – वास्तु – दान एवं सेवा
          </p>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            इन आठ स्तम्भों से होता है सम्पूर्ण अष्टदिग्बन्धन और जीवन का संरक्षण।
          </p>
        </div>
      )}
    </div>
  );
}
