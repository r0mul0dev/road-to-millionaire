export type BetResult = 'pending' | 'won' | 'lost';

export type BetLike = {
  stake: number;
  odds: number;
  result: BetResult;
};

export function computeCurrentBankroll(initial: number, bets: BetLike[]): number {
  let bankroll = initial;

  for (const b of bets) {
    bankroll -= b.stake;

    if (b.result === 'won') {
      bankroll += b.stake * b.odds;
    }
  }

  return Math.round(bankroll * 100) / 100;
}

export function computeBetDerivedFields(stake: number, odds: number, result: BetResult) {
  const payout = result === 'won' ? stake * odds : 0;
  const profit = result === 'won' ? payout - stake : result === 'lost' ? -stake : 0;

  return {
    payout: Math.round(payout * 100) / 100,
    profit: Math.round(profit * 100) / 100,
  };
}
