"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useLotofacilCalc } from './hooks/useLotofacilCalc';
import { TendenciasPanel } from './componentes/TrendList';
import { ProbabilityDisplay } from './componentes/ProbabilityDisplay';
import { ConfigPanel } from './componentes/ConfigPanel';
import { GameHistory } from './componentes/GameHistory';
import { HistoryPanel } from './componentes/HistoryPanel'; 
import { CheckerPanel } from './componentes/CheckerPanel'; 
import { IntelligencePanel } from './componentes/IntelligencePanel';
import { jsPDF } from "jspdf";

const LOTOFACIL_PRICES: Record<number, number> = {
  15: 3.50, 16: 56.00, 17: 476.00, 18: 2856.00, 19: 13566.00, 20: 54264.00,
};

interface GameBatch {
  dezenas: number;
  qtd: number;
  id: number;
}

interface DraftGame {
  id: string;
  dezenas: number;
  numbers: number[];
}

const LotofacilProfessional = () => {
  const { calcRealProb, calcLoteProb } = useLotofacilCalc();
  const [mounted, setMounted] = useState(false);
  const [excluded, setExcluded] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [playedLotes, setPlayedLotes] = useState<number[]>([]); // Novo estado para lotes jogados
  const [draftGames, setDraftGames] = useState<DraftGame[]>([]);
  const [lastDraws, setLastDraws] = useState<any[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(true);

  const allNumbers = Array.from({ length: 25 }, (_, i) => i + 1);

  const handleApplyAISuggestion = (aiNumbers: number[]) => {
    setFavorites(prev => {
      const combined = new Set([...prev, ...aiNumbers]);
      return Array.from(combined).sort((a, b) => a - b);
    });
    setExcluded(prev => prev.filter(n => !aiNumbers.includes(n)));
  };

  const totalCost = useMemo(() => {
    return draftGames.reduce((acc, game) => acc + (LOTOFACIL_PRICES[game.dezenas] || 0), 0);
  }, [draftGames]);

  const officialNumbers = useMemo(() => {
    if (lastDraws && lastDraws.length > 0) {
      const latest = lastDraws[0];
      const nums = latest.dezenas || latest.numbers || [];
      return nums.map(Number).sort((a: number, b: number) => a - b);
    }
    return [];
  }, [lastDraws]);

  useEffect(() => {
    setMounted(true);
    const savedHistory = localStorage.getItem('@LotofacilPro:history');
    const savedPlayed = localStorage.getItem('@LotofacilPro:played');
    
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    }
    if (savedPlayed) {
      try { setPlayedLotes(JSON.parse(savedPlayed)); } catch (e) { console.error(e); }
    }
    
    const fetchTrends = async () => {
      try {
        const response = await fetch('https://loteriascaixa-api.herokuapp.com/api/lotofacil');
        const data = await response.json();
        setLastDraws(Array.isArray(data) ? data : []);
      } catch (error) { console.error(error); } finally { setLoadingTrends(false); }
    };
    fetchTrends();
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('@LotofacilPro:history', JSON.stringify(history));
      localStorage.setItem('@LotofacilPro:played', JSON.stringify(playedLotes));
    }
  }, [history, playedLotes, mounted]);

  const currentStats = useMemo(() => {
    if (draftGames.length === 0) {
      return { c15: '0.000031', c14: '0.0046', c13: '0.1447', c12: '1.6949', c11: '9.0909' };
    }
    const dezenasBase = draftGames[0]?.dezenas || 15;
    const qtdTotal = draftGames.length;
    return {
      c15: calcRealProb(15, dezenasBase, qtdTotal).toFixed(6),
      c14: calcRealProb(14, dezenasBase, qtdTotal).toFixed(4),
      c13: calcRealProb(13, dezenasBase, qtdTotal).toFixed(2),
      c12: calcRealProb(12, dezenasBase, qtdTotal).toFixed(2),
      c11: calcRealProb(11, dezenasBase, qtdTotal).toFixed(2),
    };
  }, [draftGames, calcRealProb]);

  const toggleExcluded = (n: number) => {
    if (favorites.includes(n)) setFavorites(prev => prev.filter(x => x !== n));
    setExcluded(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
  };

  const toggleFavorite = (n: number) => {
    if (excluded.includes(n)) setExcluded(prev => prev.filter(x => x !== n));
    setFavorites(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
  };

  const togglePlayedLote = (loteId: number) => {
    setPlayedLotes(prev => 
      prev.includes(loteId) ? prev.filter(id => id !== loteId) : [...prev, loteId]
    );
  };

  const generateGameLogic = (dezenas: number, forceRandomizeFromFavorites: boolean) => {
    const poolParaCompletar = allNumbers.filter(n => !excluded.includes(n) && !favorites.includes(n));
    if (favorites.length > dezenas || (forceRandomizeFromFavorites && favorites.length > 0)) {
        if (favorites.length >= dezenas) {
            return [...favorites].sort(() => 0.5 - Math.random()).slice(0, dezenas).sort((a, b) => a - b);
        } else {
            const needed = dezenas - favorites.length;
            const extra = [...poolParaCompletar].sort(() => 0.5 - Math.random()).slice(0, needed);
            return [...favorites, ...extra].sort((a, b) => a - b);
        }
    }
    const needed = dezenas - favorites.length;
    const randomized = [...poolParaCompletar].sort(() => 0.5 - Math.random()).slice(0, needed);
    return [...favorites, ...randomized].sort((a, b) => a - b);
  };

  const handleGenerateBatches = (batches: GameBatch[]) => {
    const newDrafts: DraftGame[] = [];
    batches.forEach(batch => {
      const shouldShuffle = batch.qtd > 1;
      for (let i = 0; i < batch.qtd; i++) {
        newDrafts.push({
          id: `${Date.now()}-${Math.random()}`,
          dezenas: batch.dezenas,
          numbers: generateGameLogic(batch.dezenas, shouldShuffle)
        });
      }
    });
    setDraftGames(newDrafts);
  };

  const regenerateSingleDraft = (id: string, dezenas: number) => {
    setDraftGames(prev => prev.map(g => 
      g.id === id ? { ...g, numbers: generateGameLogic(dezenas, true) } : g
    ));
  };

  const removeSingleDraft = (id: string) => {
    setDraftGames(prev => prev.filter(g => g.id !== id));
  };

  const finalizeAndSaveLote = () => {
    if (draftGames.length === 0) return;
    const gamesNumbersOnly = draftGames.map(g => g.numbers);
    const maxLoteNumber = history.reduce((max, item) => Math.max(max, item.loteNumber || 0), 0);
    const nextLoteNumber = maxLoteNumber + 1;

    setHistory(prev => [{ 
      id: Date.now(), 
      loteNumber: nextLoteNumber, 
      date: new Date().toLocaleString('pt-BR'), 
      games: gamesNumbersOnly, 
      dezenasPorJogo: `${draftGames[0].dezenas}D`, 
      qtd: draftGames.length,
      cost: totalCost, 
      prob15: calcLoteProb(gamesNumbersOnly)
    }, ...prev]);
    setDraftGames([]);
  };

  const downloadPDF = (item: any) => {
    const doc = new jsPDF();
    doc.text(`Lote: #${item.loteNumber} - Lotofácil - ${item.date}`, 10, 10);
    item.games.forEach((g: number[], idx: number) => {
      doc.text(`J${idx + 1}: ${g.join(' ')}`, 10, 25 + (idx * 7));
    });
    doc.save(`lote-${item.loteNumber}.pdf`);
  };

  if (!mounted) return null;

  return (
    <div className="p-4 max-w-[1900px] mx-auto bg-gray-50 min-h-screen flex flex-col gap-6 overflow-x-hidden">
      <div className="w-full">
        <ProbabilityDisplay 
            stats={currentStats} 
            dezenas={draftGames.length > 0 ? draftGames[0].dezenas : 15} 
            isTopBar={true} 
            totalCost={totalCost}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        {/* COLUNA 1: TENDÊNCIAS */}
        <div className="flex flex-col gap-4">
          <TendenciasPanel 
            lastDraws={lastDraws} 
            loading={loadingTrends} 
            favorites={favorites} 
            toggleFavorite={toggleFavorite} 
          />
          <HistoryPanel lastDraws={lastDraws} loading={loadingTrends} />
        </div>

        {/* COLUNA 2: CONFIGURAÇÃO */}
        <div className="h-full">
          <ConfigPanel 
            excluded={excluded} 
            favorites={favorites} 
            toggleExcluded={toggleExcluded} 
            toggleFavorite={toggleFavorite} 
            onGenerateAll={handleGenerateBatches} 
          />
        </div>

        {/* COLUNA 3: (LOTE) */}
        <div className="h-full">
          {draftGames.length > 0 ? (
            <div className="bg-slate-900 p-6 rounded-[32px] shadow-2xl border border-slate-800 flex flex-col max-h-[calc(100vh-250px)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[11px] font-black text-blue-400 uppercase italic">Lote em Revisão</h3>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full italic">
                    {draftGames.length} Jogos • {totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="space-y-4 overflow-y-auto pr-2 mb-4 custom-scrollbar flex-1">
                {draftGames.map((game, idx) => (
                  <div key={game.id} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase italic">JOGO {idx + 1} • {game.dezenas}D</span>
                      <div className="flex gap-4">
                        <button onClick={() => regenerateSingleDraft(game.id, game.dezenas)} className="text-[10px] font-black text-blue-400 uppercase hover:text-white transition-colors">Sortear</button>
                        <button onClick={() => removeSingleDraft(game.id)} className="text-[10px] font-black text-red-500 uppercase hover:text-red-400 transition-colors">Remover</button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {game.numbers.map((n) => (
                        <span key={n} className="w-9 h-9 bg-white text-slate-900 rounded-xl flex items-center justify-center text-[12px] font-black shadow-md">
                          {String(n).padStart(2, '0')}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={finalizeAndSaveLote} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-[12px] uppercase shadow-lg hover:bg-blue-500 transition-all active:scale-95">
                Confirmar Lote
              </button>
            </div>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed border-gray-200 rounded-[32px] flex items-center justify-center text-slate-300 text-[10px] font-black uppercase italic p-10 text-center">
              Aguardando geração...
            </div>
          )}
        </div>

        {/* COLUNA 4: HISTÓRICO E CONFERIDOR */}
        <div className="flex flex-col gap-4 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar pr-1">
          <CheckerPanel 
            history={history} 
            officialDraw={officialNumbers} 
            playedLotes={playedLotes} 
          />
          <GameHistory 
            history={history} 
            setHistory={setHistory}
            draftGames={draftGames}
            playedLotes={playedLotes}
            togglePlayed={togglePlayedLote}
            onDelete={(id) => setHistory(prev => prev.filter(g => g.id !== id))} 
            onDownloadPDF={downloadPDF} 
          />
        </div>
      </div>

      {/* PAINEL DE INTELIGÊNCIA: FINAL DA PÁGINA */}
      <div className="w-full mt-4">
        <IntelligencePanel 
          lastDraws={lastDraws} 
          onApplySuggestion={handleApplyAISuggestion} 
        />
      </div>
    </div>
  );
};

export default LotofacilProfessional;