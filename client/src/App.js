import React from 'react';
import Card from './components/Card';
import { NUM_PLAYERS, cardSortFunction } from './utilities';
import './App.css';

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
        playerPointsMap: {},
        gameStatusText: ''
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
    this.resetGame = this.resetGame.bind(this);
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

    return roundStack.map(item => {
      return (
        <Card
          key={`${item.card.RANK}-${item.card.SUIT}`}
          suit={item.card.SUIT}
          rank={item.card.RANK}
          overlap={roundStack.length > 1}
        />
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

  resetGame = () => {
    fetch(`/api/reset`)
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
    if (this.state.gameState.players.length !== NUM_PLAYERS) {
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

    return this.state.gameState.players.map((player, index) => {
      return (
        <div
          key={player.name}
          className={`PlayerContainer 
              ${Number(this.state.gameState.currentTurnIndex) === Number(index) ? ' PlayerContainerCurrentTurn' : ''}`}>
          <p
            className={`${Number(activePlayerIndex) === Number(index) ? 'Player bold' : 'Player'} 
              ${Number(this.state.gameState.currentTurnIndex) === Number(index) ? ' PlayerCurrentTurn' : ''}`}
          >
            {player.name}
          </p>
        </div>
      )
    })

  }

  renderAvailableCards() {
    const { activePlayerIndex } = this.state;
    const { players, currentTurnIndex } = this.state.gameState;

    const availableCards = players[activePlayerIndex].availableCards;

    return availableCards.sort(cardSortFunction).map(card => {
      return (
        <Card
          key={`${card.RANK}-${card.SUIT}`}
          rank={card.RANK}
          suit={card.SUIT}
          clickAction={() => {
            if (Number(currentTurnIndex) !== Number(activePlayerIndex)) {
              this.setState({ error: 'It is not your turn. ' });
            } else {
              this.playCard(activePlayerIndex, card.RANK, card.SUIT);
            }
          }}
        />
      )
    })
  }

  renderEarnedCards() {
    const { activePlayerIndex } = this.state;
    const { players } = this.state.gameState;

    const earnedCards = players[activePlayerIndex].earnedCards;

    return earnedCards.map(card => {
      return (
        <Card
          key={`${card.RANK}-${card.SUIT}`}
          suit={card.SUIT}
          rank={card.RANK}
        />
      )
    })
  }

  render() {
    console.log('gameStatusText: ', this.state.gameState.gameStatusText);

    // Render screen with prompt for user's name after refresh
    if (this.state.gameState.active && this.state.activePlayerIndex === -1) {
      return (
        <div className="App">
          <h1>Hearts</h1>
          {this.state.error ? <p className="InfoMessageHeight">{this.state.error}</p> : <p className="InfoMessageHeight spacer">spacer</p>}
          <form className="GeneralInputForm" onSubmit={this.submitName}>
            <label>
              What name did you join as?
            </label>
            <input className="GeneralInput" type="text" value={this.state.refreshName} onChange={e => { this.setState({ refreshName: e.target.value }) }} />
            <input className="GeneralButton" type="submit" value="ENTER" />
          </form>
        </div>
      )
    }

    // Render results screen
    if (this.state.gameState.showResults) {
      return (
        <div className="App">
          <h1>Hearts</h1>
          <h3>Results</h3>
          {this.state.gameState.playerPointsMap.map(item => {
            return (
              <p className="ResultsText">{item.playerName} got {item.pointsThisRound} points</p>
            )
          })}
          <div className="GeneralButton RestartButton" onClick={this.resetGame}>RESTART</div>
        </div>
      )
    }

    // Render actual game screen
    if (this.state.gameState.active) {
      return (
        <div className="App">
          <div className="TitleAndRefreshContainer">
            <h1>Hearts</h1>
            <div className="GeneralButton RefreshButton" onClick={this.refreshGameState}>REFRESH</div>
          </div>
          {
            this.state.error ?
              <p className="InfoMessageHeight">{this.state.error}</p> :
              this.state.gameState.gameStatusText ?
                <p className="InfoMessageHeight">{this.state.gameState.gameStatusText}</p> :
                <p className="InfoMessageHeight spacer">spacer</p>
          }
          <h3>Players</h3>
          <div className="PlayerListContainer">
            {this.renderPlayerList()}
          </div>
          <h3>Round Stack</h3>
          <div className="RoundStackContainer">
            {this.renderRoundStack()}
          </div>
          <h3>My Available Cards</h3>
          <div className="AvailableCardsContainer">
            {this.renderAvailableCards()}
          </div>
          <h3>My Earned Cards</h3>
          <div className="EarnedCardsContainer">
            {this.renderEarnedCards()}
          </div>
        </div>
      )
    }

    // Render waiting room
    return (
      <div className="App">
        <div className="TitleAndRefreshContainer">
          <h1>Hearts</h1>
          <div className="GeneralButton RefreshButton" onClick={this.refreshGameState}>REFRESH</div>
        </div>
        {this.state.error ? <p className="InfoMessageHeight">{this.state.error}</p> : <p className="InfoMessageHeight spacer">spacer</p>}
        <h3>Players</h3>
        <div className="PlayerListContainer">
          {this.renderPlayerList()}
        </div>
        <form className="GeneralInputForm" onSubmit={this.joinGame}>
          <label>
            Name:
            <input className="GeneralInput" type="text" value={this.state.joinName} onChange={e => { this.setState({ joinName: e.target.value }) }} />
          </label>
          <input className="GeneralButton" type="submit" value="JOIN" />
        </form>
        <div className="GeneralButton StartGameButton" onClick={this.startGame}>START</div>
      </div>
    )
  }
}

export default App;
