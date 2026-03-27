"use client";
import React, { useState, useMemo } from 'react';

interface CheckerPanelProps {
  history: any[];
  officialDraw: number[];
  playedLotes: number[];
}

export const CheckerPanel = ({ history, officialDraw, playedLotes }: CheckerPanelProps) => {
  const [selectedLoteId, setSelectedLoteId] = useState<number | null>(null);

  const selectedLote = useMemo(() => {
    return history.find(item => item.id === selectedLoteId) || null;
  }, [selectedLoteId, history]);

  const results = useMemo(() => {
    if (!selectedLote || officialDraw.length === 0) return null;

    const gamesResults = selectedLote.games.map((game: number[]) => {
      const hits = game.filter(num => officialDraw.includes(num));
      return {
        game,
        hits: hits.length,
        hitNumbers: hits
      };
    });

    const sortedGames = [...gamesResults].sort((a, b) => b.hits - a.hits);

    const summary: Record<number, number> = {
      11: gamesResults.filter((r: any) => r.hits === 11).length,
      12: gamesResults.filter((r: any) => r.hits === 12).length,
      13: gamesResults.filter((r: any) => r.hits === 13).length,
      14: gamesResults.filter((r: any) => r.hits === 14).length,
      15: gamesResults.filter((r: any) => r.hits === 15).length,
    };

    return { gamesResults: sortedGames, summary };
  }, [selectedLote, officialDraw]);

  return (
    /* AJUSTE: p-4 no mobile, w-full e overflow-hidden */
    <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col w-full box-border overflow-hidden">
      <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic mb-4">
        Conferidor de Lotes
      </h2>

      <div className="flex flex-col gap-2 mb-4">
        <select 
          value={selectedLoteId || ''} 
          onChange={(e) => setSelectedLoteId(Number(e.target.value))}
          /* AJUSTE: truncate para o texto do select não empurrar a largura */
          className="w-full text-[10px] font-black border-none bg-gray-50 rounded-xl p-3 outline-none uppercase cursor-pointer transition-all hover:bg-gray-100 truncate"
        >
          <option value="">Selecione um Lote</option>
          {history.map(lote => {
            const isPlayed = playedLotes.includes(lote.id);
            return (
              <option key={lote.id} value={lote.id}>
                {isPlayed ? "✅ " : "⏳ "} Lote: #{lote.loteNumber} — {lote.dezenasPorJogo}
              </option>
            );
          })}
        </select>
      </div>

      {results ? (
        <div className="space-y-4 w-full">
          {/* INDICADOR DE STATUS */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[8px] md:text-[9px] font-black uppercase text-slate-400">Status:</span>
            <span className={`text-[8px] md:text-[9px] font-black uppercase italic ${playedLotes.includes(selectedLoteId!) ? 'text-emerald-600' : 'text-orange-500'}`}>
              {playedLotes.includes(selectedLoteId!) ? 'Validado' : 'Simulação'}
            </span>
          </div>

          {/* RESUMO DE ACERTOS */}
          <div className="grid grid-cols-5 gap-1 w-full">
            {[11, 12, 13, 14, 15].map(n => {
              const count = results.summary[n] || 0;
              return (
                <div key={n} className="flex flex-col items-center py-2 px-1 bg-slate-50 rounded-lg border border-gray-100">
                  <span className="text-[8px] font-black text-slate-400">{n}p</span>
                  <span className={`text-[11px] md:text-[12px] font-black ${count > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* LISTA DE JOGOS */}
          <div className="max-h-[400px] overflow-y-auto pr-1 space-y-3 custom-scrollbar w-full">
            {results.gamesResults.map((res: any, idx: number) => (
              <div 
                key={idx} 
                className={`p-3 md:p-4 rounded-2xl border transition-all w-full box-border ${
                  res.hits >= 11 ? 'bg-emerald-50/30 border-emerald-100' : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex justify-between items-center mb-3 gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase truncate">
                      Jogo {idx + 1}
                    </span>
                    <span className={`text-[8px] font-bold uppercase italic truncate ${res.hits >= 11 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {res.hits >= 11 ? '⭐ Premiada' : 'Simulação'}
                    </span>
                  </div>
                  
                  <div className={`px-2 py-1 rounded-lg text-[10px] md:text-[11px] font-black shrink-0 ${
                    res.hits >= 11 ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-white'
                  }`}>
                    {res.hits} PTS
                  </div>
                </div>

                {/* AJUSTE: gap-1 e bolinhas menores no mobile para caberem em 5 ou 6 por linha */}
                <div className="flex flex-wrap gap-1 md:gap-1.5 w-full">
                  {res.game.map((n: number) => {
                    const isHit = officialDraw.includes(n);
                    return (
                      <span 
                        key={n} 
                        className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-[10px] md:text-[11px] font-black transition-transform shrink-0 ${
                          isHit 
                            ? 'bg-emerald-500 text-white scale-105 shadow-sm' 
                            : 'bg-white text-slate-300 border border-gray-100'
                        }`}
                      >
                        {String(n).padStart(2, '0')}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center border-2 border-dashed border-gray-50 rounded-2xl w-full">
          <p className="text-[9px] font-black text-slate-300 uppercase italic">
            {officialDraw.length > 0 ? "Escolha um lote acima" : "Aguardando sorteio..."}
          </p>
        </div>
      )}
    </div>
  );
};