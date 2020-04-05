// Constants
const NUM_PLAYERS = 4;
const NUM_CARDS_PER_ROUND = 4;
const NUM_CARDS_IN_DECK = 52;

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

module.exports = { NUM_PLAYERS, NUM_CARDS_PER_ROUND, NUM_CARDS_IN_DECK, RANKS, SUITS };