import React from 'react';

interface SchoolLogoProps {
  className?: string; // e.g. w-8 h-8
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({ className = 'w-12 h-12' }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 500 500" 
      className={className}
      fill="none"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="crestBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" /> {/* Deep blue */}
          <stop offset="100%" stopColor="#312e81" /> {/* Darker indigo */}
        </linearGradient>
        <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" /> {/* Amber 400 */}
          <stop offset="50%" stopColor="#f59e0b" /> {/* Amber 500 */}
          <stop offset="100%" stopColor="#b45309" /> {/* Amber 700 */}
        </linearGradient>
        <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>

      {/* 1. Base Crest Background */}
      <circle cx="250" cy="250" r="230" fill="url(#crestBg)" />
      
      {/* Outer Trim rings */}
      <circle cx="250" cy="250" r="240" stroke="url(#goldTrim)" strokeWidth="12" fill="none" />
      <circle cx="250" cy="250" r="220" stroke="url(#goldTrim)" strokeWidth="4" fill="none" strokeDasharray="6,6" opacity="0.8" />
      
      {/* 2. Sunrise / Rays in the background symbolizing a new day/future */}
      <g stroke="#ffffff" strokeWidth="2" opacity="0.15">
        <line x1="250" y1="250" x2="50" y2="50" />
        <line x1="250" y1="250" x2="125" y2="20" />
        <line x1="250" y1="250" x2="250" y2="10" />
        <line x1="250" y1="250" x2="375" y2="20" />
        <line x1="250" y1="250" x2="450" y2="50" />
        <line x1="250" y1="250" x2="480" y2="150" />
        <line x1="250" y1="250" x2="20" y2="150" />
      </g>

      {/* 3. The School Building (Geometric abstraction in the background) */}
      <g fill="#4338ca" opacity="0.8">
        <path d="M 150 250 L 250 160 L 350 250 Z" /> {/* Main Roof */}
        <rect x="170" y="250" width="160" height="100" /> {/* Main Building */}
        
        {/* Pillars / Windows */}
        <rect x="190" y="270" width="20" height="80" fill="#312e81" />
        <rect x="240" y="270" width="20" height="80" fill="#312e81" />
        <rect x="290" y="270" width="20" height="80" fill="#312e81" />
        
        {/* Side wings */}
        <rect x="120" y="280" width="50" height="70" />
        <path d="M 120 280 L 145 255 L 170 280 Z" />
        <rect x="330" y="280" width="50" height="70" />
        <path d="M 330 280 L 355 255 L 380 280 Z" />
        
        {/* Foundation */}
        <rect x="100" y="350" width="300" height="15" fill="url(#goldTrim)" />
      </g>

      {/* 4. The Book of Knowledge (Foreground Center) */}
      <g>
        {/* Left Page */}
        <path d="M 248 380 C 180 390 140 370 140 320 C 140 300 180 290 248 310 Z" fill="url(#bookGradient)" 
              filter="drop-shadow(2px 5px 5px rgba(0,0,0,0.3))" />
        <path d="M 248 375 C 185 385 145 365 145 320 C 145 305 185 295 248 315 Z" fill="#ffffff" />
        {/* Lines matching textbook */}
        <path d="M 160 325 Q 190 315 235 325" stroke="#94a3b8" strokeWidth="2" fill="none" />
        <path d="M 160 340 Q 190 330 235 340" stroke="#94a3b8" strokeWidth="2" fill="none" />
        <path d="M 160 355 Q 190 345 235 355" stroke="#94a3b8" strokeWidth="2" fill="none" />

        {/* Right Page */}
        <path d="M 252 380 C 320 390 360 370 360 320 C 360 300 320 290 252 310 Z" fill="url(#bookGradient)" 
              filter="drop-shadow(2px 5px 5px rgba(0,0,0,0.3))" />
        <path d="M 252 375 C 315 385 355 365 355 320 C 355 305 315 295 252 315 Z" fill="#ffffff" />
        {/* Lines */}
        <path d="M 265 325 Q 310 315 340 325" stroke="#94a3b8" strokeWidth="2" fill="none" />
        <path d="M 265 340 Q 310 330 340 340" stroke="#94a3b8" strokeWidth="2" fill="none" />
        <path d="M 265 355 Q 310 345 340 355" stroke="#94a3b8" strokeWidth="2" fill="none" />

        {/* Center fold */}
        <path d="M 248 310 L 250 380 L 252 310 Z" fill="#94a3b8" />
        {/* Bookmark hanging down */}
        <path d="M 245 380 L 255 380 L 255 420 L 250 410 L 245 420 Z" fill="#dc2626" />
      </g>

      {/* 5. The Pen / Quill */}
      {/* Placed diagonally resting on the book */}
      <g transform="translate(240, 270) rotate(35) scale(0.9)">
        {/* Nib */}
        <path d="M 0 50 L -10 20 L 0 0 L 10 20 Z" fill="url(#goldTrim)" />
        <line x1="0" y1="20" x2="0" y2="45" stroke="#1e293b" strokeWidth="2" />
        <circle cx="0" cy="20" r="3" fill="#1e293b" />
        {/* Shaft */}
        <path d="M -8 50 L 8 50 L 5 130 L -5 130 Z" fill="#f8fafc" />
        {/* Feather Quill style details */}
        <path d="M -5 130 Q -40 100 -5 55 Q -20 90 -5 130" fill="#e2e8f0" />
        <path d="M 5 130 Q 40 100 5 55 Q 20 90 5 130" fill="#cbd5e1" />
        <path d="M 0 50 L 0 130" stroke="#94a3b8" strokeWidth="2" />
      </g>

      {/* 6. The Dove of Peace (Soaring above the school) */}
      <g fill="#ffffff" filter="drop-shadow(0px 8px 8px rgba(0,0,0,0.25))">
        {/* Body */}
        <path d="M 240 170 Q 250 150 270 140 Q 240 145 220 160 Z" />
        <path d="M 250 135 Q 260 120 275 125 Q 265 140 250 135 Z" /> {/* Head */}
        <circle cx="265" cy="128" r="1.5" fill="#1e3a8a" /> {/* Eye */}
        <path d="M 275 125 L 285 128 L 274 130 Z" fill="url(#goldTrim)" /> {/* Beak */}
        
        {/* Left Wing */}
        <path d="M 245 150 Q 210 100 160 90 Q 210 130 240 160 Z" />
        <path d="M 235 155 Q 190 110 140 110 Q 190 140 230 165 Z" />
        
        {/* Right Wing */}
        <path d="M 260 145 Q 290 90 340 70 Q 300 120 265 150 Z" />
        <path d="M 265 150 Q 300 100 350 90 Q 310 130 270 155 Z" />
        
        {/* Tail */}
        <path d="M 220 160 Q 200 170 180 190 Q 210 175 230 165 Z" />
      </g>

      {/* 7. Hoa Phượng Đỏ (Red Poinciana) - Wrapped around the bottom */}
      <g>
        {/* Left Branch */}
        <path d="M 80 320 Q 120 400 220 440" stroke="#166534" strokeWidth="8" strokeLinecap="round" fill="none" />
        {/* Right Branch */}
        <path d="M 420 320 Q 380 400 280 440" stroke="#166534" strokeWidth="8" strokeLinecap="round" fill="none" />
        
        {/* Leaves */}
        <path d="M 120 370 Q 140 350 150 370 Q 140 380 120 370 Z" fill="#22c55e" />
        <path d="M 160 405 Q 180 390 190 405 Q 180 420 160 405 Z" fill="#22c55e" />
        <path d="M 100 330 Q 115 320 125 330 Q 115 345 100 330 Z" fill="#15803d" />
        
        <path d="M 380 370 Q 360 350 350 370 Q 360 380 380 370 Z" fill="#22c55e" />
        <path d="M 340 405 Q 320 390 310 405 Q 320 420 340 405 Z" fill="#22c55e" />
        <path d="M 400 330 Q 385 320 375 330 Q 385 345 400 330 Z" fill="#15803d" />

        {/* Phượng Flowers (Red Petals) */}
        <g fill="#ef4444" stroke="#b91c1c" strokeWidth="1">
          {/* Flower 1 (Bottom Center) */}
          <path d="M 240 430 Q 230 410 250 415 Q 255 425 240 430 Z" />
          <path d="M 260 430 Q 270 410 250 415 Q 245 425 260 430 Z" />
          <path d="M 250 445 Q 230 450 250 435 Q 270 450 250 445 Z" />
          <circle cx="250" cy="430" r="3" fill="#fef08a" stroke="none" />

          {/* Flower 2 (Left) */}
          <path d="M 140 390 Q 130 370 150 375 Q 155 385 140 390 Z" />
          <path d="M 160 390 Q 170 370 150 375 Q 145 385 160 390 Z" />
          <path d="M 150 405 Q 130 410 150 395 Q 170 410 150 405 Z" />
          <circle cx="150" cy="390" r="2.5" fill="#fef08a" stroke="none" />

          {/* Flower 3 (Right) */}
          <path d="M 360 390 Q 370 370 350 375 Q 345 385 360 390 Z" />
          <path d="M 340 390 Q 330 370 350 375 Q 355 385 340 390 Z" />
          <path d="M 350 405 Q 370 410 350 395 Q 330 410 350 405 Z" />
          <circle cx="350" cy="390" r="2.5" fill="#fef08a" stroke="none" />
          
          {/* Small buds */}
          <circle cx="110" cy="360" r="5" />
          <circle cx="200" cy="425" r="5" />
          <circle cx="300" cy="425" r="5" />
          <circle cx="390" cy="360" r="5" />
        </g>
      </g>
      
      {/* 8. Text / Banner (Optional, keeping it clean is usually better for logos at small sizes) */}
      {/* In this case, we won't add text to the SVG so it scales perfectly, text will be handled by UI components. */}
      
    </svg>
  );
};

export default SchoolLogo;
