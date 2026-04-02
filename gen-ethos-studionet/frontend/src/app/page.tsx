import { GlobalStats } from "@/features/dashboard/global-stats";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Cpu } from "@phosphor-icons/react/dist/ssr";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)]">
      {/* 
        BRUTALIST HERO SECTION
        - Asymmetric Tension
        - Typographic dominance
        - Sharp 0px edges, high contrast 
      */}
      <div className="w-full flex-1 flex flex-col md:flex-row border-b-2 border-black dark:border-white">
        
        {/* Left Typography Column */}
        <div className="w-full md:w-[65%] p-8 md:p-16 lg:p-24 flex flex-col justify-center border-b-2 md:border-b-0 md:border-r-2 border-black dark:border-white relative bg-white dark:bg-[#050505]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500" />
          
          <div className="inline-flex gap-2 items-center px-3 py-1 bg-[#CCFF00] text-black border-2 border-black dark:border-white uppercase tracking-[0.2em] text-[10px] w-fit mb-10 font-mono">
            <Cpu size={14} weight="bold" />
            <span>GenLayer Mainnet Ready</span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-[7rem] leading-[0.85] font-black tracking-tighter uppercase italic text-black dark:text-white mb-8">
            Trust is <br/>
            <span className="text-transparent bg-clip-text bg-black dark:bg-white [-webkit-text-stroke:2px_black] dark:[-webkit-text-stroke:2px_white]">Computed.</span><br/>
            Not Promised.
          </h1>

          <p className="text-lg md:text-xl font-bold max-w-xl text-black dark:text-gray-300 leading-relaxed tracking-tight border-l-4 border-black dark:border-white pl-6 mb-12">
            The first Decentralized Autonomous Oversight (DAO) mechanism for ESG verification. 
            Powered by GenLayer&apos;s Equivalence Principle, turning LLMs into trustless auditors.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/audit-engine" 
              className="flex items-center justify-center gap-3 px-8 py-5 bg-[#CCFF00] text-black border-2 border-black dark:border-white font-black uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#CCFF00] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_#CCFF00] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
            >
              Initialize Audit <ArrowRight size={16} weight="bold" />
            </Link>
            <Link 
              href="/explorer" 
              className="flex items-center justify-center gap-3 px-8 py-5 border-2 border-black dark:border-white bg-white dark:bg-[#050505] text-black dark:text-white font-black uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#CCFF00] hover:bg-[#CCFF00] dark:hover:bg-[#CCFF00] dark:hover:text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_#CCFF00] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
            >
              Public Ledger <ShieldCheck size={16} weight="bold" />
            </Link>
          </div>
        </div>

        {/* Right Terminal/Abstract Column */}
        <div className="w-full md:w-[35%] bg-black text-[#CCFF00] p-8 md:p-12 overflow-hidden flex flex-col justify-end relative rounded-none">
          <div className="absolute top-0 right-0 p-4 opacity-50">
            <div className="grid grid-cols-4 gap-2">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-[#CCFF00] opacity-30 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
          
          <div className="font-mono text-xs opacity-70 mb-auto mt-20 md:mt-0 tracking-widest leading-loose">
            {`> initializing genVM...`}
            <br />
            <span className="opacity-50">{`[OK] RPC connected`}</span>
            <br />
            {`> querying consensus layer`}
            <br />
            <span className="opacity-50">{`[WAIT] collecting proposals...`}</span>
            <br />
            {`> 0x9fB...29a verifying claim`}
            <br />
            <span className="text-emerald-400 font-bold">{`>> EQUIVALENCE REACHED`}</span>
          </div>

          <div className="mt-20">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-50 mb-4">Cryptographic Guarantee</p>
            <div className="text-3xl font-black italic tracking-tighter">
              100% UNBIASED. <br/>
              0% GREENWASHING.
            </div>
          </div>
        </div>
      </div>

      {/* Global Stats Bar */}
      <div className="w-full border-b-2 border-black dark:border-white bg-white dark:bg-[#050505] p-8 md:p-16">
        <GlobalStats />
      </div>
    </div>
  );
}
