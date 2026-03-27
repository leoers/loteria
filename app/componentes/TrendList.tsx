import React, { useState, useMemo } from 'react';

interface TendenciasProps {
  lastDraws: any[]; 
  loading: boolean;
  favorites?: number[]; // Adicionado para controle visual
  toggleFavorite?: (n: number) => void; // Adicionado para interação direta
}

export const TendenciasPanel = ({ lastDraws, loading, favorites = [], toggleFavorite }: TendenciasProps) => {
  const [range, setRange] = useState(10);
  const [sortType, setSortType] = useState<'delay' | 'delay_low' | 'freq_high' | 'freq_low'>('delay');

  const stats = useMemo(() => {
    if (loading || !lastDraws || lastDraws.length === 0) return [];

    const sortedByLatest = [...lastDraws].sort((a, b) => {
      const numA = Number(a.concurso || a.numero || a.id || 0);
      const numB = Number(b.concurso || b.numero || b.id || 0);
      return numB - numA;
    });

    const filteredDraws = sortedByLatest.slice(0, range);
    const totalNumbers = 25;
    const statsArray = [];

    for (let i = 1; i <= totalNumbers; i++) {
      let delay = 0;
      let count = 0;
      let countingDelay = true;

      filteredDraws.forEach((draw) => {
        const nums = (draw.dezenas || draw.numbers || []).map(Number);
        if (nums.includes(i)) {
          count++;
          countingDelay = false; 
        } else if (countingDelay) {
          delay++; 
        }
      });

      statsArray.push({
        number: i,
        displayNumber: String(i).padStart(2, '0'),
        delay: delay,
        count: count
      });
    }

    // Lógica de Ordenação
    if (sortType === 'delay') {
        statsArray.sort((a, b) => b.delay - a.delay || b.count - a.count);
    } else if (sortType === 'delay_low') {
        statsArray.sort((a, b) => a.delay - b.delay || b.count - a.count);
    } else if (sortType === 'freq_high') {
        statsArray.sort((a, b) => b.count - a.count || a.delay - b.delay);
    } else if (sortType === 'freq_low') {
        statsArray.sort((a, b) => a.count - b.count || b.delay - a.delay);
    }

    return statsArray.map((item, index) => {
      let colorClass = 'border-slate-800 text-slate-800';
      let labelColor = 'text-slate-400';

      if (sortType === 'delay' || sortType === 'delay_low') {
        if (item.delay >= 2) {
            colorClass = 'border-red-600 text-red-600 bg-red-50/30';
            labelColor = 'text-red-500';
        } else if (item.delay === 1) {
            colorClass = 'border-amber-600 text-amber-600 bg-amber-50/30';
            labelColor = 'text-amber-600';
        } else {
            colorClass = 'border-emerald-600 text-emerald-600 bg-emerald-50/30';
            labelColor = 'text-emerald-500';
        }
      } else {
        if (index < 10) {
            colorClass = 'border-emerald-600 text-emerald-600 bg-emerald-50/30';
            labelColor = 'text-emerald-500';
        } else if (index < 20) {
            colorClass = 'border-amber-600 text-amber-600 bg-amber-50/30';
            labelColor = 'text-amber-600';
        } else {
            colorClass = 'border-red-600 text-red-600 bg-red-50/30';
            labelColor = 'text-red-500';
        }
      }

      return { ...item, colorClass, labelColor };
    });

  }, [lastDraws, range, sortType, loading]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center h-[600px]">
        <div className="relative w-10 h-10">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-50 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <span className="text-[10px] font-black uppercase text-slate-400 italic mt-4 tracking-widest">Sincronizando...</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[600px] relative overflow-hidden">
      {/* HEADER FIXO */}
      <div className="mb-6 space-y-4 shrink-0">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic">
            Tendências
          </h2>
          {lastDraws[0] && (
            <span className="text-[9px] font-black bg-slate-50 text-slate-400 px-3 py-1 rounded-full border border-slate-100 uppercase italic">
              Jogo Nº:{lastDraws[0].concurso || lastDraws[0].numero}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <select 
            value={range} 
            onChange={(e) => setRange(Number(e.target.value))}
            className="flex-1 text-[9px] font-black border-none bg-gray-50 rounded-xl px-3 py-2.5 outline-none text-slate-500 uppercase cursor-pointer hover:bg-slate-900 hover:text-white transition-all shadow-inner"
          >
            {[10, 20, 30, 40, 50].map(n => (
              <option key={n} value={n}>{n} Rodadas</option>
            ))}
          </select>

          <select 
            value={sortType} 
            onChange={(e) => setSortType(e.target.value as any)}
            className="flex-1 text-[9px] font-black border-none bg-gray-50 rounded-xl px-3 py-2.5 outline-none text-slate-500 uppercase cursor-pointer hover:bg-slate-900 hover:text-white transition-all shadow-inner"
          >
            <option value="delay">Maior Atraso</option>
            <option value="delay_low">Menor Atraso</option>
            <option value="freq_high">Mais Sairam</option>
            <option value="freq_low">Menos Sairam</option>
          </select>
        </div>
      </div>

      {/* ÁREA DE ROLAGEM INTERNA */}
      <div className="space-y-2 overflow-y-auto pr-1 flex-1 custom-scrollbar">
        {stats.map((item) => {
          const isFav = favorites.includes(item.number);
          
          return (
            <div key={item.number} className="flex items-center justify-between p-3 border border-gray-50 bg-gray-50/50 rounded-2xl hover:bg-white hover:border-blue-100 transition-all group relative">
              <div className="flex items-center gap-4">
                {/* Botão de Favoritar Rápido */}
                <button 
                  onClick={() => toggleFavorite?.(item.number)}
                  className={`transition-all ${isFav ? 'text-amber-400 scale-110' : 'text-slate-200 hover:text-slate-400 opacity-0 group-hover:opacity-100'}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </button>

                <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 font-black text-xs transition-all ${item.colorClass}`}>
                  {item.displayNumber}
                </div>
                
                <div className="flex flex-col">
                  <span className={`text-[10px] font-bold uppercase leading-none mb-0.5 ${item.labelColor}`}>
                    {item.delay === 1 ? 'Rodada em atraso' : 'Rodadas em atraso'}
                  </span>
                  <span className={`text-[11px] font-black ${item.delay >= 2 ? 'text-red-500' : 'text-slate-600'}`}>
                    {item.delay === 0 ? 'Saiu Ontem' : (
                      item.delay === 1 ? '1 rodada em atraso' : `${item.delay} rodadas em atraso`
                    )}
                  </span>
                </div>
              </div>
              
              <div className="text-right flex items-center gap-1.5 group/info relative">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-0.5">Freq.</span>
                  <span className="text-[11px] font-black text-blue-600">{item.count}x</span>
                </div>
                
                <div className="cursor-help text-slate-300 hover:text-slate-600 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  
                  <div className="absolute top-full right-0 mt-2 w-44 p-2 bg-slate-900 text-white rounded-lg text-[9px] font-medium leading-tight shadow-2xl opacity-0 group-hover/info:opacity-100 transition-opacity z-[100] pointer-events-none text-center border border-slate-700">
                      Sairam {item.count} vezes nas últimas {range} rodadas consultadas na Loteria Federal.
                      <div className="absolute top-0 right-2 -mt-1 w-2 h-2 bg-slate-900 rotate-45 border-l border-t border-slate-700"></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};