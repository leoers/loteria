import React, { useState } from 'react';

interface GameBatch {
  dezenas: number;
  qtd: number;
  id: number;
}

interface ConfigPanelProps {
  excluded: number[];
  favorites: number[];
  toggleExcluded: (n: number) => void;
  toggleFavorite: (n: number) => void;
  onGenerateAll: (batches: GameBatch[]) => void;
}

export const ConfigPanel = ({
  excluded,
  favorites,
  toggleExcluded,
  toggleFavorite,
  onGenerateAll
}: ConfigPanelProps) => {
  const [dezenasPorJogo, setDezenasPorJogo] = useState(15);
  const [numGames, setNumGames] = useState(1);
  const [batch, setBatch] = useState<GameBatch[]>([]);

  const allNumbers = Array.from({ length: 25 }, (_, i) => i + 1);

  const addToBatch = () => {
    setBatch([...batch, { dezenas: dezenasPorJogo, qtd: numGames, id: Date.now() }]);
  };

  const removeFromBatch = (id: number) => {
    setBatch(batch.filter(item => item.id !== id));
  };

  return (
    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 h-full space-y-6">
      <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic border-b pb-2">
        Configuração do Lote
      </h2>

      {/* 1. SELEÇÃO DE DEZENAS E QTD (LADO A LADO) */}
      <div className="flex gap-4 items-start">
        <div className="grid grid-cols-3 gap-1.5 flex-1">
          {[15, 16, 17, 18, 19, 20].map(n => (
            <button
              key={n}
              onClick={() => setDezenasPorJogo(n)}
              className={`py-2.5 rounded-xl text-[10px] font-black border transition-all ${
                dezenasPorJogo === n 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                  : 'bg-white text-slate-600 border-gray-100 hover:border-blue-200'
              }`}
            >
              {n} D
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-end">
          <div className="w-20 p-2 bg-gray-50 rounded-2xl border border-gray-100">
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
            className="bg-blue-50 text-blue-600 border border-blue-100 px-4 py-3 rounded-2xl font-black text-[9px] uppercase hover:bg-blue-600 hover:text-white transition-all active:scale-95 leading-none h-[42px]"
          >
            Adicionar +
          </button>
        </div>
      </div>

      {/* 2. VISUALIZAÇÃO DO LOTE ATUAL (HORIZONTAL COMPACTO) */}
      {batch.length > 0 && (
        <div className="py-2 border-y border-gray-50">
          <p className="text-[8px] font-black text-slate-400 uppercase italic mb-2">Lote Atual:</p>
          <div className="flex flex-wrap gap-2">
            {batch.map((item) => (
              <div key={item.id} className="flex items-center gap-2 bg-slate-50 pl-3 pr-2 py-1.5 rounded-lg border border-slate-100">
                <span className="text-[9px] font-bold text-slate-700">
                  {item.qtd}x <span className="text-blue-600">{item.dezenas}D</span>
                </span>
                <button 
                  onClick={() => removeFromBatch(item.id)} 
                  className="w-4 h-4 flex items-center justify-center bg-white rounded-full text-red-400 hover:bg-red-50 transition-colors text-[8px] shadow-sm border border-red-50"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TECLADOS DE ESTRATÉGIA (LADO A LADO) */}
      <div className="grid grid-cols-2 gap-6 pt-2">
        
        {/* COLUNA ESQUERDA: FAVORITOS */}
        <div className="space-y-3">
          <div className="text-center min-h-[32px] flex flex-col justify-center">
            <h3 className="text-[10px] font-black text-emerald-600 uppercase italic leading-tight">Favoritos ⭐</h3>
            <p className="text-[7px] font-bold text-slate-400 uppercase leading-tight italic">Estarão em todos</p>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {allNumbers.map((n) => {
              const isFav = favorites.includes(n);
              const isExcl = excluded.includes(n);
              return (
                <button
                  key={n}
                  onClick={() => toggleFavorite(n)}
                  className={`h-8 rounded-lg text-[10px] font-black border transition-all ${
                    isFav ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105' : 
                    'bg-white text-slate-400 border-gray-100 hover:border-emerald-200'
                  } ${isExcl ? 'opacity-10 cursor-not-allowed' : ''}`}
                  disabled={isExcl}
                >
                  {String(n).padStart(2, '0')}
                </button>
              );
            })}
          </div>
        </div>

        {/* COLUNA DIREITA: EXCLUSÃO */}
        <div className="space-y-3">
          <div className="text-center min-h-[32px] flex flex-col justify-center">
            <h3 className="text-[10px] font-black text-red-500 uppercase italic leading-tight">Excluir ✕</h3>
            <p className="text-[7px] font-bold text-slate-400 uppercase leading-tight italic">Nunca sorteados</p>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {allNumbers.map((n) => {
              const isExcluded = excluded.includes(n);
              const isFav = favorites.includes(n);
              return (
                <button
                  key={n}
                  onClick={() => toggleExcluded(n)}
                  className={`h-8 rounded-lg text-[10px] font-black border transition-all ${
                    isExcluded ? 'bg-red-500 text-white border-red-600 shadow-md scale-105' : 
                    'bg-white text-slate-400 border-gray-100 hover:border-red-200'
                  } ${isFav ? 'opacity-10 cursor-not-allowed' : ''}`}
                  disabled={isFav}
                >
                  {String(n).padStart(2, '0')}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. BOTÃO GERAR */}
      <button
        onClick={() => onGenerateAll(batch)}
        disabled={batch.length === 0}
        className="w-full bg-slate-900 disabled:bg-slate-100 disabled:text-slate-400 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl active:scale-95 border-b-4 border-slate-800"
      >
        Gerar {batch.reduce((acc, curr) => acc + curr.qtd, 0)} Jogos no Lote
      </button>
    </div>
  );
};