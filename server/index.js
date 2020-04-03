const express = require('express');
const app = express();
const port = 5000;

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

const DECK = [];

for (i of Object.keys(RANKS)) {
  for (j of Object.keys(SUITS)) {
    DECK.push({
      RANK: i,
      SUIT: j
    })
  }
}

// Utilities
const removeFromDeck = (array, value) => {
  var idx = array.indexOf(value);
  if (idx !== -1) {
    array.splice(idx, 1);
  }
  return array;
}

const advanceCurrentTurnByOne = () => {
  // TODO: we desperately need Typescript, look at all the type errors we can get
  if (Number(gameState.currentTurnIndex) === Number(numPlayers - 1)) {
    gameState.currentTurnIndex = 0;
  } else {
    gameState.currentTurnIndex++;
  }
}

const getBaseSuit = () => {
  return gameState.roundStack.length > 0 ? gameState.roundStack[0].card.SUIT : '';
}

const totalAvailableCards = () => {
  return gameState.players.map(player => player.availableCards.length).reduce((a, b) => a + b, 0);
}

const isFirstMoveOfGame = () => {
  return totalAvailableCards() === numCardsInDeck;
}

const isFirstRound = () => {
  return totalAvailableCards() >= (numCardsInDeck - numPlayers + 1);
}

const isGameOver = () => {
  return totalAvailableCards() === 0;
}

const cardPointValue = (card) => {
  if (card.RANK === RANKS.QUEEN && card.SUIT === SUITS.HEARTS) {
    return 13;
  } else if (card.SUIT === SUITS.SPADES) {
    return 1;
  } else {
    return 0;
  }
}

const hasASpadeBeenPlayed = () => {
  const playedCards = gameState.players.map(player => player.earnedCards).reduce((a, b) => a.concat(b), []).concat(gameState.roundStack.map(item => item.card));
  return playedCards.filter(card => card.SUIT === SUITS.SPADES).length > 0;
}

// returns the highest rank, given an array of cards
const highestRank = (arr) => {
  const ranks = arr.map(card => card.RANK);

  if (ranks.includes(RANKS.KING)) return RANKS.KING;
  if (ranks.includes(RANKS.QUEEN)) return RANKS.QUEEN;
  if (ranks.includes(RANKS.JACK)) return RANKS.JACK;
  if (ranks.includes(RANKS.TEN)) return RANKS.TEN;
  if (ranks.includes(RANKS.NINE)) return RANKS.NINE;
  if (ranks.includes(RANKS.EIGHT)) return RANKS.EIGHT;
  if (ranks.includes(RANKS.SEVEN)) return RANKS.SEVEN;
  if (ranks.includes(RANKS.SIX)) return RANKS.SIX;
  if (ranks.includes(RANKS.FIVE)) return RANKS.FIVE;
  if (ranks.includes(RANKS.FOUR)) return RANKS.FOUR;
  if (ranks.includes(RANKS.THREE)) return RANKS.KITHREENG;
  if (ranks.includes(RANKS.TWO)) return RANKS.TWO;
  if (ranks.includes(RANKS.ACE)) return RANKS.ACE;

  return '';
}

// State
// Any requests that modify gameState should return the new gameState
const gameState = {
  players: [],
  active: false, // whether the game has started
  deck: DECK, // all the cards left for the current game (notice the game-round distinction)
  currentTurnIndex: 0, // index of the player who's turn it currently is
  roundStack: [], // stack of cards played in the current round, and the person that played it
}

// Functions that modify gameState
const addPlayerToGame = (name) => {
  gameState.players.push({
    name,
    availableCards: [],
    earnedCards: [],
  });
}

// Activates the game and deals the cards
const startGame = () => {
  // Set game state active
  gameState.active = true;

  // Deal cards from deck
  for (i in gameState.players) {
    for (j in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]) {
      let randCard = gameState.deck[Math.floor(Math.random() * gameState.deck.length)];
      gameState.players[i].availableCards.push(randCard);
      removeFromDeck(gameState.deck, randCard);

      // Set currentTurnIndex to whomever has the ace of diamonds
      if (randCard.RANK === RANKS.ACE && randCard.SUIT === SUITS.DIAMONDS) {
        gameState.currentTurnIndex = i;
      }
    }
  }
}

const playCard = (index, rank, suit) => {
  const baseSuit = getBaseSuit();

  // remove card from player's available cards; this is super spunky that it's an "OR" in the rank and suit thing
  gameState.players[index].availableCards = gameState.players[index].availableCards.filter(item => item.RANK !== rank || item.SUIT !== suit);

  // add card to round stack
  gameState.roundStack.push({ card: { RANK: rank, SUIT: suit }, playerIndex: index });

  // check if this is the fourth card played in the round; if so, assign the cards to the person who played the highest relevant rank
  if (gameState.roundStack.length === numCardsPerRound) {
    const roundStackBaseSuitOnly = gameState.roundStack.filter(item => item.card.SUIT === baseSuit);
    const highestRankOfBaseSuit = highestRank(roundStackBaseSuitOnly.map(item => item.card));
    const roundStackItemWithHighestRank = roundStackBaseSuitOnly.find(item => item.card.RANK === highestRankOfBaseSuit);
    const winningIndex = roundStackItemWithHighestRank.playerIndex;

    // assign all the cards to the winner's earned cards
    for (card of gameState.roundStack.map(item => item.card)) {
      gameState.players[winningIndex].earnedCards.push(card);
    }

    // remove the cards from the roundStack
    gameState.roundStack = [];

    // set current turn to the winner
    gameState.currentTurnIndex = Number(winningIndex);

    // TODO: end the game, calculate the point values for everyone; either via counting hearts or shoot the moon
    if (isGameOver()) {

      const playerPointsMap = gameState.players.map(player => {
        let numPoints = 0;
        for (earnedCard of player.earnedCards) {
          numPoints += cardPointValue(earnedCard);
        }

        return {
          playerName: player.name,
          pointsThisRound: numPoints
        }
      })

      console.log('playerPointsMap', playerPointsMap);

      // TODO: 
      // - calculate if someone shot the moon
      // - store these point values and display in the UI
      // - reset game state so that we can play again
    }

  } else {
    // move forward the current turn by one
    advanceCurrentTurnByOne();
  }
}

// Move violations

const firstMoveOfGameAceOfDiamondsViolation = (rank, suit) => {
  const firstMoveOfGame = isFirstMoveOfGame();

  return firstMoveOfGame && (rank !== RANKS.ACE || suit !== SUITS.DIAMONDS);
}

const baseSuitViolation = (index, suit) => {
  const baseSuit = getBaseSuit();

  return baseSuit &&
    (gameState.players[index].availableCards.filter(card => card.SUIT === baseSuit).length > 0) &&
    suit !== baseSuit;
}

const queenOfHeartsFirstRoundViolation = (rank, suit) => {
  const firstRound = isFirstRound();

  return firstRound && (rank === RANKS.QUEEN && suit === SUITS.HEARTS);
}

const spadesFirstRoundViolation = (suit) => {
  const firstRound = isFirstRound();

  return firstRound && suit === SUITS.SPADES
}

const breakSpadesViolation = (suit) => {
  const spadePlayed = hasASpadeBeenPlayed();

  return gameState.roundStack.length === 0 &&
    !spadePlayed &&
    suit === SUITS.SPADES;
}

app.get('/', (req, res) => res.send('Hearts!'));

app.get('/api/game', (req, res) => {
  res.status(200).send({ message: 'Here is your data', gameState });
});

const simulateOneTurn = () => {
  // Find out whose turn it is
  const index = gameState.currentTurnIndex;

  // Chose any available card to play that isn't a violation
  let rankToPlay;
  let suitToPlay;

  gameState.players[index].availableCards.forEach(card => {
    const rank = card.RANK;
    const suit = card.SUIT;
    if (!firstMoveOfGameAceOfDiamondsViolation(rank, suit) &&
      !baseSuitViolation(index, suit) &&
      !queenOfHeartsFirstRoundViolation(rank, suit) &&
      !spadesFirstRoundViolation(suit) &&
      !breakSpadesViolation(suit)) {
      rankToPlay = rank;
      suitToPlay = suit;
    }
  })

  console.info(`${gameState.players[index].name} is playing the ${rankToPlay} of ${suitToPlay}s`);
  playCard(index, rankToPlay, suitToPlay);
}

// Note: this is very dangerous to expose freely and can mess the state up drastically
app.get('/api/simulate', (req, res) => {

  console.info('beginning simulation...');

  // Add the players
  addPlayerToGame('a'); console.info('added player a to game');
  addPlayerToGame('b'); console.info('added player b to game');
  addPlayerToGame('c'); console.info('added player c to game');
  addPlayerToGame('d'); console.info('added player d to game');

  // Start the game (including dealing cards)
  startGame(); console.info('game started');

  // Simulate all 52 moves in the game
  Array.from(Array(numCardsInDeck)).forEach((x, i) => {
    simulateOneTurn();
  })

  res.status(200).send({ message: 'Simulated a bit, here is your new state', gameState });
});

app.get('/api/join', (req, res) => {
  const name = req.query.name;

  if (!name) {
    res.status(400).send({ error: 'Please supply a name.' });
    return;
  }

  if (gameState.players.length >= numPlayers) {
    res.status(400).send({ error: 'Sorry the game is full.' });
    return;
  }

  if (gameState.players.map(player => player.name).includes(name)) {
    res.status(400).send({ error: 'That name is taken.' });
    return;
  }

  addPlayerToGame(name);

  res.status(200).send({ message: 'Joined!', name, gameState });
});

app.get('/api/start', (req, res) => {

  if (gameState.players.length !== numPlayers) {
    res.status(400).send({ error: 'Game not full yet.', gameState });
    return;
  }

  startGame();

  res.status(200).send({ message: 'Game started!', gameState });
});

app.get('/api/play', (req, res) => {

  // The query params are the inputs to the move
  const index = req.query.index;
  const rank = req.query.rank;
  const suit = req.query.suit;

  if ((index !== 0 && !index) || !rank || !suit) {
    res.status(400).send({ error: 'Please supply index, rank, and suit.' });
    return;
  }

  // Potential errors

  // 1. first move of the game must be ace of diamonds
  if (firstMoveOfGameAceOfDiamondsViolation(rank, suit)) {
    res.status(400).send({ error: 'You must play the Ace of Diamonds on the first move of the game.' });
    return;
  }

  // 2. if there's a base suit (not the first move of the round), must play base suit if you have it
  if (baseSuitViolation(index, suit)) {
    res.status(400).send({ error: 'You must play the base suit if you have a card of that suit.' });
    return;
  }

  // 3. the queen of hearts can't be played in the first round
  if (queenOfHeartsFirstRoundViolation(rank, suit)) {
    res.status(400).send({ error: 'You cannot play the Queen of Hearts in the first round.' });
    return;
  }

  // 4. spades can't be played in the first round
  if (spadesFirstRoundViolation(suit)) {
    res.status(400).send({ error: 'You cannot play spades in the first round.' });
    return;
  }

  // 5. if it's the first card of the round, can't be a spade if no spade has been played yet
  if (breakSpadesViolation(suit)) {
    res.status(400).send({ error: 'You cannot break spades on the first card of the round.' });
    return;
  }

  playCard(index, rank, suit);

  res.status(200).send({ message: 'API path in progress...', gameState });
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));