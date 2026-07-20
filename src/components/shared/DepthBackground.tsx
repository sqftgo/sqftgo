"use client";
import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const DepthBackground: React.FC = () => {
  const { scrollY } = useScroll();

  // Parallax transformations for background layers
  // As the user scrolls down, these elements move up at a fraction of the scroll speed
  const palaceY = useTransform(scrollY, [0, 2000], [0, -180]);
  const wave1Y = useTransform(scrollY, [0, 2000], [0, -140]);
  const wave2Y = useTransform(scrollY, [0, 2000], [0, -90]);
  
  // Birds fly up and to the right faster to create horizontal and vertical depth
  const birdsY = useTransform(scrollY, [0, 2500], [0, -420]);
  const birdsX = useTransform(scrollY, [0, 2500], [0, 240]);
  const birdsScale = useTransform(scrollY, [0, 2500], [1, 1.3]);
  const birdsOpacity = useTransform(scrollY, [0, 500, 1500], [0.3, 0.45, 0]);

  // Subtle clouds floating parallax
  const cloudsY = useTransform(scrollY, [0, 2000], [0, -60]);

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none select-none bg-cream transition-colors duration-500">
      
      {/* Layer 1: Subtle traditional Rajasthani geometric Jaali background watermark (High top) */}
      <div className="absolute top-0 inset-x-0 h-[40vh] opacity-[0.03] dark:opacity-[0.01] pointer-events-none bg-[radial-gradient(#1b3864_1.2px,transparent_1.2px)] [background-size:16px_16px]" />

      {/* Layer 2: Parallax Clouds (Slow Drift) */}
      <motion.div 
        style={{ y: cloudsY }}
        className="absolute top-[10%] left-[5%] md:left-[15%] w-72 md:w-96 opacity-15"
      >
        <svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 40 Q25 20 45 35 Q60 15 85 30 Q110 5 145 28 Q170 15 190 40 Z" fill="#c95b3c" className="opacity-20" />
        </svg>
      </motion.div>
      <motion.div 
        style={{ y: cloudsY }}
        className="absolute top-[22%] right-[10%] w-60 md:w-80 opacity-10"
      >
        <svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 40 Q30 15 60 35 Q85 10 115 30 Q145 15 180 40 Z" fill="#1b3864" className="opacity-20" />
        </svg>
      </motion.div>

      {/* Layer 3: Flying Birds Parallax (Medium-Fast speed) */}
      <motion.div
        style={{ y: birdsY, x: birdsX, scale: birdsScale, opacity: birdsOpacity }}
        className="absolute top-[45%] left-[10%] md:left-[20%] w-48 z-10"
      >
        <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo/25">
          {/* Bird 1 */}
          <path d="M 30 40 Q 45 20 50 35 Q 55 20 70 40 Q 50 30 30 40 Z" fill="currentColor" />
          {/* Bird 2 */}
          <path d="M 110 70 Q 120 55 124 66 Q 128 55 138 70 Q 124 62 110 70 Z" fill="currentColor" className="opacity-80" />
          {/* Bird 3 */}
          <path d="M 80 110 Q 92 98 96 108 Q 100 98 112 110 Q 96 104 80 110 Z" fill="currentColor" className="opacity-60" />
          {/* Bird 4 */}
          <path d="M 180 50 Q 190 38 194 46 Q 198 38 208 50 Q 194 44 180 50 Z" fill="currentColor" className="opacity-50" />
        </svg>
      </motion.div>

      {/* Layer 4: Elegant Hand-drawn Palace Silhouette at bottom right (Slow speed) */}
      <motion.div
        style={{ y: palaceY }}
        className="absolute bottom-[-50px] right-[-30px] w-[95%] sm:w-[60%] md:w-[45%] lg:w-[38%] max-w-[580px] aspect-[1.3/1] opacity-[0.06] sm:opacity-[0.09] text-indigo pointer-events-none z-0"
      >
        <svg viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Detailed palace architecture lines */}
          <path
            d="
              M 0 500 
              L 0 420 
              Q 10 420 20 400 
              L 20 340 
              L 50 340 
              L 50 280 
              L 40 280 
              L 40 260 
              C 40 240, 50 210, 65 210 
              C 80 210, 90 240, 90 260 
              L 90 280 
              L 80 280 
              L 80 340 
              L 120 340 
              L 120 300 
              Q 135 285 150 300 
              L 150 340 
              L 190 340 
              L 190 210 
              L 170 210 
              L 170 190 
              C 170 160, 195 130, 215 130 
              C 235 130, 260 160, 260 190 
              L 260 210 
              L 240 210 
              L 240 340 
              L 280 340 
              L 280 290 
              C 280 260, 310 260, 310 290 
              L 310 340 
              L 360 340 
              L 360 140 
              L 330 140 
              L 330 100 
              C 330 80, 340 50, 365 50 
              C 390 50, 400 80, 400 100 
              L 400 140 
              L 370 140 
              L 370 340 
              L 420 340 
              L 420 230 
              L 400 230 
              L 400 210 
              C 400 180, 420 150, 440 150 
              C 460 150, 480 180, 480 210 
              L 480 230 
              L 460 230 
              L 460 340 
              L 500 340 
              L 500 310 
              Q 515 295 530 310 
              L 530 340 
              Q 560 340 580 360 
              L 580 500 
              Z
            "
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Small details inside the palace (windows and arches) */}
          <path d="M 200 240 H 230 M 200 270 H 230 M 215 240 V 290" stroke="currentColor" strokeWidth="1" />
          <path d="M 370 180 H 390 M 370 210 H 390 M 380 180 V 240" stroke="currentColor" strokeWidth="1" />
          <path d="M 60 300 Q 65 290 70 300 V 320 H 60 Z" stroke="currentColor" strokeWidth="1.2" />
          <path d="M 435 260 Q 440 250 445 260 V 280 H 435 Z" stroke="currentColor" strokeWidth="1.2" />
          
          {/* Lattice / Jaali railings */}
          <path d="M 20 350 H 580 M 20 360 H 580" stroke="currentColor" strokeWidth="1" />
          <path d="M 30 350 V 360 M 60 350 V 360 M 90 350 V 360 M 120 350 V 360 M 150 350 V 360 M 180 350 V 360 M 210 350 V 360 M 240 350 V 360 M 270 350 V 360 M 300 350 V 360 M 330 350 V 360 M 360 350 V 360 M 390 350 V 360 M 420 350 V 360 M 450 350 V 360 M 480 350 V 360 M 510 350 V 360 M 540 350 V 360 M 570 350 V 360" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      </motion.div>

      {/* Layer 5: Rippling Lake Waves at the bottom (Water line - moves slightly slower) */}
      <div className="absolute bottom-0 inset-x-0 h-24 opacity-[0.04] sm:opacity-[0.06] text-indigo z-10 pointer-events-none">
        <motion.svg style={{ y: wave1Y }} viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-4 w-full h-full">
          <path d="M0,64 C240,96 480,96 720,64 C960,32 1200,32 1440,64 L1440,120 L0,120 Z" fill="currentColor" />
        </motion.svg>
        <motion.svg style={{ y: wave2Y }} viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full h-full text-indigo/60">
          <path d="M0,80 C360,40 720,40 1080,80 C1260,100 1380,100 1440,80 L1440,120 L0,120 Z" fill="currentColor" />
        </motion.svg>
      </div>

    </div>
  );
};

export default DepthBackground;
