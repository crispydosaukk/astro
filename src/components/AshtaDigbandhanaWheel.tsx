'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface SpokeItem {
  id: string;
  name: string;
  sanskrit: string;
  href: string;
  angle: number; // center angle in degrees (top is -90)
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
    'Z'
  ].join(' ');
}

export default function AshtaDigbandhanaWheel() {
  const router = useRouter();
  const [hoveredSpoke, setHoveredSpoke] = useState<string | null>(null);

  const center = 270;
  const rOuter = 252;
  const rInner = 90;
  const rMid = 184;

  // 8 spokes matching the user's diagram clockwise starting from top
  const spokes: SpokeItem[] = [
    {
      id: 'gemstone',
      name: 'GEMSTONE',
      sanskrit: 'रत्न',
      href: '/remedies/gemstone',
      angle: -90, // Top
      icon: (
        <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="-7,-8 7,-8 12,-2 0,10 -12,-2" />
          <line x1="-12" y1="-2" x2="12" y2="-2" />
          <line x1="-7" y1="-8" x2="-3" y2="-2" />
          <line x1="-3" y1="-2" x2="0" y2="10" />
          <line x1="7" y1="-8" x2="3" y2="-2" />
          <line x1="3" y1="-2" x2="0" y2="10" />
        </g>
      ),
    },
    {
      id: 'mantra',
      name: 'MANTRA',
      sanskrit: 'मन्त्र',
      href: '/remedies/mantra',
      angle: -45, // Top-Right
      icon: (
        <text
          x="0"
          y="3"
          fontSize="20"
          fontWeight="bold"
          textAnchor="middle"
          fill="currentColor"
          fontFamily="serif"
        >
          ॐ
        </text>
      ),
    },
    {
      id: 'yantra',
      name: 'YANTRA',
      sanskrit: 'यन्त्र',
      href: '/remedies/yantra',
      angle: 0, // Right
      icon: (
        <g stroke="currentColor" strokeWidth="1.2" fill="none">
          <rect x="-10" y="-10" width="20" height="20" rx="2" />
          <circle cx="0" cy="0" r="8" />
          <polygon points="0,-7 6,4 -6,4" />
          <polygon points="0,7 6,-4 -6,-4" />
        </g>
      ),
    },
    {
      id: 'homa-puja',
      name: 'HOMA & PUJA',
      sanskrit: 'हवन / पूजा',
      href: '/remedies/homa',
      angle: 45, // Bottom-Right
      icon: (
        <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-8,6 L8,6 L6,0 L-6,0 Z" />
          <path d="M-4,0 L0,-8 L4,0" />
          <path d="M0,-3 C2,-5 3,-8 0,-11 C-3,-8 -2,-5 0,-3" fill="currentColor" opacity="0.6" />
        </g>
      ),
    },
    {
      id: 'devata',
      name: 'DEVATA UPASANA',
      sanskrit: 'देवता उपासना',
      href: '/remedies/ishta-devata',
      angle: 90, // Bottom
      icon: (
        <g stroke="currentColor" strokeWidth="1.3" fill="none">
          <circle cx="0" cy="-6" r="3.5" />
          <path d="M-7,7 C-7,1 -3.5,-2 0,-2 C3.5,-2 7,1 7,7" />
          <path d="M-2.5,-2 C-2.5,-5.5 0,-8 0,-8 C0,-8 2.5,-5.5 2.5,-2" />
        </g>
      ),
    },
    {
      id: 'dana',
      name: 'DĀNA',
      sanskrit: 'दान',
      href: '/remedies/charity',
      angle: 135, // Bottom-Left
      icon: (
        <g stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round">
          <path d="M0,-6 C-2,-9 -7,-7 -7,-3 C-7,1 0,6 0,6 C0,6 7,1 7,-3 C7,-7 2,-9 0,-6 Z" fill="currentColor" opacity="0.4" />
          <path d="M-10,4 C-6,2 -2,4 0,7 C2,4 6,2 10,4" />
        </g>
      ),
    },
    {
      id: 'vrata',
      name: 'VRATA',
      sanskrit: 'व्रत',
      href: '/remedies/fasting',
      angle: 180, // Left
      icon: (
        <g stroke="currentColor" strokeWidth="1.4" fill="none">
          <ellipse cx="0" cy="2" rx="7" ry="6" />
          <rect x="-4" y="-5" width="8" height="3" rx="1" />
          <path d="M-2,-5 L-4,-8 L4,-8 L2,-5" />
          <path d="M0,-8 L0,-11" strokeWidth="1.5" />
        </g>
      ),
    },
    {
      id: 'vastu',
      name: 'VASTU',
      sanskrit: 'वास्तु',
      href: '/remedies/vastu',
      angle: 225, // Top-Left
      icon: (
        <g stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-9,2 L0,-7 L9,2 L9,9 L-9,9 Z" />
          <path d="M-3,9 L-3,4 L3,4 L3,9" />
          <circle cx="0" cy="-1" r="1.5" fill="currentColor" />
        </g>
      ),
    },
  ];

  return (
    <div className="relative w-full max-w-[540px] aspect-square mx-auto flex items-center justify-center p-2 select-none">
      {/* Ambient Radial Glow Behind Wheel */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#C9952B]/10 via-[#8B1A2A]/20 to-[#C9952B]/10 blur-3xl pointer-events-none animate-pulse" />

      {/* Interactive Animated SVG Wheel */}
      <svg
        viewBox="0 0 540 540"
        className="w-full h-full drop-shadow-[0_10px_35px_rgba(201,149,43,0.2)]"
      >
        <defs>
          {/* Inner Maroon Hub Gradient */}
          <radialGradient id="hubMaroonGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6E1515" />
            <stop offset="70%" stopColor="#450A0A" />
            <stop offset="100%" stopColor="#2D0505" />
          </radialGradient>

          {/* Spoke Default Gradient */}
          <radialGradient id="spokeBgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFDF7" />
            <stop offset="100%" stopColor="#F7EEDD" />
          </radialGradient>

          {/* Spoke Hover Golden Gradient */}
          <radialGradient id="spokeHoverGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF8E7" />
            <stop offset="100%" stopColor="#F3D899" />
          </radialGradient>

          {/* Outer Ring Gold Glow */}
          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Decorative Ring */}
        <circle
          cx={center}
          cy={center}
          r={rOuter}
          fill="none"
          stroke="#C9952B"
          strokeWidth="2.5"
          opacity="0.8"
        />
        <circle
          cx={center}
          cy={center}
          r={rOuter + 6}
          fill="none"
          stroke="#C9952B"
          strokeWidth="1"
          strokeDasharray="4 6"
          opacity="0.5"
        />

        {/* 8 Sector Segments */}
        {spokes.map((spoke) => {
          const startAngle = spoke.angle - 22.5;
          const endAngle = spoke.angle + 22.5;
          const pathData = describeDonutSegment(center, center, rInner, rOuter, startAngle, endAngle);
          const isHovered = hoveredSpoke === spoke.id;
          const pos = polarToCartesian(center, center, rMid, spoke.angle);

          // Dot on outer border tip
          const tipPos = polarToCartesian(center, center, rOuter, spoke.angle);

          return (
            <g
              key={spoke.id}
              onClick={() => router.push(spoke.href)}
              onMouseEnter={() => setHoveredSpoke(spoke.id)}
              onMouseLeave={() => setHoveredSpoke(null)}
              className="cursor-pointer transition-all duration-300"
            >
              {/* Wedge Background */}
              <path
                d={pathData}
                fill={isHovered ? 'url(#spokeHoverGrad)' : 'url(#spokeBgGrad)'}
                stroke="#C9952B"
                strokeWidth={isHovered ? '2.5' : '1.5'}
                opacity={isHovered ? 1 : 0.95}
                className="transition-all duration-300"
                style={{
                  filter: isHovered ? 'drop-shadow(0 0 12px rgba(201,149,43,0.6))' : 'none',
                }}
              />

              {/* Radial Dividing Line */}
              <line
                x1={polarToCartesian(center, center, rInner, startAngle).x}
                y1={polarToCartesian(center, center, rInner, startAngle).y}
                x2={polarToCartesian(center, center, rOuter, startAngle).x}
                y2={polarToCartesian(center, center, rOuter, startAngle).y}
                stroke="#C9952B"
                strokeWidth="1.5"
                opacity="0.7"
              />

              {/* Tip Decorative Gem Dot */}
              <circle
                cx={tipPos.x}
                cy={tipPos.y}
                r="4"
                fill="#FFFDF7"
                stroke="#C9952B"
                strokeWidth="1.5"
              />

              {/* Spoke Content (Icon + Name) */}
              <g
                transform={`translate(${pos.x}, ${pos.y}) scale(${isHovered ? 1.08 : 1})`}
                className="transition-transform duration-300"
                style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
              >
                {/* Icon Container */}
                <g
                  transform="translate(0, -12)"
                  className={isHovered ? 'text-[#8B1A2A]' : 'text-[#4A1010]'}
                >
                  {spoke.icon}
                </g>

                {/* Remedy Label */}
                <text
                  x="0"
                  y="16"
                  textAnchor="middle"
                  fontSize={spoke.name.length > 10 ? '8.5' : '9.5'}
                  fontWeight="800"
                  letterSpacing={spoke.name.length > 10 ? '0.3' : '0.6'}
                  fill={isHovered ? '#6E1515' : '#333333'}
                  fontFamily="sans-serif"
                >
                  {spoke.name}
                </text>
              </g>
            </g>
          );
        })}

        {/* Center Maroon Hub */}
        <g onClick={() => router.push('#remedies-grid')} className="cursor-pointer">
          {/* Outer Hub Border Ring */}
          <circle
            cx={center}
            cy={center}
            r={rInner + 2}
            fill="none"
            stroke="#C9952B"
            strokeWidth="2.5"
            filter="url(#goldGlow)"
          />
          <circle
            cx={center}
            cy={center}
            r={rInner - 2}
            fill="none"
            stroke="#F3D899"
            strokeWidth="1"
            opacity="0.8"
          />

          {/* Central Maroon Circle */}
          <circle
            cx={center}
            cy={center}
            r={rInner}
            fill="url(#hubMaroonGrad)"
          />

          {/* Central Logo Emblem */}
          <g transform={`translate(${center}, ${center - 20})`}>
            {/* Emblem Star */}
            <polygon
              points="0,-13 3,-5 11,-5 5,0 7,8 0,3 -7,8 -5,0 -11,-5 -3,-5"
              fill="#C9952B"
              opacity="0.9"
            />
            {/* Stylized 'A' */}
            <text
              x="0"
              y="8"
              fontSize="28"
              fontWeight="900"
              textAnchor="middle"
              fill="#FFFDF7"
              fontFamily="serif"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
            >
              A
            </text>
          </g>

          {/* Center Brand Text */}
          <text
            x={center}
            y={center + 18}
            textAnchor="middle"
            fontSize="11.5"
            fontWeight="900"
            letterSpacing="1.5"
            fill="#F3D899"
            fontFamily="serif"
          >
            ASTROPARIHAR
          </text>

          {/* Center Subtitle Text */}
          <text
            x={center}
            y={center + 32}
            textAnchor="middle"
            fontSize="7"
            fontWeight="700"
            letterSpacing="1.2"
            fill="#EAD292"
            opacity="0.9"
          >
            ASHTA DIGBANDHANA
          </text>

          {/* Decorative Bottom Ornament Line */}
          <path
            d={`M ${center - 20} ${center + 38} Q ${center} ${center + 42} ${center + 20} ${center + 38}`}
            fill="none"
            stroke="#C9952B"
            strokeWidth="1"
            opacity="0.7"
          />
        </g>
      </svg>
    </div>
  );
}
