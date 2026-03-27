"use client";
import React, { useMemo } from 'react';

interface IntelligencePanelProps {
  lastDraws: any[];
  onApplySuggestion: (numbers: number[]) => void;
}

export const IntelligencePanel = ({ lastDraws, onApplySuggestion }: IntelligencePanelProps) => {
  const recommendations = useMemo(() => {
    if (!lastDraws || lastDraws.length < 5) return null;

    const analysisData = lastDraws.slice(0, 150);
    const totalDraws = analysisData.length;
    const lastDrawNumbers = (analysisData[0].dezenas || analysisData[0].numbers || []).map(Number);

    const stats = Array.from({ length: 25 }, (_, i) => {
      const num = i + 1;
      let appearances = 0;
      let lastSeenIndex = -1;
      let currentStreak = 0;
      let inStreak = true;

      analysisData.forEach((draw, idx) => {
        const nums = (draw.dezenas || draw.numbers || []).map(Number);
        if (nums.includes(num)) {
          appearances++;
          if (lastSeenIndex === -1) lastSeenIndex = idx;
          if (inStreak) currentStreak++;
        } else {
          inStreak = false;
        }
      });

      const frequency = (appearances / totalDraws) * 100;
      const delay = lastSeenIndex === -1 ? totalDraws : lastSeenIndex;
      const isRepeatedFromLast = lastDrawNumbers.includes(num);
      const isOdd = num % 2 !== 0;

      let score = frequency * 0.4;
      if (isRepeatedFromLast) score += 20; 
      if (delay >= 3) score += 35; 
      if (delay === 1) score += 10; 
      if (isOdd) score += 5; 
      if (currentStreak >= 4) score -= 30;

      return { num, frequency, delay, currentStreak, score, isRepeatedFromLast };
    });

    const top17 = [...stats]
      .sort((a, b) => b.score - a.score)
      .slice(0, 17)
      .sort((a, b) => a.num - b.num);

    return { top17, allStats: stats, lastDrawNumbers };
  }, [lastDraws]);

  if (!recommendations) {
    return (
      <div className="bg-slate-900 p-6 md:p-8 rounded-[40px] border border-blue-500/20 text-center w-full">
        <p className="text-blue-400 font-black uppercase text-[10px] tracking-widest">Aguardando dados...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 p-5 md:p-8 rounded-[40px] shadow-2xl border border-blue-500/30 w-full box-border overflow-hidden">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          {/* CORREÇÃO AQUI: Tamanho do ícone controlado pelo container pai */}
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
             <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="3"
              className="w-5 h-5 md:w-6 md:h-6" // Controla o tamanho responsivo via CSS
             >
               <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
             </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter italic truncate">Cérebro Estatístico</h2>
            <p className="text-[9px] md:text-[10px] text-blue-400 font-bold uppercase tracking-widest">Análise Repetidas • {lastDraws.length} Concursos</p>
          </div>
        </div>

        <button 
          onClick={() => onApplySuggestion(recommendations.top17.map(i => i.num))}
          className="w-full lg:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 md:px-8 py-3.5 md:py-4 rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3"
        >
          Aplicar Top 17
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
        <div className="xl:col-span-8 bg-white/5 p-4 md:p-6 rounded-[32px] border border-white/5 w-full box-border">
          <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase mb-4 block italic">Top 17 Sugeridas:</span>
          
          <div className="flex flex-wrap gap-2 md:gap-3">
            {recommendations.top17.map((item) => (
              <div key={item.num} className="group relative">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-sm md:text-md font-black shadow-xl border transition-all
                  ${item.isRepeatedFromLast 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white border-blue-400/30' 
                    : 'bg-slate-800 text-blue-400 border-slate-700'}`}>
                  {String(item.num).padStart(2, '0')}
                </div>
                {item.isRepeatedFromLast && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
                )}
              </div>
            ))}
          </div>
          <p className="text-[8px] md:text-[9px] text-slate-500 mt-4 uppercase font-bold italic">* Azul sólido: vieram do último sorteio.</p>
        </div>

        <div className="xl:col-span-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
          <div className="bg-orange-500/10 p-4 md:p-5 rounded-3xl border border-orange-500/20">
            <span className="text-[9px] md:text-[10px] font-black text-orange-400 uppercase italic block mb-2">🔥 Ciclo Quente</span>
            <div className="flex flex-wrap gap-1.5">
              {recommendations.allStats
                .sort((a, b) => b.frequency - a.frequency)
                .slice(0, 5)
                .map(s => (
                <span key={s.num} className="text-white font-black text-[10px] bg-orange-500/20 px-2 py-1 rounded-md">
                  {String(s.num).padStart(2, '0')}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-500/10 p-4 md:p-5 rounded-3xl border border-blue-500/20">
            <span className="text-[9px] md:text-[10px] font-black text-blue-400 uppercase italic block mb-2">❄️ Atrasos</span>
            <div className="flex flex-wrap gap-1.5">
              {recommendations.allStats
                .sort((a, b) => b.delay - a.delay)
                .slice(0, 5)
                .map(s => (
                <span key={s.num} className="text-white font-black text-[10px] bg-blue-500/20 px-2 py-1 rounded-md">
                  {String(s.num).padStart(2, '0')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};