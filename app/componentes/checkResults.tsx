// utils/lotofacilUtils.ts (ou onde preferir)

export interface PrizeResult {
  11: number[]; // índices dos jogos que acertaram 11
  12: number[];
  13: number[];
  14: number[];
  15: number[];
}

export const checkLoteResults = (loteGames: number[][], officialResult: number[]) => {
  const prizes: PrizeResult = { 11: [], 12: [], 13: [], 14: [], 15: [] };
  
  loteGames.forEach((game, index) => {
    // Filtra os números que estão presentes no resultado oficial
    const hits = game.filter(num => officialResult.includes(num)).length;
    
    if (hits >= 11) {
      prizes[hits as keyof PrizeResult].push(index);
    }
  });

  return prizes;
};