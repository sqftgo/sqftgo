"use client";

import React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface StepProgressProps {
  currentStep: number; // 0-indexed
  steps: string[];
}

export const StepProgress: React.FC<StepProgressProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full py-4 mb-8">
      {/* Visual Stepper */}
      <div className="flex items-center justify-between relative max-w-2xl mx-auto">
        {/* Background Track Line */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-sand -z-10" />

        {/* Animated Progress Line */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 left-0 h-0.5 bg-terracotta -z-10 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: currentStep / (steps.length - 1) }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ width: "100%" }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <div key={step} className="flex flex-col items-center gap-2 relative">
              {/* Step indicator circle */}
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted || isActive ? "#c95b3c" : "#f4edd9", // terracotta vs sand
                  scale: isActive ? 1.15 : 1,
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm text-white transition-all duration-300 ${
                  isCompleted || isActive
                    ? "bg-terracotta text-white shadow-md shadow-terracotta/20"
                    : "bg-sand text-charcoal/50"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </motion.div>

              {/* Step Label (Hidden on small mobile) */}
              <span
                className={`text-[10px] md:text-xs font-bold text-center absolute top-10 whitespace-nowrap transition-colors duration-300 ${
                  isActive
                    ? "text-terracotta font-black"
                    : isCompleted
                    ? "text-charcoal"
                    : "text-charcoal/40"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
      {/* Spacer to avoid label collisions */}
      <div className="h-4" />
    </div>
  );
};
export default StepProgress;
