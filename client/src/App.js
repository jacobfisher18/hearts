import React from 'react';
import './App.css';

const numPlayers = 4;

class App extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      error: '',
      joinName: '', // initial name joined as
      refreshName: '', // for entering name after refreshing the page
      activePlayerIndex: -1, // which index in the players array is the active player
      gameState: {
        active: false,
        players: [],
        currentTurnIndex: 0,
        roundStack: [],
        showResults: false,
        playerPointsMap: {}
      },
    }

    this.refreshGameState = this.refreshGameState.bind(this);
    this.joinGame = this.joinGame.bind(this);
    this.startGame = this.startGame.bind(this);
    this.renderPlayerList = this.renderPlayerList.bind(this);
    this.renderAvailableCards = this.renderAvailableCards.bind(this);
    this.renderEarnedCards = this.renderEarnedCards.bind(this);
    this.renderRoundStack = this.renderRoundStack.bind(this);
    this.playCard = this.playCard.bind(this);
    this.submitName = this.submitName.bind(this);
    this.playAgain = this.playAgain.bind(this);
  }

  submitName(e) {
    e.preventDefault();
    this.setState({ error: '' });

    const { players } = this.state.gameState;
    const { refreshName } = this.state;
    let found = false;

    for (let i in players) {
      if (players[i].name === refreshName) {
        this.setState({ activePlayerIndex: i });
        found = true;
      }
    }

    if (!found) {
      this.setState({ error: 'That name is not part of the game.' });
    }
  }

  renderRoundStack() {
    const { roundStack } = this.state.gameState;

    // there's got to be a better way than this
    // but it was doing deep reversal with the built in js reverse method
    let reversedStack = [];
    for (let item of roundStack) {
      reversedStack.unshift(item);
    }

    return reversedStack.map(item => {
      return (
        <div
          key={`${item.card.RANK}-${item.card.SUIT}`}
        >
          {item.card.RANK} of {item.card.SUIT}s
        </div>
      )
    })
  }

  refreshGameState() {
    this.setState({ error: '' });

    fetch(`/api/game`)
      .then((response) => response.json()) // response must be in json or this will error
      .then((myJson) => {
        if (myJson.error) {
          console.log('Error with fetch request: ', myJson.error);
          this.setState({ error: myJson.error });
        } else {
          this.setState({ gameState: myJson.gameState });
        }
      })
      .catch((err) => {
        console.log('Error with fetch request: ', err);
        this.setState({ error: 'There was an unknown problem.' });
      });
  }

  playAgain = () => {
    fetch(`/api/restart`)
      .then((response) => response.json()) // response must be in json or this will error
      .then((myJson) => {
        if (myJson.error) {
          console.log('Error with fetch request: ', myJson.error);
          this.setState({ error: myJson.error });
        } else {
          this.setState({ gameState: myJson.gameState });
        }
      })
      .catch((err) => {
        console.log('Error with fetch request: ', err);
        this.setState({ error: 'There was an unknown problem.' });
      });
  }

  componentDidMount() {
    this.refreshGameState();
  }

  joinGame(e) {
    e.preventDefault();
    const { joinName } = this.state;
    this.setState({ error: '', joinName: '' });
    

    fetch(`/api/join?name=${joinName}`)
      .then((response) => response.json()) // response must be in json or this will error
      .then((myJson) => {
        if (myJson.error) {
          console.log('Error with fetch request: ', myJson.error);
          this.setState({ error: myJson.error });
        } else {
          // handle success
          this.setState({ gameState: myJson.gameState });
        }
      })
      .catch((err) => {
        console.log('Error with fetch request: ', err);
        this.setState({ error: 'There was an unknown problem.' });
      });
  }

  startGame() {
    if (this.state.gameState.players.length !== numPlayers) {
      this.setState({ error: 'Game does not look full yet. Maybe try refreshing.' });
      return;
    }

    this.setState({ error: '' });

    fetch(`/api/start`)
      .then((response) => response.json()) // response must be in json or this will error
      .then((myJson) => {
        if (myJson.error) {
          console.log('Error with fetch request: ', myJson.error);
          this.setState({ error: myJson.error });
        } else {
          this.setState({ gameState: myJson.gameState });
        }
      })
      .catch((err) => {
        console.log('Error with fetch request: ', err);
        this.setState({ error: 'There was an unknown problem.' });
      });
  }

  playCard(index, rank, suit) {
    this.setState({ error: '' });

    fetch(`/api/play?index=${index}&rank=${rank}&suit=${suit}`)
      .then((response) => response.json()) // response must be in json or this will error
      .then((myJson) => {
        if (myJson.error) {
          console.log('Error with fetch request: ', myJson.error);
          this.setState({ error: myJson.error });
        } else {
          this.setState({ gameState: myJson.gameState });
        }
      })
      .catch((err) => {
        console.log('Error with fetch request: ', err);
        this.setState({ error: 'There was an unknown problem.' });
      });
  }

  renderPlayerList() {
    const { activePlayerIndex } = this.state;
    const { active } = this.state.gameState;

    return (
      <div>
        <h2>Players</h2>
        {this.state.gameState.players.map((player, index) => {
          return (
            <p
              className={active && Number(activePlayerIndex) === Number(index) ? 'bold' : ''}
              key={player.name}
            >
              {player.name}{active && Number(this.state.gameState.currentTurnIndex) === Number(index) ? ' (current turn)' : ''}
            </p>
          )
        })}
      </div>
    )
  }

  renderAvailableCards() {
    const { activePlayerIndex } = this.state;
    const { players, currentTurnIndex } = this.state.gameState;
    
    const availableCards = players[activePlayerIndex].availableCards;

    return availableCards.map(card => {
      return (
        <button
          key={`${card.RANK}-${card.SUIT}`}
          onClick={() => {
            if (Number(currentTurnIndex) !== Number(activePlayerIndex)) {
              alert('It is not your turn.');
            } else {
              this.playCard(activePlayerIndex, card.RANK, card.SUIT);
            }
          }}
        >
          {card.RANK} of {card.SUIT}s
        </button>
      )
    })
  }

  renderEarnedCards() {
    const { activePlayerIndex } = this.state;
    const { players } = this.state.gameState;

    const earnedCards = players[activePlayerIndex].earnedCards;

    return earnedCards.map(card => {
      return (
        <div
          key={`${card.RANK}-${card.SUIT}`}
        >
          {card.RANK} of {card.SUIT}s
        </div>
      )
    })
  }

  render() {
    if (this.state.gameState.active && this.state.activePlayerIndex === -1) {
      return (
        <div className="App">
          <h1>Hearts</h1>
          <h3>Name</h3>
          {this.state.error && <p>{this.state.error}</p>}
          <form onSubmit={this.submitName}>
            <label>
              What name did you join as?
            <input type="text" value={this.state.refreshName} onChange={e => { this.setState({ refreshName: e.target.value }) }} />
            </label>
            <input type="submit" value="Enter" />
          </form>
        </div>
      )
    }

    if (this.state.gameState.showResults) {
      return (
        <div className="App">
          <h1>Hearts</h1>
          <h3>Results</h3>
          {this.state.gameState.playerPointsMap.map(item => {
            return (
              <p>{item.playerName} got {item.pointsThisRound} points</p>
            )
          })}
          <button onClick={this.playAgain}>Play Again</button>
        </div>
      )
    }

    return this.state.gameState.active ?
      <div className="App">
        <h1>Hearts</h1>
        <button onClick={this.refreshGameState}>Refresh</button>
        {this.renderPlayerList()}
        {this.state.error && <p>{this.state.error}</p>}
        <h3>Round Stack</h3>
        {this.renderRoundStack()}
        <h3>My Available Cards</h3>
        {this.renderAvailableCards()}
        <h3>My Earned Cards</h3>
        {this.renderEarnedCards()}
      </div> :
      <div className="App">
        <h1>Hearts</h1>
        <button onClick={this.refreshGameState}>Refresh</button>
        {this.renderPlayerList()}
        {this.state.error && <p>{this.state.error}</p>}
        <form onSubmit={this.joinGame}>
          <label>
            Name:
            <input type="text" value={this.state.joinName} onChange={e => { this.setState({ joinName: e.target.value }) }} />
          </label>
          <input type="submit" value="Join" />
        </form>
        <button onClick={this.startGame}>Start Game</button>
      </div>
  }
}

export default App;
