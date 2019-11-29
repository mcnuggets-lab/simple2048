import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleUp, faArrowAltCircleDown,
  faArrowAltCircleLeft, faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons';

import './index.css';

class Square extends React.Component {
  constructor(props) {
    super(props);
    this.COLOR_GRADIENT = ["#FFFF00", "#FFE500", "#FFCC00", "#FFB200", "#FF9900",
                            "#FF7F00", "#FF6600", "#FF4C00", "#FF3200", "#FF1900", "#FF0000"];
  }

  render() {
    var cellStyle = {
      backgroundColor: (this.props.value > 0) ? this.COLOR_GRADIENT[Math.log2(this.props.value) - 1] : "#DDDDDD",
      color: (this.props.value > 32) ? "#FFFFFF" : "#000000",
      fontSize: "200%"
    };
    return (
      <span className="square" style={cellStyle}>
        {this.props.value > 0 ? this.props.value : ""}
      </span>
    );
  }
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.renderSquare = this.renderSquare.bind(this);
  }

  renderSquare(i, j) {
    return (
      <Square
        value={this.props.board[i][j]} key={i * this.props.board.length + j}
      />
    );
  }

  render() {
    
    return (
      <div>
        {this.props.board.map((boardRow, i) => {
          return <div className="board-row" key={i}>
           {boardRow.map((square, j) => this.renderSquare(i, j))}
           </div>
        })}
      </div>
    );
  }
}

class EndGameScreen extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  render() {    
    const endGameStyle = { 
      width: this.props.screenLength, 
      height: this.props.screenLength,
    };
    var status;
    if (this.props.endGame === 1) {
      status = 'You win!';
    } else if (this.props.endGame === -1) { 
      status = 'You lose!';
    }

    if (this.props.endGame) {
      return (<div className="game-endgame" style={endGameStyle}>
        {status}
      </div>);
    }
    else return false;
  }

}

class ControlPanel extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    return (<table>
      <thead></thead>
      <tbody>
        <tr>
          <td></td>
          <td>
            <FontAwesomeIcon className="arrow-key" icon={faArrowAltCircleUp} size="7x"
                 onClick={ () => this.props.clickHandler(1) } />
          </td>
          <td></td>
        </tr>
        <tr>
          <td>
            <FontAwesomeIcon className="arrow-key" icon={faArrowAltCircleLeft} size="7x"
                 onClick={ () => this.props.clickHandler(0) } />
          </td>
          <td></td>
          <td>
            <FontAwesomeIcon className="arrow-key" icon={faArrowAltCircleRight} size="7x"
                 onClick={ () => this.props.clickHandler(2) } />
          </td>
        </tr>
        <tr>
          <td></td>
          <td>
            <FontAwesomeIcon className="arrow-key" icon={faArrowAltCircleDown} size="7x"
                 onClick={ () => this.props.clickHandler(3) } />
          </td>
        </tr>
      </tbody>
    </table>);
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.BOARD_SIZE = 4;
    this.keydown = false;
    // this.testBoard = [[1024, 1024, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    this.state = {
      board: generateSquare(new Array(this.BOARD_SIZE).fill(new Array(this.BOARD_SIZE).fill(0))),
      // board: this.testBoard,
      endGame: 0,  // whether the current game is over
      inTransit: false,  // whether the state of display is in the middle of transit
    };

    // bind the event handlers
    this.moveHandler = this.moveHandler.bind(this);
    this.keydownAction = this.keydownAction.bind(this);
    this.keyupAction = this.keyupAction.bind(this);
    this.generateSquareAction = this.generateSquareAction.bind(this);
    this.restart = this.restart.bind(this);
  }

  moveHandler(ind) {
    if (!this.state.endGame && !this.state.inTransit) {
      var [newBoard, hasChanged] = makeMove(this.state.board, ind);
      this.setState({
        board: newBoard,
        inTransit: hasChanged,
      });
    }
  }

  keydownAction(e) {
    if (!this.state.endGame && !this.state.inTransit && !this.keydown) {
      this.keydown = true;
      var keyPressed = e.key;
      var validKeys = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"];
      if (validKeys.includes(keyPressed)) {
        this.moveHandler(validKeys.indexOf(keyPressed));
      }
    }
  }

  keyupAction(e) {
    this.keydown = false;
  }

  generateSquareAction() {
    var newBoard = generateSquare(this.state.board);
    var winner = checkEndGame(newBoard);
    this.setState({
      board: newBoard,
      endGame: winner,
      inTransit: false,
    });
  }

  restart(){
    this.setState({
      board: generateSquare(new Array(this.BOARD_SIZE).fill(new Array(this.BOARD_SIZE).fill(0))),
      endGame: 0,
      inTransit: false,
    });
  }

  componentDidMount() {
    document.addEventListener("keydown", this.keydownAction);
    document.addEventListener("keyup", this.keyupAction);
  }
  
  componentDidUpdate() {
    if (this.state.inTransit) {
      setTimeout(this.generateSquareAction, 350);
    }
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.keydownAction);
    document.removeEventListener("keyup", this.keyupAction);
  }
  
  render() {
    var screenLength = (window.innerWidth <= 768) ? 
                        Math.min(90, 0.2 * window.innerWidth) * this.state.board.length + 4 * this.state.board.length :
                        90 * this.state.board.length + 4 * this.state.board.length;
    return (
        <div className="game">
            <div className="game-info">
                <h1>Simple 2048</h1>
                <div className="game-row">
                    <div className="game-board">
                        <Board board={ this.state.board } />
                    </div>
                    <EndGameScreen endGame={ this.state.endGame } screenLength={ screenLength } />
                    <div className="game-control">
                      <ControlPanel clickHandler={ this.moveHandler } />
                    </div>
                </div>
                <div className="game-reset">
                    <p><button className="reset-button" onClick = { this.restart }>Restart</button></p>
                </div>
            </div>
        </div>
    );
  }
                
}

// ReactDOM.render(
//   <App />,
//   document.getElementById('root')
// );



/* helper functions */

function checkEndGame(board) {
  /**
   * return 1 for a win, -1 for a lose and 0 for not game over
   */
  var n = board.length;
  if (board.flat().includes(2048)) return 1;
  if (board.flat().includes(0)) return 0;
  for (var i=0; i < n - 1; i++) {
    for (var j=0; j < n - 1; j++) {
      if (board[i][j] === board[i][j+1] || board[i][j] === board[i+1][j]) return 0;
    }
    if (board[n-1][i] === board[n-1][i+1] || board[i][n-1] === board[i+1][n-1]) return 0;
  }
  return -1;
}

function unflat(flatBoard) {
  /** 
   * Pass an array of length n^2, pack it into a square board.
   */
  var boardSize = Math.sqrt(flatBoard.length);
  var board = new Array(boardSize).fill(0).map((x, ind) => {
    return flatBoard.slice(ind * boardSize, (ind + 1) * boardSize);
  });
  return board;
}

function generateSquare(board) {
  /** 
   * Generate a new tile of either 2 or 4 on an empty square. 
  * Generate nothing if there are no empty squares.
  */
  var flatBoard = board.flat();
  if (!flatBoard.includes(0)) return unflat(flatBoard);
  var zeroInds = [];
  for (var i = 0; i < flatBoard.length; i++) {
    if (flatBoard[i] === 0) zeroInds.push(i);
  }
  var randInd = zeroInds[Math.floor(Math.random() * zeroInds.length)];
  flatBoard[randInd] = Math.random() > 0.75 ? 4 : 2;
  return unflat(flatBoard);
}

function rotateBoardCcw(board, times) {
  /**
   * Rotate the board counter-clockwise for a given times.
   * Note that it is O(n^2) complexity.
   */
  times %= 4;
  var n = board.length;
  var newBoard = unflat(board.flat());
  while (times > 0) {
    for (var i = 0; i < n / 2; i++) {
      for (var j = i; j < n - i - 1; j++) {
          var tmp = newBoard[i][j];
          newBoard[i][j] = newBoard[j][n-i-1];
          newBoard[j][n-i-1] = newBoard[n-i-1][n-j-1];
          newBoard[n-i-1][n-j-1] = newBoard[n-j-1][i];
          newBoard[n-j-1][i] = tmp;
      }
    }
    times--;
  }
  return newBoard;
}

function makeMoveLeft(board) {
  /**
   * Make the move if left is pressed. Return a new board.
   */
  var n = board.length;
  var newBoard = new Array(n);
  for (var i = 0; i < n; i++) {
    // first kill of all the left zeros
    var boardRow = board[i].filter(x => x > 0);
    while (boardRow.length < n) {
      boardRow.push(0);
    }
    for (var j = 0; j < n-1; j++) {
      if (boardRow[j] === 0) break;
      // merge cells if possible
      if (boardRow[j] === boardRow[j+1]) {
        boardRow[j] = boardRow[j] + boardRow[j+1];
        // shift cells to the left after merging
        if (j !== n-2) {
          for (var k = j+1; k < n-1; k++) {
            boardRow[k] = boardRow[k+1];
          }
        }
        boardRow[n-1] = 0;
      }
    }
    newBoard[i] = boardRow;
  }
  return newBoard;
}

function sameBoard(board1, board2) {
  /**
   * Check if two boards have the same entries.
   * Assume board1 and board2 are squares of the same dimension.
   */
  for (var i = 0; i < board1.length; i++) {
    for (var j = 0; j < board1.length; j++) {
      if (board1[i][j] !== board2[i][j]) {
        return true;
      }
    }
  }
  return false;
}

function makeMove(board, move) {
  /**
   * Make a move. First rotate the board a suitable number of times,
   * so that the move becomes left. Make that move and then rotate back.
   * Also return if the board has changed after move.
   */
  var newBoard = rotateBoardCcw(board, move);
  newBoard = makeMoveLeft(newBoard);
  newBoard = rotateBoardCcw(newBoard, 4 - move);
  var hasChanged = sameBoard(board, newBoard);
  return [newBoard, hasChanged];
}

export default App;
