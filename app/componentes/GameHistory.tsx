import React, { useState, useMemo } from 'react';
import { useLotofacilCalc } from '../hooks/useLotofacilCalc';

interface GameHistoryProps {
  history: any[];
  setHistory: React.Dispatch<React.SetStateAction<any[]>>;
  draftGames: any[];
  playedLotes: number[];
  togglePlayed: (id: number) => void;
  onDelete: (id: number) => void;
  onDownloadPDF: (item: any) => void;
}

export const GameHistory = ({ 
  history, 
  setHistory, 
  draftGames, 
  playedLotes, 
  togglePlayed, 
  onDelete, 
  onDownloadPDF 
}: GameHistoryProps) => {
  const { calcLoteProb } = useLotofacilCalc();
  const [filter, setFilter] = useState<'recent' | 'oldest' | 'best' | 'worst'>('recent');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // WHATSAPP: Agora incluindo o número do lote no layout
  const shareOnWhatsApp = (item: any) => {
    const separator = "------------------------------------------";
    const loteLabel = `Lote #${item.loteNumber || item.id}`;
    
    const header = `ESTRATÉGIA LOTOFÁCIL 📝\n${separator}\n` +
      `🎯 ${loteLabel} | ${item.dezenasPorJogo}\n` +
      `🎲 ${item.qtd} Jogos | 📈 Prob. 15 pts: ${Number(item.prob15).toFixed(6)}%\n${separator}\n\n`;

    const gamesList = item.games.map((g: number[], i: number) => {
      const formattedNums = g.sort((a, b) => a - b)
        .map(n => String(n).padStart(2, '0'))
        .join('  ');
      
      return `Jogo ${String(i + 1).padStart(2, '0')}: \` ${formattedNums} \` \n${separator}`;
    }).join('\n');

    const footer = `\n\n📅 Gerado em: ${item.date || new Date().toLocaleString('pt-BR')}`;
    
    const message = header + gamesList + footer;
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  const updateLoteName = (id: number, newName: string) => {
    setHistory(prev => prev.map(item => item.id === id ? { ...item, dezenasPorJogo: newName } : item));
  };

  const removeGameFromLote = (loteId: number, gameIndex: number) => {
    setHistory(prev => prev.map(item => {
      if (item.id === loteId) {
        const newGames = item.games.filter((_: any, i: number) => i !== gameIndex);
        return { 
          ...item, 
          games: newGames, 
          qtd: newGames.length,
          prob15: calcLoteProb(newGames) 
        };
      }
      return item;
    }));
  };

  const processedHistory = useMemo(() => {
    let list = Array.isArray(history) ? [...history] : [];
    const sortedByProb = [...list].sort((a, b) => (Number(b.prob15) || 0) - (Number(a.prob15) || 0));
    
    const top3Ids = sortedByProb.slice(0, 3).map(item => item.id);
    const bottom3Ids = list.length >= 6 
      ? sortedByProb.slice(-3).map(item => item.id) 
      : [];

    if (filter === 'best') list.sort((a, b) => (Number(b.prob15) || 0) - (Number(a.prob15) || 0));
    if (filter === 'worst') list.sort((a, b) => (Number(a.prob15) || 0) - (Number(b.prob15) || 0));
    if (filter === 'oldest') list.sort((a, b) => (a.id || 0) - (b.id || 0));
    if (filter === 'recent') list.sort((a, b) => (b.id || 0) - (a.id || 0));

    return list.map(item => ({
      ...item,
      isTop: top3Ids.includes(item.id),
      isBottom: bottom3Ids.includes(item.id),
      isPlayed: playedLotes.includes(item.id)
    }));
  }, [history, filter, playedLotes]);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[800px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic">Histórico de Lotes</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="text-[9px] font-black border-none bg-gray-50 rounded-lg p-2 outline-none uppercase cursor-pointer">
          <option value="recent">Recentes</option>
          <option value="best">Melhores Prob.</option>
          <option value="worst">Menores Prob.</option>
          <option value="oldest">Antigos</option>
        </select>
      </div>

      <div className="space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">
        {processedHistory.map(item => {
          let badgeClass = "bg-gray-200 text-slate-900";
          if (item.isTop) badgeClass = "bg-emerald-500 text-white shadow-sm"; 
          if (item.isBottom) badgeClass = "bg-red-500 text-white shadow-sm";

          return (
            <div key={item.id} className={`p-4 border transition-all ${item.isPlayed ? 'border-amber-400 bg-amber-50/30' : editingId === item.id ? 'border-blue-400 bg-blue-50/20' : 'border-gray-100 bg-gray-50/50'} rounded-2xl`}>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 mr-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[12px] font-black italic tracking-tighter uppercase ${item.isPlayed ? 'text-amber-600' : 'text-blue-600'}`}>
                        Lote: #{item.loteNumber || "N/A"}
                      </span>
                      {item.isPlayed && <span className="text-[7px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-black shadow-sm">JOGADO</span>}
                    </div>

                    {editingId === item.id ? (
                      <input 
                        className="bg-white border border-blue-200 rounded px-2 py-1 text-[10px] font-black uppercase w-full outline-none mt-1"
                        value={item.dezenasPorJogo}
                        onChange={(e) => updateLoteName(item.id, e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <div className="text-[10px] font-black text-slate-800 uppercase leading-none opacity-80 mt-0.5">
                        {item.dezenasPorJogo}
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-1 mt-1">
                       <span className="text-[8px] font-bold text-slate-400 uppercase italic">{item.qtd} Jogos</span>
                       <span className={`text-[8px] font-black px-2 py-1 rounded-lg w-fit tabular-nums ${badgeClass}`}>
                         PROB: {Number(item.prob15).toFixed(5)}%
                       </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                    <button 
                        onClick={() => togglePlayed(item.id)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all shadow-sm ${item.isPlayed ? 'bg-amber-400 text-white scale-105' : 'bg-white text-slate-300 border border-slate-100 hover:text-amber-400'}`}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={item.isPlayed ? "currentColor" : "none"} stroke="currentColor" strokeWidth="3">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                    </button>

                    <button 
                        onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                        className={`px-3 py-2.5 rounded-lg text-[8px] font-black uppercase transition-colors ${editingId === item.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                    >
                        {editingId === item.id ? 'Salvar' : 'Editar'}
                    </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 mb-3">
                <button 
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="py-2.5 bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors shadow-sm"
                >
                  {expandedId === item.id ? 'Ocultar Jogos' : 'Ver Jogos do Lote'}
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => onDownloadPDF(item)} className="py-2.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black text-slate-600 uppercase shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2">
                        PDF
                    </button>
                    <button 
                        onClick={() => shareOnWhatsApp(item)} 
                        className="py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[9px] font-black uppercase shadow-sm hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        WhatsApp
                    </button>
                </div>
              </div>

              {expandedId === item.id && (
                <div className="mb-4 p-3 bg-white border border-slate-100 rounded-xl space-y-3 shadow-inner max-h-[300px] overflow-y-auto custom-scrollbar">
                  {item.games.map((g: number[], i: number) => (
                    <div key={i} className="flex items-center justify-between pb-2 border-b border-slate-50 last:border-0">
                      <div className="flex flex-wrap gap-1 flex-1">
                        <span className="text-[8px] font-black text-slate-300 mr-1 w-4">{i + 1}</span>
                        {g.map(n => (
                          <span key={n} className="w-5 h-5 bg-slate-100 text-slate-900 rounded-md flex items-center justify-center text-[8px] font-black">
                            {String(n).padStart(2, '0')}
                          </span>
                        ))}
                      </div>
                      {editingId === item.id && (
                        <button onClick={() => removeGameFromLote(item.id, i)} className="ml-2 p-1.5 text-red-400 hover:text-red-600">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => onDelete(item.id)} className="w-full py-1 text-slate-300 hover:text-red-500 text-[8px] font-black uppercase transition-colors opacity-40 hover:opacity-100">Excluir Lote</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};