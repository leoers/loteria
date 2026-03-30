import React, { useState, useMemo } from 'react';

interface GameBatch {
  dezenas: number;
  qtd: number;
  id: number;
}

interface ConfigPanelProps {
  excluded: number[];
  favorites: number[];
  officialNumbers: number[]; 
  toggleExcluded: (n: number) => void;
  toggleFavorite: (n: number) => void;
  onGenerateAll: (batches: GameBatch[]) => void;
  onClear: () => void;
}

export const ConfigPanel = ({
  excluded = [],
  favorites = [],
  officialNumbers = [], 
  toggleExcluded,
  toggleFavorite,
  onGenerateAll,
  onClear
}: ConfigPanelProps) => {
  const [dezenasPorJogo, setDezenasPorJogo] = useState(15);
  const [numGames, setNumGames] = useState(1);
  const [batch, setBatch] = useState<GameBatch[]>([]);

  const allNumbers = Array.from({ length: 25 }, (_, i) => i + 1);

  // Estatísticas de seleção para a estratégia 12+6
  const stats = useMemo(() => {
    const repetidas = favorites?.filter(n => officialNumbers?.includes(n)).length || 0;
    const novas = favorites?.filter(n => !officialNumbers?.includes(n)).length || 0;
    return { repetidas, novas };
  }, [favorites, officialNumbers]);

  const addToBatch = () => {
    setBatch([...batch, { dezenas: dezenasPorJogo, qtd: numGames, id: Date.now() }]);
  };

  const removeFromBatch = (id: number) => {
    setBatch(batch.filter(item => item.id !== id));
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-[32px] shadow-sm border border-gray-100 h-full space-y-4 md:space-y-6 w-full max-w-full overflow-hidden box-border">
      <div className="flex justify-between items-center border-b pb-2">
        <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 italic">
          Configuração do Lote
        </h2>
        {(favorites.length > 0 || excluded.length > 0) && (
          <button 
            onClick={onClear}
            className="text-[9px] font-black text-red-500 uppercase bg-red-50 px-3 py-1 rounded-full hover:bg-red-500 hover:text-white transition-all"
          >
            Limpar
          </button>
        )}
      </div>

      {/* PAINEL DE ESTRATÉGIA 12+6 INTERNO */}
      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex flex-col items-center border-r border-slate-200">
            <span className="text-[7px] font-black text-slate-400 uppercase">Repetidas</span>
            <span className={`text-sm font-black ${stats.repetidas === 12 ? 'text-emerald-500' : 'text-slate-700'}`}>
                {stats.repetidas} <span className="text-[9px] text-slate-400">/ 12</span>
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-black text-slate-400 uppercase">Novas</span>
            <span className={`text-sm font-black ${stats.novas === 6 ? 'text-blue-500' : 'text-slate-700'}`}>
                {stats.novas} <span className="text-[9px] text-slate-400">/ 6</span>
            </span>
          </div>
      </div>

      {/* 1. SELEÇÃO DE DEZENAS E QTD */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-start">
        <div className="grid grid-cols-3 gap-1.5 flex-1">
          {[15, 16, 17, 18, 19, 20].map(n => (
            <button
              key={n}
              onClick={() => setDezenasPorJogo(n)}
              className={`py-2.5 rounded-xl text-[10px] font-black border transition-all ${
                dezenasPorJogo === n 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                  : 'bg-white text-slate-600 border-gray-100'
              }`}
            >
              {n} D
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-end justify-between sm:justify-start">
          <div className="flex-1 sm:w-20 p-2 bg-gray-50 rounded-2xl border border-gray-100">
            <label className="text-[8px] font-black text-slate-500 uppercase mb-1 block text-center leading-none">Qtd</label>
            <input
              type="number"
              value={numGames}
              onChange={(e) => setNumGames(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-transparent text-center font-black text-slate-800 outline-none text-xs"
            />
          </div>
          <button 
            onClick={addToBatch}
            className="bg-blue-50 text-blue-600 border border-blue-100 px-4 py-3 rounded-2xl font-black text-[9px] uppercase hover:bg-blue-600 hover:text-white transition-all active:scale-95 leading-none h-[42px] flex-1 sm:flex-none"
          >
            Adicionar +
          </button>
        </div>
      </div>

      {/* 2. VISUALIZAÇÃO DO LOTE ATUAL */}
      {batch.length > 0 && (
        <div className="py-2 border-y border-gray-50">
          <p className="text-[8px] font-black text-slate-400 uppercase italic mb-2">Lote Atual:</p>
          <div className="flex flex-wrap gap-1.5">
            {batch.map((item) => (
              <div key={item.id} className="flex items-center gap-1.5 bg-slate-50 pl-2.5 pr-1.5 py-1 rounded-lg border border-slate-100">
                <span className="text-[9px] font-bold text-slate-700">
                  {item.qtd}x <span className="text-blue-600">{item.dezenas}D</span>
                </span>
                <button 
                  onClick={() => removeFromBatch(item.id)} 
                  className="w-4 h-4 flex items-center justify-center bg-white rounded-full text-red-400 text-[8px] shadow-sm border border-red-50"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TECLADOS DE ESTRATÉGIA */}
      <div className="grid grid-cols-2 gap-3 md:gap-6 pt-2">
        <div className="space-y-2">
          <div className="text-center min-h-[28px] flex flex-col justify-center">
            <h3 className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase italic leading-tight">Escolher 18 ⭐</h3>
            <p className="text-[7px] font-bold text-slate-400 uppercase leading-tight italic">Azul = Novas | Verde = Repetidas</p>
          </div>
          <div className="grid grid-cols-5 gap-0.5 md:gap-1">
            {allNumbers.map((n) => {
              const isFav = favorites?.includes(n);
              const isExcl = excluded?.includes(n);
              const isFromPrevious = officialNumbers?.includes(n);
              
              return (
                <button
                  key={n}
                  onClick={() => toggleFavorite(n)}
                  className={`h-7 md:h-8 rounded-md md:rounded-lg text-[9px] md:text-[10px] font-black border transition-all relative ${
                    isFav 
                      ? (isFromPrevious ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm' : 'bg-blue-500 text-white border-blue-600 shadow-sm') 
                      : 'bg-white text-slate-400 border-gray-100 hover:border-slate-300'
                  } ${isExcl ? 'opacity-10 cursor-not-allowed' : 'active:scale-90'}`}
                  disabled={isExcl}
                >
                  {String(n).padStart(2, '0')}
                  {isFromPrevious && !isFav && (
                    <span className="absolute top-0.5 right-0.5 w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-center min-h-[28px] flex flex-col justify-center">
            <h3 className="text-[9px] md:text-[10px] font-black text-red-500 uppercase italic leading-tight">Excluir ✕</h3>
            <p className="text-[7px] font-bold text-slate-400 uppercase leading-tight italic">Bloqueados</p>
          </div>
          <div className="grid grid-cols-5 gap-0.5 md:gap-1">
            {allNumbers.map((n) => {
              const isExcluded = excluded?.includes(n);
              const isFav = favorites?.includes(n);
              return (
                <button
                  key={n}
                  onClick={() => toggleExcluded(n)}
                  className={`h-7 md:h-8 rounded-md md:rounded-lg text-[9px] md:text-[10px] font-black border transition-all ${
                    isExcluded ? 'bg-red-500 text-white border-red-600 shadow-md' : 
                    'bg-white text-slate-400 border-gray-100 hover:border-slate-300'
                  } ${isFav ? 'opacity-10 cursor-not-allowed' : 'active:scale-90'}`}
                  disabled={isFav}
                >
                  {String(n).padStart(2, '0')}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={() => onGenerateAll(batch)}
        disabled={batch.length === 0}
        className="w-full bg-slate-900 disabled:bg-slate-100 disabled:text-slate-400 text-white py-4 rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all shadow-xl active:scale-95 border-b-4 border-slate-800"
      >
        Gerar {batch.reduce((acc, curr) => acc + (curr.qtd || 0), 0)} Jogos
      </button>
    </div>
  );
};