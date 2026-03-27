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
      <div className={`flex flex-wrap gap-1 ${isLarge ? 'mt-4' : 'mt-2'}`}>
        {numbers.map((num) => (
          <span
            key={num}
            className={`flex items-center justify-center font-black transition-all hover:scale-110 
              bg-slate-900 text-white border border-slate-700 shadow-sm
              ${isLarge 
                ? 'w-9 h-9 rounded-lg text-[13px]' // Quadrado definido para o principal
                : 'w-7 h-7 rounded-md text-[11px]' // Quadrado definido para o histórico
              }`}
          >
            {String(num).padStart(2, '0')}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 mt-6">
      {/* ÚLTIMO SORTEIO - FUNDO ESCURO PARA UNIDADE VISUAL */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-[32px] shadow-lg shadow-blue-200/50 relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-[10px] font-white uppercase tracking-[0.2em] text-yellow-400 italic">
              Último Sorteio
            </h3>
            <span className="text-[10px] font-white bg-white/5 text-white px-3 py-1 rounded-full border border-white/5 italic">
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
      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic mb-4">
          Últimos cinco sorteios
        </h3>
        <div className="space-y-3">
          {previousFive.map((draw, idx) => (
            <div 
              key={draw.concurso || idx} 
              className="p-4 rounded-2xl border border-gray-100 bg-gray-50/30 transition-all hover:bg-gray-50"
            >
              <div className="flex justify-between items-center mb-1 px-1">
                <span className="text-[9px] font-black text-slate-500 italic uppercase">
                  Concurso {draw.concurso || draw.numero}
                </span>
                <span className="text-[9px] font-bold text-slate-700">
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