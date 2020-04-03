// Constants
const numPlayers = 4;
const numCardsPerRound = 4;
const numCardsInDeck = 52;

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

module.exports = { numPlayers, numCardsPerRound, numCardsInDeck, RANKS, SUITS };
