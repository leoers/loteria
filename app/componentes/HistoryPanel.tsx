import React from 'react';

interface HistoryPanelProps {
  lastDraws: any[];
  loading: boolean;
}

export const HistoryPanel = ({ lastDraws, loading }: HistoryPanelProps) => {
  if (loading || !lastDraws || lastDraws.length === 0) return null;

  const [latest, ...others] = lastDraws;
  const previousFive = others.slice(0, 5);

  const renderNumbers = (numbers: number[], isLarge: boolean = false) => {
    return (
      /* AJUSTE: gap-1 no mobile para economizar espaço horizontal */
      <div className={`flex flex-wrap gap-1 md:gap-1.5 ${isLarge ? 'mt-4' : 'mt-2'}`}>
        {numbers.map((num) => (
          <span
            key={num}
            /* AJUSTE: Tamanhos reduzidos no mobile (w-7.5/h-7.5 para o grande e w-6/h-6 para o histórico) */
            className={`flex items-center justify-center font-black transition-all hover:scale-110 
              bg-slate-900 text-white border border-slate-700 shadow-sm shrink-0
              ${isLarge 
                ? 'w-[30px] h-[30px] md:w-9 md:h-9 rounded-lg text-[11px] md:text-[13px]' 
                : 'w-[25px] h-[25px] md:w-7 md:h-7 rounded-md text-[9px] md:text-[11px]' 
              }`}
          >
            {String(num).padStart(2, '0')}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 mt-6 w-full box-border overflow-hidden">
      {/* ÚLTIMO SORTEIO */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 md:p-5 rounded-[32px] shadow-lg shadow-blue-200/50 relative overflow-hidden group w-full box-border">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-1 gap-2">
            <h3 className="text-[9px] md:text-[10px] font-white uppercase tracking-[0.1em] md:tracking-[0.2em] text-yellow-400 italic shrink-0">
              Último Sorteio
            </h3>
            <span className="text-[8px] md:text-[10px] font-white bg-white/10 text-white px-2 md:px-3 py-1 rounded-full border border-white/10 italic truncate">
              Concurso {latest.concurso || latest.numero}
            </span>
          </div>
          {renderNumbers(
            [...(latest.dezenas || latest.numbers || [])].map(Number).sort((a, b) => a - b), 
            true
          )}
        </div>
      </div>

      {/* HISTÓRICO - ÚLTIMOS CINCO SORTEIOS */}
      <div className="bg-white p-4 md:p-6 rounded-[32px] border border-gray-100 shadow-sm w-full box-border">
        <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-slate-400 italic mb-4">
          Últimos cinco sorteios
        </h3>
        <div className="space-y-3">
          {previousFive.map((draw, idx) => (
            <div 
              key={draw.concurso || idx} 
              className="p-3 md:p-4 rounded-2xl border border-gray-100 bg-gray-50/30 transition-all hover:bg-gray-50 w-full box-border"
            >
              <div className="flex justify-between items-center mb-1 px-1 gap-2">
                <span className="text-[8px] md:text-[9px] font-black text-slate-500 italic uppercase truncate">
                  Conc. {draw.concurso || draw.numero}
                </span>
                <span className="text-[8px] md:text-[9px] font-bold text-slate-400 shrink-0">
                  {draw.data || '2026'}
                </span>
              </div>
              {renderNumbers(
                [...(draw.dezenas || draw.numbers || [])].map(Number).sort((a, b) => a - b), 
                false
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};