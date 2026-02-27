import { useState } from "react";
import "./App.css";

const TOTAL_ROUNDS = 10;

function calculateScores(choices) {
  const cooperators = choices.filter(c => c === "cooperate").length;
  const defectors = choices.filter(c => c === "defect").length;

  return choices.map(choice => {
    if (cooperators === 4) return 3;
    if (cooperators === 3 && choice === "defect") return 5;
    if (cooperators === 3 && choice === "cooperate") return 0;
    if (cooperators === 2 && choice === "cooperate") return 1;
    if (cooperators === 2 && choice === "defect") return 2;
    if (cooperators === 1 && choice === "cooperate") return -1;
    if (cooperators === 1 && choice === "defect") return 1;
    return 0;
  });
}

export default function App() {
  const [stage, setStage] = useState("setup");
  const [players, setPlayers] = useState(["", "", "", ""]);
  const [scores, setScores] = useState([0, 0, 0, 0]);
  const [choices, setChoices] = useState([]);
  const [round, setRound] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [roundResults, setRoundResults] = useState([]);

  const startGame = () => {
    if (players.some(p => p.trim() === "")) return alert("Enter all names");
    setStage("play");
  };

  const makeChoice = (choice) => {
    const newChoices = [...choices, choice];
    setChoices(newChoices);

    if (newChoices.length === 4) {
      const roundScores = calculateScores(newChoices);
      const newTotals = scores.map((s, i) => s + roundScores[i]);
      setScores(newTotals);
      setRoundResults(roundScores);
      setStage("reveal");
    } else {
      setCurrentPlayer(currentPlayer + 1);
    }
  };

  const nextRound = () => {
    if (round === TOTAL_ROUNDS) {
      setStage("end");
    } else {
      setRound(round + 1);
      setChoices([]);
      setRoundResults([]);
      setCurrentPlayer(0);
      setStage("play");
    }
  };

  const resetGame = () => {
    setStage("setup");
    setScores([0, 0, 0, 0]);
    setChoices([]);
    setRound(1);
    setCurrentPlayer(0);
  };

  if (stage === "setup") {
    return (
      <div className="container">
        <h1>The Social Contract</h1>
        {players.map((p, i) => (
          <input
            key={i}
            placeholder={`Player ${i + 1} name`}
            value={p}
            onChange={e => {
              const copy = [...players];
              copy[i] = e.target.value;
              setPlayers(copy);
            }}
          />
        ))}
        <button onClick={startGame}>Start Game</button>
      </div>
    );
  }

  if (stage === "play") {
    return (
      <div className="container">
        <h2>Round {round} / {TOTAL_ROUNDS}</h2>
        <h3>{players[currentPlayer]}'s turn</h3>
        <button onClick={() => makeChoice("cooperate")}>
          🤝 Cooperate
        </button>
        <button onClick={() => makeChoice("defect")}>
          🗡 Defect
        </button>
      </div>
    );
  }

  if (stage === "reveal") {
    return (
      <div className="container">
        <h2>Round {round} Results</h2>
        {players.map((p, i) => (
          <div key={i}>
            {p}: {choices[i]} → {roundResults[i]} pts (Total: {scores[i]})
          </div>
        ))}
        <button onClick={nextRound}>Next Round</button>
      </div>
    );
  }

  if (stage === "end") {
    const maxScore = Math.max(...scores);
    return (
      <div className="container">
        <h1>Final Results</h1>
        {players.map((p, i) => (
          <div key={i}>
            {p}: {scores[i]} pts
          </div>
        ))}
        <h2>
          Winner: {players[scores.indexOf(maxScore)]}
        </h2>
        <button onClick={resetGame}>Play Again</button>
      </div>
    );
  }
}