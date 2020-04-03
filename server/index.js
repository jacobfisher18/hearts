const express = require('express');
const path = require('path');
const app = express();
const {
  NUM_PLAYERS,
  NUM_CARDS_PER_ROUND,
  NUM_CARDS_IN_DECK,
  RANKS,
  SUITS
} = require('./constants');
const port = 5000;

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
  if (Number(gameState.currentTurnIndex) === Number(NUM_PLAYERS - 1)) {
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
  return totalAvailableCards() === NUM_CARDS_IN_DECK;
}

const isFirstRound = () => {
  return totalAvailableCards() >= (NUM_CARDS_IN_DECK - NUM_PLAYERS + 1);
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
const setBlankGameState = () => {
  gameState.players = [];
  gameState.active = false; // whether the game has started
  gameState.deck = []; // all the cards left for the current game (notice the game-round distinction)
  gameState.currentTurnIndex = 0; // index of the player who's turn it currently is
  gameState.roundStack = []; // stack of cards played in the current round, and the person that played it
  gameState.showResults = false; // whether to show the score of the game that just happened
  gameState.playerPointsMap = {}; // the results of the game that just happened
}

// Any requests that modify gameState should return the new gameState
const gameState = {}
setBlankGameState();

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

  // Fill the deck with all the cards
  for (i of Object.keys(RANKS)) {
    for (j of Object.keys(SUITS)) {
      gameState.deck.push({
        RANK: i,
        SUIT: j
      })
    }
  }

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
  if (gameState.roundStack.length === NUM_CARDS_PER_ROUND) {
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

      gameState.playerPointsMap = playerPointsMap;
      gameState.showResults = true;

      // TODO: 
      // - store these point values across multiple game
      // - calculate if someone shot the moon, and give option to assign points
      // - ability to play again with current username
    }

  } else {
    // move forward the current turn by one
    advanceCurrentTurnByOne(gameState);
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

// use static files from /build
app.use(express.static(path.join(__dirname, 'build')));

app.get('/api/health', (req, res) => res.send('Hearts is ready to go!'));

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

  const isProd = false; // temporary solution to disable this

  if (isProd) {
    res.status(200).send({ message: 'Simulating is disabled here.' });
    return;
  }

  // Start with a fresh state if it's not fresh already
  setBlankGameState();

  console.info('beginning simulation...');

  // Add the players
  addPlayerToGame('a'); console.info('added player a to game');
  addPlayerToGame('b'); console.info('added player b to game');
  addPlayerToGame('c'); console.info('added player c to game');
  addPlayerToGame('d'); console.info('added player d to game');

  // Start the game (including dealing cards)
  startGame(); console.info('game started');

  // Simulate all 52 moves in the game
  Array.from(Array(NUM_CARDS_IN_DECK)).forEach((x, i) => {
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

  if (gameState.players.length >= NUM_PLAYERS) {
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

  if (gameState.players.length !== NUM_PLAYERS) {
    res.status(400).send({ error: 'Game not full yet.', gameState });
    return;
  }

  startGame();

  res.status(200).send({ message: 'Game started!', gameState });
});

app.get('/api/reset', (req, res) => {
  setBlankGameState();
  res.status(200).send({ message: 'Reset the game.', gameState });
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

// all routes not yet handled should be served by the built frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));