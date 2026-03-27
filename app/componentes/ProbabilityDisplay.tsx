import React from 'react';

interface ProbabilityDisplayProps {
  stats: {
    c15: string;
    c14: string;
    c13: string;
    c12: string;
    c11: string;
  };
  dezenas: number;
  isTopBar?: boolean;
  totalCost?: number; // Nova prop para o valor total
}

export const ProbabilityDisplay = ({ stats, dezenas, isTopBar = false, totalCost = 0 }: ProbabilityDisplayProps) => {
  const probabilityItems = [
    { label: '15 Pontos', value: stats.c15, color: 'text-yellow-400' },
    { label: '14 Pontos', value: stats.c14, color: 'text-slate-200' },
    { label: '13 Pontos', value: stats.c13, color: 'text-slate-300' },
    { label: '12 Pontos', value: stats.c12, color: 'text-slate-400' },
    { label: '11 Pontos', value: stats.c11, color: 'text-emerald-400' },
  ];

  // Renderização para a TopBar (Horizontal)
  if (isTopBar) {
    return (
      <div className="bg-slate-900 rounded-[24px] p-4 shadow-xl border border-white/5 flex items-center justify-between w-full overflow-x-auto custom-scrollbar">
        
        <div className="flex items-center">
          {/* Título e Legenda Lateral */}
          <div className="border-r border-white/10 pr-6 mr-6 hidden lg:block shrink-0">
            <h2 className="text-[10px] font-black text-blue-400 uppercase italic leading-none">Chances de Acerto</h2>
            <p className="text-[8px] text-slate-500 font-bold uppercase mt-1 italic">Baseado em {dezenas} dezenas</p>
          </div>
          
          {/* Itens de Probabilidade */}
          <div className="flex items-center divide-x divide-white/5">
            {probabilityItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3 px-4 first:pl-0">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter whitespace-nowrap">
                  {item.label}
                </span>
                <span className={`text-[11px] font-black tracking-tight ${item.color} tabular-nums`}>
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* --- NOVO: BLOCO DE INVESTIMENTO TOTAL --- */}
        {totalCost > 0 && (
          <div className="flex items-center border-l border-white/10 pl-6 shrink-0 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col items-end mr-3">
              <span className="text-[9px] font-black text-blue-400 uppercase italic leading-none">Investimento</span>
              <span className="text-[8px] text-slate-500 font-bold uppercase mt-1 italic">Valor do Lote</span>
            </div>
            <div className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
              <span className="text-sm font-black text-emerald-400 tabular-nums">
                {totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Renderização Original (Vertical/Sidebar)
  return (
    <div className="bg-slate-900 p-6 rounded-[32px] shadow-2xl border border-white/5 space-y-6">
      <div className="text-center border-b border-white/10 pb-4">
        <h2 className="text-[11px] font-black text-blue-400 uppercase tracking-widest italic">Chances de Acerto (Real)</h2>
      </div>
      
      <div className="space-y-4">
        {probabilityItems.map((item, index) => (
          <div key={index} className="flex justify-between items-center group">
            <span className="text-[10px] font-black text-slate-500 uppercase italic group-hover:text-slate-300 transition-colors">
              {item.label}
            </span>
            <div className="flex flex-col items-end">
              <span className={`text-sm font-black ${item.color} tabular-nums`}>
                {item.value}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* --- NOVO: INVESTIMENTO NA SIDEBAR --- */}
      {totalCost > 0 && (
        <div className="pt-4 border-t border-white/10 flex justify-between items-center">
          <span className="text-[10px] font-black text-emerald-500/50 uppercase italic">Custo Total</span>
          <span className="text-lg font-black text-emerald-400 tabular-nums">
            {totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      )}
      
      <div className="pt-2 border-t border-white/5">
        <p className="text-[7px] text-slate-600 font-bold uppercase text-center italic leading-relaxed">
          Cálculo baseado em distribuição hipergeométrica para {dezenas} dezenas.<br/>
          Probabilidades acumuladas conforme volume de jogos.
        </p>
      </div>
    </div>
  );
};