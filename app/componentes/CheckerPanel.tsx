"use client";
import React, { useState, useMemo } from 'react';

interface CheckerPanelProps {
  history: any[];
  officialDraw: number[];
  playedLotes: number[]; // Adicionado para resolver o erro do Build
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
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
      <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic mb-4">
        Conferidor de Lotes
      </h2>

      <div className="flex flex-col gap-2 mb-4">
        <select 
          value={selectedLoteId || ''} 
          onChange={(e) => setSelectedLoteId(Number(e.target.value))}
          className="w-full text-[10px] font-black border-none bg-gray-50 rounded-xl p-3 outline-none uppercase cursor-pointer transition-all hover:bg-gray-100"
        >
          <option value="">Selecione um Lote</option>
          {history.map(lote => {
            const isPlayed = playedLotes.includes(lote.id);
            return (
              <option key={lote.id} value={lote.id}>
                {isPlayed ? "✅ " : "⏳ "} Lote: #{lote.loteNumber} — {lote.dezenasPorJogo} ({lote.qtd} Jogos)
              </option>
            );
          })}
        </select>
      </div>

      {results ? (
        <div className="space-y-4">
          {/* INDICADOR DE STATUS DO LOTE SELECIONADO */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[9px] font-black uppercase text-slate-400">Status do Lote:</span>
            <span className={`text-[9px] font-black uppercase italic ${playedLotes.includes(selectedLoteId!) ? 'text-emerald-600' : 'text-orange-500'}`}>
              {playedLotes.includes(selectedLoteId!) ? 'Validado (Pago/Jogado)' : 'Apenas Simulação'}
            </span>
          </div>

          {/* RESUMO DE ACERTOS */}
          <div className="grid grid-cols-5 gap-1">
            {[11, 12, 13, 14, 15].map(n => {
              const count = results.summary[n] || 0;
              return (
                <div key={n} className="flex flex-col items-center p-2 bg-slate-50 rounded-lg border border-gray-100">
                  <span className="text-[8px] font-black text-slate-400">{n} pts</span>
                  <span className={`text-[12px] font-black ${count > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* LISTA DE JOGOS CONFERIDOS */}
          <div className="max-h-[400px] overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            {results.gamesResults.map((res: any, idx: number) => (
              <div 
                key={idx} 
                className={`p-4 rounded-2xl border transition-all ${
                  res.hits >= 11 ? 'bg-emerald-50/30 border-emerald-100 shadow-sm shadow-emerald-500/5' : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">
                      Jogo {idx + 1} — {res.game.length} dezenas
                    </span>
                    <span className={`text-[9px] font-bold uppercase italic ${res.hits >= 11 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {res.hits >= 11 ? '⭐ Aposta Premiada' : 'Simulação'}
                    </span>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-lg text-[11px] font-black shadow-sm ${
                    res.hits >= 11 ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-white'
                  }`}>
                    {res.hits} ACERTOS
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {res.game.map((n: number) => {
                    const isHit = officialDraw.includes(n);
                    return (
                      <span 
                        key={n} 
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black shadow-sm transition-transform ${
                          isHit 
                            ? 'bg-emerald-500 text-white scale-105' 
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
        <div className="py-8 text-center border-2 border-dashed border-gray-50 rounded-2xl">
          <p className="text-[9px] font-black text-slate-300 uppercase italic">
            {officialDraw.length > 0 ? "Escolha um lote acima" : "Aguardando sorteio oficial..."}
          </p>
        </div>
      )}
    </div>
  );
};