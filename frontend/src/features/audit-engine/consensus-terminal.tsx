"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { AuditStage } from "@/types";
import {
  Terminal,
  CircleNotch,
  CheckCircle,
  XCircle,
  Globe,
  Brain,
  UsersThree,
  SealCheck,
  WifiHigh,
} from "@phosphor-icons/react";

type IconWeight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
type StageIcon = React.ComponentType<{ className?: string; weight?: IconWeight }>;

interface ConsensusTerminalProps {
  stage: AuditStage;
  stageIndex: number;
  totalStages: number;
  stages: { stage: AuditStage; label: string; duration: number }[];
}

const stageIcons: Partial<Record<AuditStage, StageIcon>> = {
  broadcasting: WifiHigh,
  rendering: Globe,
  reasoning: Brain,
  consensus: UsersThree,
  finalizing: SealCheck,
};

export function ConsensusTerminal({
  stage,
  stageIndex,
  totalStages,
  stages,
}: ConsensusTerminalProps) {
  if (stage === "idle") return null;

  const isComplete = stage === "complete";
  const isError = stage === "error";
  const progress = isComplete
    ? 100
    : isError
      ? 0
      : Math.round(((stageIndex + 1) / totalStages) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="mt-6 overflow-hidden rounded-none border-2 border-black bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
    >
      <div className="flex items-center gap-2 border-b-2 border-zinc-800 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <Terminal className="ml-2 h-4 w-4 text-zinc-500" weight="bold" />
        <span className="font-mono text-[11px] tracking-wider text-[#CCFF00] opacity-70">
          genvm-consensus
        </span>
        <span className="ml-auto font-mono text-[10px] text-[#CCFF00] opacity-50">
          {progress}%
        </span>
      </div>

      <div className="space-y-1.5 p-4 font-mono text-xs leading-relaxed">
        <AnimatePresence mode="popLayout">
          {stages.map((s, i) => {
            if (i > stageIndex && !isComplete) return null;
            const isCurrentStage = i === stageIndex && !isComplete && !isError;
            const isDone = i < stageIndex || isComplete;
            const StageIcon = stageIcons[s.stage] || Terminal;

            return (
              <motion.div
                key={s.stage}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center gap-2"
              >
                <span className="select-none text-[#CCFF00] opacity-50">{">"}</span>

                {isDone ? (
                  <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#CCFF00]" weight="bold" />
                ) : isCurrentStage ? (
                  <CircleNotch
                    className="h-3.5 w-3.5 shrink-0 animate-spin text-[#CCFF00]"
                    weight="bold"
                  />
                ) : (
                  <StageIcon
                    className="h-3.5 w-3.5 shrink-0 text-[#CCFF00] opacity-50"
                    weight="regular"
                  />
                )}

                <span
                  className={
                    isDone
                      ? "text-[#CCFF00]"
                      : isCurrentStage
                        ? "font-bold text-[#CCFF00]"
                        : "text-[#CCFF00] opacity-50"
                  }
                >
                  {s.label}
                </span>

                {isCurrentStage && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-[#CCFF00]"
                  >
                    |
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-center gap-2 border-t border-zinc-800 pt-2"
            >
              <span className="select-none text-[#CCFF00] opacity-50">{">"}</span>
              <SealCheck className="h-4 w-4 text-[#CCFF00]" weight="bold" />
              <span className="font-bold uppercase tracking-wider text-[#CCFF00]">
                Consensus reached - verdict finalized on-chain.
              </span>
            </motion.div>
          )}
          {isError && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-center gap-2 border-t border-zinc-800 pt-2"
            >
              <span className="select-none text-[#CCFF00] opacity-50">{">"}</span>
              <XCircle className="h-4 w-4 text-[#CCFF00]" weight="bold" />
              <span className="font-bold uppercase tracking-wider text-[#CCFF00]">
                Transaction failed - check logs for details.
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-1 w-full bg-zinc-900">
        <motion.div
          className={`h-full ${isError ? "bg-red-500" : "bg-[#CCFF00]"}`}
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}
