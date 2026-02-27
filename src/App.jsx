import { useState } from "react";
import "./App.css";

const scenarioTemplates = [
  { 
    baseText: "has a ball.", 
    mainActorChoices: [
      { text: "Invite others to play", type: "nice" },
      { text: "Play alone", type: "selfish" }
    ],
    responderChoices: [
      { text: "Join and play", type: "nice" },
      { text: "Refuse / complain", type: "selfish" }
    ]
  },
  { 
    baseText: "found a puzzle piece.", 
    mainActorChoices: [
      { text: "Ask others to help complete it", type: "nice" },
      { text: "Do it alone", type: "selfish" }
    ],
    responderChoices: [
      { text: "Help complete the puzzle", type: "nice" },
      { text: "Ignore / complain", type: "selfish" }
    ]
  },
  // Add more scenarios as needed
];

function App() {
  const [playerNames, setPlayerNames] = useState(["", "", "", ""]);
  const [points, setPoints] = useState([0,0,0,0]);
  const [coopHistory, setCoopHistory] = useState([0,0,0,0]);
  const [gameStarted, setGameStarted] = useState(false);
  const [round, setRound] = useState(1);
  const totalRounds = 10;

  const [mainActorIndex, setMainActorIndex] = useState(0);
  const [currentResponderIndex, setCurrentResponderIndex] = useState(null);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [mainActorChoice, setMainActorChoice] = useState(null);
  const [roundChoices, setRoundChoices] = useState([]);
  const [roundSummary, setRoundSummary] = useState([]);

  const handleNameChange = (index, value) => {
    const names = [...playerNames];
    names[index] = value;
    setPlayerNames(names);
  };

  const startGame = () => {
    if(playerNames.some(n=>n==="")){
      alert("Please fill in all player names!");
      return;
    }
    setGameStarted(true);
    setRound(1);
    setPoints([0,0,0,0]);
    setCoopHistory([0,0,0,0]);
    setRoundChoices([]);
    setRoundSummary([]);
    setMainActorChoice(null);
    setCurrentResponderIndex(null);
    setScenarioIndex(0);
    setMainActorIndex(Math.floor(Math.random()*4));
  };

  // Main actor chooses
  const handleMainActorChoice = (choice) => {
    setMainActorChoice(choice);
    const firstResponder = playerNames.findIndex((_,i)=>i!==mainActorIndex);
    setCurrentResponderIndex(firstResponder);
    setRoundChoices(Array(4).fill(null));
    setRoundChoices(prev=>{prev[mainActorIndex]=choice; return prev;});
  };

  // Responder chooses
  const handleResponderChoice = (choice) => {
    const choices = [...roundChoices];
    choices[currentResponderIndex] = choice;
    setRoundChoices(choices);

    // Next responder
    let nextResponder = currentResponderIndex + 1;
    while(nextResponder<4 && nextResponder===mainActorIndex) nextResponder++;
    if(nextResponder>=4){
      // all chose → calculate points
      calculatePoints(choices);
    } else {
      setCurrentResponderIndex(nextResponder);
    }
  };

  // Complex point calculation with gang-up mechanics
  const calculatePoints = (choices) => {
    const newPoints = [...points];
    const newCoop = [...coopHistory];
    const summary = [];

    const mainChoice = choices[mainActorIndex];
    const responders = choices.map((c,i)=>i!==mainActorIndex ? i : null).filter(i=>i!==null);

    responders.forEach(i=>{
      let pts = 0;
      const choice = choices[i];

      if(mainChoice.type==="nice"){
        if(choice.type==="nice"){
          pts = 2; // standard cooperation
          newCoop[i]+=1;
        } else {
          pts = 1; // selfish against nice main actor
        }
      } else { // main actor selfish
        if(choice.type==="nice"){
          // Gang-up nice on selfish main actor → very rewarding
          pts = 3; 
          newCoop[i]+=1;
        } else {
          // Selfish responders trying to rebel with main actor selfish → small reward
          pts = 2; 
        }
      }
      newPoints[i] += pts;
      summary.push(`${playerNames[i]} chose: ${choice.text} (+${pts} pts)`);
    });

    // Main actor points
    let mainPts = 0;
    if(mainChoice.type==="nice"){
      mainPts = 2; // base
      // Bonus for each responder who cooperated
      const respondersNice = responders.filter(i=>choices[i].type==="nice").length;
      mainPts += respondersNice;
    } else {
      mainPts = 3; // selfish base
      // Penalized if responders gang up nicely
      const respondersNice = responders.filter(i=>choices[i].type==="nice").length;
      mainPts -= respondersNice; // can reduce main actor points
      if(mainPts<0) mainPts = 0;
    }
    newPoints[mainActorIndex] += mainPts;
    if(mainChoice.type==="nice") newCoop[mainActorIndex]+=1;

    summary.push(`${playerNames[mainActorIndex]} chose: ${mainChoice.text} (+${mainPts} pts)`);

    setPoints(newPoints);
    setCoopHistory(newCoop);
    setRoundSummary(summary);
    setCurrentResponderIndex(null);
  };

  const nextRound = () => {
    setRound(round+1);
    setRoundSummary([]);
    setRoundChoices([]);
    setMainActorChoice(null);
    setScenarioIndex((scenarioIndex+1)%scenarioTemplates.length);

    // Choose main actor: low-score player first
    const minPoints = Math.min(...points);
    const candidates = [];
    points.forEach((p,i)=>{if(p===minPoints) candidates.push(i)});
    setMainActorIndex(candidates[Math.floor(Math.random()*candidates.length)]);

    setCurrentResponderIndex(null);
  };

  const currentScenario = scenarioTemplates[scenarioIndex];
  const isGameOver = round>totalRounds;

  return (
    <div className="App">
      <h1>The Social Contract</h1>
      {!gameStarted ? (
        <div>
          {playerNames.map((n,i)=>(
            <input key={i} placeholder={`Player ${i+1}`} value={n} onChange={e=>handleNameChange(i,e.target.value)} />
          ))}
          <button onClick={startGame}>Start Game</button>
        </div>
      ) : isGameOver ? (
        <div>
          <h2>Game Over!</h2>
          <ul>
            {playerNames.map((n,i)=><li key={i}>{n}: {points[i]}</li>)}
          </ul>
          <h3>Winner: {playerNames[points.indexOf(Math.max(...points))]}</h3>
        </div>
      ) : roundSummary.length>0 && currentResponderIndex===null ? (
        <div>
          <h2>Round {round} Summary</h2>
          <ul>
            {roundSummary.map((msg,i)=><li key={i}>{msg}</li>)}
          </ul>
          <h3>Cumulative Points:</h3>
          <ul>
            {playerNames.map((n,i)=><li key={i}>{n}: {points[i]}</li>)}
          </ul>
          <button onClick={nextRound}>Next Round</button>
        </div>
      ) : currentResponderIndex===null ? (
        <div>
          <h2>Round {round}/{totalRounds}</h2>
          <h3>Main Player: {playerNames[mainActorIndex]}</h3>
          <p>{playerNames[mainActorIndex]} {currentScenario.baseText}</p>
          {currentScenario.mainActorChoices.map((c,i)=>(
            <button key={i} onClick={()=>handleMainActorChoice(c)}>{c.text}</button>
          ))}
          <h4>Cumulative Points:</h4>
          <ul>
            {playerNames.map((n,i)=><li key={i}>{n}: {points[i]}</li>)}
          </ul>
        </div>
      ) : (
        <div>
          <h2>Round {round}/{totalRounds}</h2>
          <h3>Current Player: {playerNames[currentResponderIndex]}</h3>
          <p>{playerNames[mainActorIndex]} {currentScenario.baseText}</p>
          {currentScenario.responderChoices.map((c,i)=>(
            <button key={i} onClick={()=>handleResponderChoice(c)}>{c.text}</button>
          ))}
          <h4>Cumulative Points:</h4>
          <ul>
            {playerNames.map((n,i)=><li key={i}>{n}: {points[i]}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
