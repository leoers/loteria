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
  totalCost?: number;
}

export const ProbabilityDisplay = ({ stats, dezenas, isTopBar = false, totalCost = 0 }: ProbabilityDisplayProps) => {
  const probabilityItems = [
    { label: '15 Pts', value: stats.c15, color: 'text-yellow-400' },
    { label: '14 Pts', value: stats.c14, color: 'text-slate-200' },
    { label: '13 Pts', value: stats.c13, color: 'text-slate-300' },
    { label: '12 Pts', value: stats.c12, color: 'text-slate-400' },
    { label: '11 Pts', value: stats.c11, color: 'text-emerald-400' },
  ];

  // Renderização para a TopBar (Horizontal)
  if (isTopBar) {
    return (
      /* AJUSTE: p-3 no mobile, overflow-x-auto com scroll invisível para swipe */
      <div className="bg-slate-900 rounded-[24px] p-3 md:p-4 shadow-xl border border-white/5 flex items-center justify-between w-full overflow-x-auto custom-scrollbar no-scrollbar">
        
        <div className="flex items-center shrink-0">
          {/* Título - Escondido em telas muito pequenas, visível em tablets */}
          <div className="border-r border-white/10 pr-4 mr-4 hidden md:block shrink-0">
            <h2 className="text-[10px] font-black text-blue-400 uppercase italic leading-none">Chances</h2>
            <p className="text-[8px] text-slate-500 font-bold uppercase mt-1 italic">{dezenas} dezenas</p>
          </div>
          
          {/* Itens de Probabilidade - Mantém linha única com scroll */}
          <div className="flex items-center divide-x divide-white/5">
            {probabilityItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 md:gap-3 px-3 md:px-4 first:pl-0 shrink-0">
                <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-tighter whitespace-nowrap">
                  {item.label}
                </span>
                <span className={`text-[10px] md:text-[11px] font-black tracking-tight ${item.color} tabular-nums whitespace-nowrap`}>
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* BLOCO DE INVESTIMENTO TOTAL */}
        {totalCost > 0 && (
          <div className="flex items-center border-l border-white/10 pl-4 ml-4 shrink-0">
            <div className="flex flex-col items-end mr-2 md:mr-3 hidden xs:flex">
              <span className="text-[8px] md:text-[9px] font-black text-blue-400 uppercase italic leading-none">Total</span>
            </div>
            <div className="bg-emerald-500/10 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-emerald-500/20">
              <span className="text-xs md:text-sm font-black text-emerald-400 tabular-nums whitespace-nowrap">
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
    <div className="bg-slate-900 p-5 md:p-6 rounded-[32px] shadow-2xl border border-white/5 space-y-5 md:space-y-6 w-full box-border overflow-hidden">
      <div className="text-center border-b border-white/10 pb-4">
        <h2 className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase tracking-widest italic">Chances de Acerto (Real)</h2>
      </div>
      
      <div className="space-y-3 md:space-y-4">
        {probabilityItems.map((item, index) => (
          <div key={index} className="flex justify-between items-center group">
            <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase italic group-hover:text-slate-300 transition-colors">
              {item.label}
            </span>
            <div className="flex flex-col items-end">
              <span className={`text-xs md:text-sm font-black ${item.color} tabular-nums`}>
                {item.value}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* INVESTIMENTO NA SIDEBAR */}
      {totalCost > 0 && (
        <div className="pt-4 border-t border-white/10 flex justify-between items-center gap-2">
          <span className="text-[9px] md:text-[10px] font-black text-emerald-500/50 uppercase italic shrink-0">Custo Total</span>
          <span className="text-md md:text-lg font-black text-emerald-400 tabular-nums truncate">
            {totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      )}
      
      <div className="pt-2 border-t border-white/5">
        <p className="text-[7px] text-slate-600 font-bold uppercase text-center italic leading-relaxed">
          Cálculo hipergeométrico para {dezenas} dezenas.<br/>
          Probabilidades acumuladas por volume.
        </p>
      </div>
    </div>
  );
};