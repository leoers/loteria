// hooks/useLotofacilCalc.ts
export const useLotofacilCalc = () => {

  // Probabilidades Oficiais (1 em X) para 1 Jogo Individual
  // Fonte: Tabela de Probabilidades Caixa Econômica Federal
  const PROB_TABLE: Record<number, { [key: number]: number }> = {
    15: { 15: 3268760, 14: 21791, 13: 691, 12: 94, 11: 11 },
    16: { 15: 204297, 14: 3026, 13: 162, 12: 30, 11: 5.9 },
    17: { 15: 24035, 14: 600, 13: 49, 12: 12.3, 11: 3.7 },
    18: { 15: 4005, 14: 152, 13: 18, 12: 6, 11: 2.7 },
    19: { 15: 843, 14: 46, 13: 7.7, 12: 3.4, 11: 2.1 },
    20: { 15: 211, 14: 17, 13: 4.1, 12: 2.3, 11: 1.8 }
  };

  /**
   * Calcula a probabilidade baseada na tabela individualizada
   */
  const calcRealProb = (acerto: number, dezenasMarcadas: number, qtdJogos: number) => {
    // Busca o divisor na tabela (ex: 1 em 3.268.760)
    const divisor = PROB_TABLE[dezenasMarcadas]?.[acerto];
    
    if (!divisor) return 0;

    // Probabilidade decimal de 1 jogo (ex: 1 / 3268760)
    const probIndividual = 1 / divisor;

    // Fórmula para probabilidade acumulada em 'n' jogos:
    // P = (1 - (1 - p)^n) * 100
    const chanceFinal = (1 - Math.pow(1 - probIndividual, qtdJogos)) * 100;

    return Math.min(chanceFinal, 100);
  };

  /**
   * Mantemos esta para o Lote Misto (Histórico)
   * Baseada em combinações equivalentes de 15 dezenas
   */
  const calcLoteProb = (games: number[][]) => {
    if (!games || games.length === 0) return 0;
    
    const totalChanceDecimal = games.reduce((acc, game) => {
      const dezenas = game.length;
      const divisor = PROB_TABLE[dezenas]?.[15];
      return acc + (divisor ? (1 / divisor) : 0);
    }, 0);

    return Math.min(totalChanceDecimal * 100, 100);
  };

  return { calcRealProb, calcLoteProb };
};