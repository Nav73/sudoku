import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [puzzle, setPuzzle] = useState([]);
  const [solution, setSolution] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [showSolution, setShowSolution] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gameStatus, setGameStatus] = useState('');
  const [difficulty, setDifficulty] = useState(40);

  const fetchNewGame = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/new-game?difficulty=${difficulty}`);
      const data = await response.json();
      
      setPuzzle(data.puzzle);
      setSolution(data.solution);
      setUserInput(data.puzzle.map(row => [...row]));
      setShowSolution(false);
      setGameStatus('');
    } catch (error) {
      console.error('Error fetching new game:', error);
      setGameStatus('Error loading game');
    }
    setIsLoading(false);
  };

  const validateSolution = async (board) => {
    try {
      const response = await fetch(`${API_BASE}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ board }),
      });
      const data = await response.json();
      
      if (data.valid) {
        setGameStatus('🎉 Congratulations! You solved it correctly!');
      } else {
        setGameStatus('❌ Not quite right. Keep trying!');
      }
    } catch (error) {
      console.error('Error validating solution:', error);
    }
  };

  const handleCellChange = (row, col, value) => {
    if (puzzle[row][col] !== 0) return;
    
    const newInput = [...userInput];
    const numValue = value === '' ? 0 : parseInt(value);
    
    if (numValue >= 0 && numValue <= 9) {
      newInput[row][col] = numValue;
      setUserInput(newInput);
      
      // Check if puzzle is complete
      const isFilled = newInput.every(row => row.every(cell => cell !== 0));
      if (isFilled) {
        validateSolution(newInput);
      } else {
        setGameStatus('');
      }
    }
  };

  const showSolutionToggle = () => {
    setShowSolution(!showSolution);
    setGameStatus('');
  };

  const resetGame = () => {
    setUserInput(puzzle.map(row => [...row]));
    setGameStatus('');
    setShowSolution(false);
  };

  useEffect(() => {
    fetchNewGame();
  }, []);

  const getCellClassName = (row, col) => {
    let className = "cell ";
    
    if (puzzle[row] && puzzle[row][col] !== 0) {
      className += "prefilled ";
    }
    
    // Add borders for 3x3 sections
    if (row % 3 === 0) className += "border-top ";
    if (col % 3 === 0) className += "border-left ";
    if (row === 8) className += "border-bottom ";
    if (col === 8) className += "border-right ";
    
    return className;
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Sudoku Solver</h1>
        
        <div className="controls">
          <div className="difficulty-selector">
            <label>Difficulty: </label>
            <select 
              value={difficulty} 
              onChange={(e) => setDifficulty(parseInt(e.target.value))}
            >
              <option value={30}>Easy</option>
              <option value={40}>Medium</option>
              <option value={50}>Hard</option>
            </select>
          </div>
          
          <div className="buttons">
            <button onClick={fetchNewGame} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'New Game'}
            </button>
            <button onClick={showSolutionToggle}>
              {showSolution ? 'Hide Solution' : 'Show Solution'}
            </button>
            <button onClick={resetGame}>Reset</button>
          </div>
        </div>

        {gameStatus && (
          <div className={`status ${gameStatus.includes('🎉') ? 'success' : 'error'}`}>
            {gameStatus}
          </div>
        )}

        <div className="sudoku-grid">
          {userInput.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <input
                key={`${rowIndex}-${colIndex}`}
                type="text"
                maxLength="1"
                value={showSolution ? solution[rowIndex]?.[colIndex] || '' : (cell === 0 ? '' : cell)}
                onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                className={getCellClassName(rowIndex, colIndex)}
                disabled={puzzle[rowIndex]?.[colIndex] !== 0 || showSolution}
              />
            ))
          )}
        </div>

        <div className="instructions">
          <p>Fill in the empty cells with numbers 1-9.</p>
          <p>Each row, column, and 3×3 box must contain all numbers from 1 to 9.</p>
        </div>
      </div>
    </div>
  );
}

export default App;