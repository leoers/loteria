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

interface GameBatch { dezenas: number; qtd: number; id: number; }
interface DraftGame { id: string; dezenas: number; numbers: number[]; }

const LotofacilProfessional = () => {
  const { calcRealProb, calcLoteProb } = useLotofacilCalc();
  const [mounted, setMounted] = useState(false);
  const [excluded, setExcluded] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [playedLotes, setPlayedLotes] = useState<number[]>([]);
  const [draftGames, setDraftGames] = useState<DraftGame[]>([]);
  const [lastDraws, setLastDraws] = useState<any[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(true);

  const [activeStep, setActiveStep] = useState(1);
  const [showQuickCheck, setShowQuickCheck] = useState(false);

  const allNumbers = Array.from({ length: 25 }, (_, i) => i + 1);

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

  const downloadPDF = (item: any) => {
    const doc = new jsPDF();
    doc.text(`Lote: #${item.loteNumber} - Lotofácil - ${item.date}`, 10, 10);
    item.games.forEach((g: number[], idx: number) => {
      doc.text(`J${idx + 1}: ${g.join(' ')}`, 10, 25 + (idx * 7));
    });
    doc.save(`lote-${item.loteNumber}.pdf`);
  };

  const regenerateSingleDraft = (id: string, dezenas: number) => {
    setDraftGames(prev => prev.map(g => 
      g.id === id ? { ...g, numbers: generateGameLogic(dezenas, true) } : g
    ));
  };

  const removeSingleDraft = (id: string) => {
    setDraftGames(prev => prev.filter(g => g.id !== id));
  };

  const handleApplyAISuggestion = (aiNumbers: number[]) => {
    setFavorites(prev => Array.from(new Set([...prev, ...aiNumbers])).sort((a, b) => a - b));
    setExcluded(prev => prev.filter(n => !aiNumbers.includes(n)));
    if (typeof window !== 'undefined' && window.innerWidth < 768) setActiveStep(2);
  };

  const toggleExcluded = (n: number) => {
    if (favorites.includes(n)) setFavorites(prev => prev.filter(x => x !== n));
    setExcluded(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
  };

  const toggleFavorite = (n: number) => {
    if (excluded.includes(n)) setExcluded(prev => prev.filter(x => x !== n));
    setFavorites(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
  };

  const handleGenerateBatches = (batches: GameBatch[]) => {
    const newDrafts: DraftGame[] = [];
    batches.forEach(batch => {
      for (let i = 0; i < batch.qtd; i++) {
        newDrafts.push({
          id: `${Date.now()}-${Math.random()}`,
          dezenas: batch.dezenas,
          numbers: generateGameLogic(batch.dezenas, batch.qtd > 1)
        });
      }
    });
    setDraftGames(newDrafts);
    if (typeof window !== 'undefined' && window.innerWidth < 768) setActiveStep(3);
  };

  const finalizeAndSaveLote = () => {
    if (draftGames.length === 0) return;
    const gamesNumbersOnly = draftGames.map(g => g.numbers);
    const totalCostLocal = draftGames.reduce((acc, game) => acc + (LOTOFACIL_PRICES[game.dezenas] || 0), 0);
    
    setHistory(prev => [{ 
      id: Date.now(), 
      loteNumber: prev.length + 1, 
      date: new Date().toLocaleString('pt-BR'), 
      games: gamesNumbersOnly, 
      dezenasPorJogo: `${draftGames[0].dezenas}D`, 
      qtd: draftGames.length, 
      cost: totalCostLocal, 
      prob15: calcLoteProb(gamesNumbersOnly)
    }, ...prev]);
    setDraftGames([]);
    if (typeof window !== 'undefined' && window.innerWidth < 768) setActiveStep(1);
  };

  useEffect(() => {
    setMounted(true);
    const savedHistory = localStorage.getItem('@LotofacilPro:history');
    const savedPlayed = localStorage.getItem('@LotofacilPro:played');
    if (savedHistory) try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    if (savedPlayed) try { setPlayedLotes(JSON.parse(savedPlayed)); } catch (e) { console.error(e); }
    
    fetch('https://loteriascaixa-api.herokuapp.com/api/lotofacil')
      .then(res => res.json())
      .then(data => setLastDraws(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoadingTrends(false));
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('@LotofacilPro:history', JSON.stringify(history));
      localStorage.setItem('@LotofacilPro:played', JSON.stringify(playedLotes));
    }
  }, [history, playedLotes, mounted]);

  const totalCost = useMemo(() => draftGames.reduce((acc, game) => acc + (LOTOFACIL_PRICES[game.dezenas] || 0), 0), [draftGames]);

  const officialNumbers = useMemo(() => {
    if (lastDraws?.length > 0) {
      const latest = lastDraws[0];
      const nums = latest.dezenas || latest.numbers || [];
      return nums.map(Number).sort((a: number, b: number) => a - b);
    }
    return [];
  }, [lastDraws]);

  const currentStats = useMemo(() => {
    const dezenasBase = draftGames[0]?.dezenas || 15;
    return {
      c15: calcRealProb(15, dezenasBase, draftGames.length).toFixed(6),
      c14: calcRealProb(14, dezenasBase, draftGames.length).toFixed(4),
      c13: calcRealProb(13, dezenasBase, draftGames.length).toFixed(2),
      c12: calcRealProb(12, dezenasBase, draftGames.length).toFixed(2),
      c11: calcRealProb(11, dezenasBase, draftGames.length).toFixed(2),
    };
  }, [draftGames, calcRealProb]);

  if (!mounted) return null;

  return (
    /* AJUSTE 1: Adicionado w-full e overflow-x-hidden para travar o eixo horizontal */
    <div className="p-4 w-full max-w-[1900px] mx-auto bg-gray-50 min-h-screen flex flex-col gap-6 overflow-x-hidden box-border">
      
      <div className="w-full flex flex-col gap-3">
        <ProbabilityDisplay stats={currentStats} dezenas={draftGames[0]?.dezenas || 15} isTopBar totalCost={totalCost} />
        <button onClick={() => setShowQuickCheck(true)} className="md:hidden w-full bg-emerald-500 text-white py-3 rounded-2xl text-[10px] font-black uppercase">
          ⚡ Conferir Jogos (WhatsApp/PDF)
        </button>
      </div>

      <div className="flex md:hidden bg-white p-1 rounded-2xl gap-1 w-full box-border">
        {['Estatística', 'Jogar'].map((label, i) => (
          <button key={i} onClick={() => setActiveStep(i+1)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase ${activeStep === i+1 ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* AJUSTE 2: Garantir que o grid não ultrapasse a largura do pai */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start w-full">
        
        <div className={`${activeStep === 1 ? 'flex' : 'hidden md:flex'} flex-col gap-4 w-full overflow-hidden`}>
          <div className="md:hidden mb-4 w-full"><IntelligencePanel lastDraws={lastDraws} onApplySuggestion={handleApplyAISuggestion} /></div>
          <TendenciasPanel lastDraws={lastDraws} loading={loadingTrends} favorites={favorites} toggleFavorite={toggleFavorite} />
          <HistoryPanel lastDraws={lastDraws} loading={loadingTrends} />
        </div>

        <div className={`${activeStep === 2 ? 'block' : 'hidden md:block'} w-full overflow-hidden`}>
          <ConfigPanel excluded={excluded} favorites={favorites} toggleExcluded={toggleExcluded} toggleFavorite={toggleFavorite} onGenerateAll={handleGenerateBatches} onClear={() => {setFavorites([]); setExcluded([]);}} />
        </div>

        <div className={`${activeStep === 3 ? 'block' : 'hidden md:block'} w-full overflow-hidden`}>
          {draftGames.length > 0 ? (
            /* AJUSTE 3: W-full e Padding para evitar que o conteúdo encoste na borda do celular */
            <div className="bg-slate-900 p-5 md:p-6 rounded-[32px] flex flex-col max-h-[calc(100vh-250px)] w-full box-border">
               <div className="flex justify-between items-center mb-4">
                <h3 className="text-[11px] font-black text-blue-400 uppercase italic">Lote em Revisão</h3>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full italic">
                  {draftGames.length} Jogos • {totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar mb-4 pr-1">
                {draftGames.map((game, idx) => (
                  <div key={game.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 w-full box-border">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black text-slate-400">JOGO {idx + 1}</span>
                      <div className="flex gap-3">
                        <button onClick={() => regenerateSingleDraft(game.id, game.dezenas)} className="text-[9px] font-black text-blue-400 uppercase">Sortear</button>
                        <button onClick={() => removeSingleDraft(game.id)} className="text-[9px] font-black text-red-500 uppercase">X</button>
                      </div>
                    </div>
                    {/* AJUSTE 4: gap-1.5 no mobile para não estourar a largura das 5 colunas */}
                    <div className="flex flex-wrap gap-1 md:gap-1.5 justify-start">
                      {game.numbers.map(n => <span key={n} className="w-8 h-8 md:w-9 md:h-9 bg-white text-slate-900 rounded-lg md:rounded-xl flex items-center justify-center text-[11px] md:text-[12px] font-black">{String(n).padStart(2, '0')}</span>)}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={finalizeAndSaveLote} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-[12px] uppercase">Confirmar Lote</button>
            </div>
          ) : <div className="h-full min-h-[400px] border-2 border-dashed border-gray-200 rounded-[32px] flex items-center justify-center text-slate-300 text-[10px] font-black uppercase p-10 text-center w-full">Aguardando geração...</div>}
        </div>

        <div className="hidden md:flex flex-col gap-4 max-h-[calc(100vh-250px)] overflow-y-auto w-full">
          <CheckerPanel history={history} officialDraw={officialNumbers} playedLotes={playedLotes} />
          <GameHistory history={history} setHistory={setHistory} draftGames={draftGames} playedLotes={playedLotes} togglePlayed={(id) => setPlayedLotes(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])} onDelete={(id) => setHistory(prev => prev.filter(g => g.id !== id))} onDownloadPDF={downloadPDF} />
        </div>
      </div>

      <div className="hidden md:block w-full mt-4">
        <IntelligencePanel lastDraws={lastDraws} onApplySuggestion={handleApplyAISuggestion} />
      </div>

      {/* AJUSTE 5: Modal mobile garantido sem scroll lateral */}
      {showQuickCheck && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 p-4 flex flex-col overflow-x-hidden box-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-black uppercase italic">Conferir e Enviar</h3>
            <button onClick={() => setShowQuickCheck(false)} className="text-red-500 font-black px-2 py-1">FECHAR [X]</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 w-full">
            <CheckerPanel history={history} officialDraw={officialNumbers} playedLotes={playedLotes} />
            <GameHistory 
                history={history} setHistory={setHistory} draftGames={draftGames} 
                playedLotes={playedLotes} togglePlayed={(id) => setPlayedLotes(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])}
                onDelete={(id) => setHistory(prev => prev.filter(g => g.id !== id))} 
                onDownloadPDF={downloadPDF} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LotofacilProfessional;