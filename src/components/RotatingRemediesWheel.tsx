'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface RemedyWheelItem {
  id: string;
  name: string;
  href: string;
  angle: number; // in degrees, top is -90
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

export const REMEDIES_WHEEL_ITEMS: RemedyWheelItem[] = [
  {
    id: 'gemstone',
    name: 'GEMSTONE',
    href: '/remedies/gemstone',
    angle: -90, // North / Top
    icon: (
      // Clean Linear Diamond
      <g transform="scale(1.15)">
        <polygon points="0,-12 11,-12 17,-4 0,14 -17,-4 -11,-12" fill="none" stroke="#221C19" strokeWidth="1.8" strokeLinejoin="round" />
        <line x1="-11" y1="-12" x2="0" y2="14" stroke="#221C19" strokeWidth="1.1" />
        <line x1="11" y1="-12" x2="0" y2="14" stroke="#221C19" strokeWidth="1.1" />
        <line x1="-17" y1="-4" x2="17" y2="-4" stroke="#221C19" strokeWidth="1.1" />
        <line x1="-11" y1="-12" x2="-5" y2="-4" stroke="#221C19" strokeWidth="1.1" />
        <line x1="11" y1="-12" x2="5" y2="-4" stroke="#221C19" strokeWidth="1.1" />
      </g>
    ),
  },
  {
    id: 'mantra',
    name: 'MANTRA',
    href: '/remedies/mantra',
    angle: -45, // North-East
    icon: (
      // Sacred ॐ (Aum)
      <g transform="scale(1.25)">
        <text x="0" y="6" fontSize="22" fontWeight="900" fontFamily="serif" textAnchor="middle" fill="#221C19">
          ॐ
        </text>
      </g>
    ),
  },
  {
    id: 'yantra',
    name: 'YANTRA',
    href: '/remedies/yantra',
    angle: 0, // East / Right
    icon: (
      // Sacred Yantra geometric emblem
      <g transform="scale(1.1)">
        <rect x="-12" y="-12" width="24" height="24" fill="none" stroke="#221C19" strokeWidth="1.8" />
        <circle cx="0" cy="0" r="9.5" fill="none" stroke="#221C19" strokeWidth="1.1" />
        <polygon points="0,-8 7,4.5 -7,4.5" fill="none" stroke="#221C19" strokeWidth="1.1" />
        <polygon points="0,8 7,-4.5 -7,-4.5" fill="none" stroke="#221C19" strokeWidth="1.1" />
        <circle cx="0" cy="0" r="1.5" fill="#221C19" />
      </g>
    ),
  },
  {
    id: 'homa-puja',
    name: 'HOMA & PUJA',
    href: '/remedies/homa',
    angle: 45, // South-East
    icon: (
      // Sacred Homa Kunda with Fire Flame
      <g transform="scale(1.15)">
        <path d="M-12,8 L12,8 L8,12 L-8,12 Z" fill="#221C19" />
        <path d="M-10,6 L10,6 L7,8 L-7,8 Z" fill="none" stroke="#221C19" strokeWidth="1.2" />
        <path d="M0,-11 C-5,-4 -7,-1 -7,4 C-7,8 -4,9 0,9 C4,9 7,8 7,4 C7,-1 5,-4 0,-11 Z" fill="none" stroke="#221C19" strokeWidth="1.7" />
        <path d="M0,-4 C-2,-1 -2.5,1 -2.5,3.5 C-2.5,5.5 -1.5,6.5 0,6.5 C1.5,6.5 2.5,5.5 2.5,3.5 C2.5,1 2,-1 0,-4 Z" fill="#221C19" />
      </g>
    ),
  },
  {
    id: 'devata-upasana',
    name: 'DEVATA UPASANA',
    href: '/remedies/ishta-devata',
    angle: 90, // South / Bottom
    icon: (
      // Meditating Deity in Lotus Posture
      <g transform="scale(1.15)">
        <circle cx="0" cy="-6.5" r="4" fill="none" stroke="#221C19" strokeWidth="1.7" />
        <path d="M-8,10 C-8,5.5 -4,3.5 0,3.5 C4,3.5 8,5.5 8,10" fill="none" stroke="#221C19" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M-11,10.5 C-6,12.5 6,12.5 11,10.5" fill="none" stroke="#221C19" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="0" cy="-12" r="1.3" fill="#221C19" />
      </g>
    ),
  },
  {
    id: 'dana',
    name: 'DĀNA',
    href: '/remedies/charity',
    angle: 135, // South-West
    icon: (
      // Giving Hands with Sacred Heart
      <g transform="scale(1.15)">
        <path d="M0,-2 C-2.8,-5.5 -8,-4.5 -8,0 C-8,4.5 0,9.5 0,9.5 C0,9.5 8,4.5 8,0 C8,-4.5 2.8,-5.5 0,-2 Z" fill="#221C19" />
        <path d="M-11,11 C-7,8.5 -2.5,7.8 0,7.8 C2.5,7.8 7,8.5 11,11" fill="none" stroke="#221C19" strokeWidth="1.7" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'vrata',
    name: 'VRATA',
    href: '/remedies/fasting',
    angle: 180, // West / Left
    icon: (
      // Sacred Kalasha (Pot with Coconut)
      <g transform="scale(1.15)">
        <path d="M-6,10 L6,10 C8,10 9.5,7 9.5,3.5 C9.5,-0.5 6,-2.5 4.5,-2.5 L-4.5,-2.5 C-6,-2.5 -9.5,-0.5 -9.5,3.5 C-9.5,7 -8,10 -6,10 Z" fill="none" stroke="#221C19" strokeWidth="1.7" />
        <circle cx="0" cy="-6" r="3.5" fill="none" stroke="#221C19" strokeWidth="1.5" />
        <path d="M-7,-2.5 L0,-10 L7,-2.5" fill="none" stroke="#221C19" strokeWidth="1.3" />
        <line x1="-4.5" y1="1" x2="4.5" y2="1" stroke="#221C19" strokeWidth="1.1" />
      </g>
    ),
  },
  {
    id: 'vastu',
    name: 'VASTU',
    href: '/remedies/vastu',
    angle: 225, // North-West
    icon: (
      // Sacred Vastu Home / Directional Temple
      <g transform="scale(1.15)">
        <path d="M0,-11 L-12,-0.5 L-8.5,-0.5 L-8.5,10 L8.5,10 L8.5,-0.5 L12,-0.5 Z" fill="none" stroke="#221C19" strokeWidth="1.7" strokeLinejoin="round" />
        <rect x="-2.5" y="2" width="5" height="8" fill="none" stroke="#221C19" strokeWidth="1.3" />
        <circle cx="0" cy="-4.5" r="1.6" fill="#221C19" />
      </g>
    ),
  },
];

interface RotatingRemediesWheelProps {
  className?: string;
}

export default function RotatingRemediesWheel({ className = '' }: RotatingRemediesWheelProps) {
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const center = 360;
  const rOuter = 320;
  const rInner = 115;
  const rMid = 220;

  return (
    <div className={`w-full max-w-[460px] sm:max-w-[490px] md:max-w-[520px] lg:max-w-[550px] xl:max-w-[580px] mx-auto flex flex-col items-center select-none group ${className}`}>
      {/* Outer Container with Ambient Glow */}
      <div className="relative w-full aspect-square flex items-center justify-center p-1">
        {/* Ambient Warm Golden Aura Glow */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-r from-[#B88A44]/25 via-[#E6CA65]/20 to-[#713B32]/30 blur-3xl pointer-events-none" />

        {/* ROTATING WHEEL LAYER: 8 Sectors, Dividers & Pearl Nodes */}
        <div className="relative w-full h-full animate-[spin_55s_linear_infinite] group-hover:[animation-play-state:paused] transition-all duration-300">
          <svg
            viewBox="0 0 720 720"
            className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.65)]"
          >
            <defs>
              {/* Sector Ivory-Cream Radial Gradient */}
              <radialGradient id="sectorCreamGrad" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="#F9F4EA" />
                <stop offset="100%" stopColor="#EDE3D1" />
              </radialGradient>

              {/* Hover Golden Warm Highlight Gradient */}
              <radialGradient id="sectorHoverGrad" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="#FFF9E6" />
                <stop offset="60%" stopColor="#FCEFC7" />
                <stop offset="100%" stopColor="#EED99E" />
              </radialGradient>

              {/* Pearl Node Glow */}
              <filter id="pearlGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base Full Circular Background for seamless cream base */}
            <circle
              cx={center}
              cy={center}
              r={rOuter}
              fill="url(#sectorCreamGrad)"
            />

            {/* 8 Sector Wedges */}
            {REMEDIES_WHEEL_ITEMS.map((item) => {
              const startAngle = item.angle - 22.5;
              const endAngle = item.angle + 22.5;
              const pathData = describeDonutSegment(center, center, rInner, rOuter, startAngle, endAngle);
              const isHovered = hoveredItem === item.id;

              // Position for Icon and Text
              const pos = polarToCartesian(center, center, rMid, item.angle);

              return (
                <g
                  key={item.id}
                  onClick={() => router.push(item.href)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="cursor-pointer transition-all duration-200"
                >
                  {/* Wedge Shape with Hover Glow */}
                  <path
                    d={pathData}
                    fill={isHovered ? 'url(#sectorHoverGrad)' : 'url(#sectorCreamGrad)'}
                    stroke="#D4A03D"
                    strokeWidth={isHovered ? '2.5' : '1.2'}
                    className="transition-colors duration-200"
                  />

                  {/* Radial Divider Border Line */}
                  <line
                    x1={polarToCartesian(center, center, rInner, startAngle).x}
                    y1={polarToCartesian(center, center, rInner, startAngle).y}
                    x2={polarToCartesian(center, center, rOuter, startAngle).x}
                    y2={polarToCartesian(center, center, rOuter, startAngle).y}
                    stroke="#C9952B"
                    strokeWidth="1.8"
                    opacity="0.9"
                  />

                  {/* Sector Icon & Label Group */}
                  <g
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className="transition-transform duration-200"
                  >
                    {/* Icon */}
                    <g transform="translate(0, -18)">
                      {item.icon}
                    </g>

                    {/* Sector Text Label */}
                    <text
                      x="0"
                      y="16"
                      textAnchor="middle"
                      fontSize={item.name.length > 10 ? '11.5' : '12.5'}
                      fontWeight="900"
                      letterSpacing="0.8"
                      fill="#221C19"
                      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    >
                      {item.name}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Outer Perimeter Rings */}
            <circle
              cx={center}
              cy={center}
              r={rOuter}
              fill="none"
              stroke="#D4A03D"
              strokeWidth="2.8"
            />
            <circle
              cx={center}
              cy={center}
              r={rOuter + 8}
              fill="none"
              stroke="#C9952B"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.85"
            />
            <circle
              cx={center}
              cy={center}
              r={rOuter + 14}
              fill="none"
              stroke="#E6CA65"
              strokeWidth="0.8"
              opacity="0.5"
            />

            {/* 8 Outer Golden Pearl Nodes at Sector Division Points */}
            {REMEDIES_WHEEL_ITEMS.map((item) => {
              const dividerAngle = item.angle + 22.5;
              const nodePos = polarToCartesian(center, center, rOuter + 8, dividerAngle);

              return (
                <g key={`node-${item.id}`} filter="url(#pearlGlow)">
                  <circle
                    cx={nodePos.x}
                    cy={nodePos.y}
                    r="5.5"
                    fill="#FFFDF7"
                    stroke="#D4A03D"
                    strokeWidth="1.8"
                  />
                  <circle
                    cx={nodePos.x}
                    cy={nodePos.y}
                    r="2.5"
                    fill="#E6CA65"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* STATIC CENTER HUB LAYER (DOES NOT ROTATE): Sacred AstroParihar Logo Emblem */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Link
            href="/remedies"
            className="group/center relative w-[32.6%] h-[32.6%] rounded-full flex items-center justify-center pointer-events-auto cursor-pointer shadow-[0_0_35px_rgba(0,0,0,0.85)] border-[3.5px] border-[#ECC94B] ring-2 ring-[#713B32]/40 bg-[#221C19] hover:scale-105 transition-transform duration-300 overflow-hidden"
            title="AstroParihar Sacred Remedies"
          >
            <Image
              src="/AstroParihar_Emblem.png"
              alt="AstroParihar Sacred Emblem"
              fill
              className="object-cover rounded-full"
              priority
            />
            {/* Inner gold rim ring */}
            <div className="absolute inset-0 rounded-full border border-[#C9952B]/80 pointer-events-none" />
          </Link>
        </div>
      </div>

      {/* Subtitle / Interactive Hint under the wheel */}
      <div className="text-center pt-2">
        <p className="text-xs text-white/70 font-medium tracking-wide flex items-center justify-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-[#ECC94B] animate-pulse" />
          <span>Click any remedy sector to explore</span>
        </p>
      </div>
    </div>
  );
}
