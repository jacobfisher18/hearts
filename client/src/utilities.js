const NUM_PLAYERS = 4;

const RANKS = {
  ACE: 'ACE',
  TWO: 'TWO',
  THREE: 'THREE',
  FOUR: 'FOUR',
  FIVE: 'FIVE',
  SIX: 'SIX',
  SEVEN: 'SEVEN',
  EIGHT: 'EIGHT',
  NINE: 'NINE',
  TEN: 'TEN',
  JACK: 'JACK',
  QUEEN: 'QUEEN',
  KING: 'KING',
}

const SUITS = {
  CLUBS: 'CLUBS',
  DIAMONDS: 'DIAMONDS',
  SPADES: 'SPADES',
  HEARTS: 'HEARTS',
}

const rankToInt = (rank) => {
  if (rank === RANKS.KING) return 13;
  if (rank === RANKS.QUEEN) return 12;
  if (rank === RANKS.JACK) return 11;
  if (rank === RANKS.TEN) return 10;
  if (rank === RANKS.NINE) return 9;
  if (rank === RANKS.EIGHT) return 8;
  if (rank === RANKS.SEVEN) return 7;
  if (rank === RANKS.SIX) return 6;
  if (rank === RANKS.FIVE) return 5;
  if (rank === RANKS.FOUR) return 4;
  if (rank === RANKS.THREE) return 3;
  if (rank === RANKS.TWO) return 2;
  if (rank === RANKS.ACE) return 1;

  return -1;
}

const suitToInt = (suit) => {
  if (suit === SUITS.HEARTS) return 3;
  if (suit === SUITS.CLUBS) return 2;
  if (suit === SUITS.DIAMONDS) return 1;
  if (suit === SUITS.SPADES) return 0;

  return -1;
}

function cardSortFunction(cardA, cardB) {
  if (suitToInt(cardA.SUIT) < suitToInt(cardB.SUIT)) {
    return -1;
  }
  if (suitToInt(cardA.SUIT) > suitToInt(cardB.SUIT)) {
    return 1;
  }
  if (rankToInt(cardA.RANK) < rankToInt(cardB.RANK)) {
    return -1;
  }
  if (rankToInt(cardA.RANK) > rankToInt(cardB.RANK)) {
    return 1;
  }
  return 0;
}

module.exports = { NUM_PLAYERS, RANKS, SUITS, cardSortFunction };