//import React from "react";
import "./App.css";
import { useState } from "react";
import { ChessBoard } from "@chess/chessBoard";
import type { GameDetail } from "@chess/gameDetail";

export default function App() {
  const [gameDetail, setGameDetail] = useState<GameDetail>({ gameNumber : 0, colour : 'w', skillLevel: 4 });
  const [gameStatus, setGameStatus] = useState('In Progress');

  function newGame(newColour: 'w' | 'b') {
    updateGame({ colour: newColour, gameNumber: gameDetail.gameNumber + 1 });
  }

  function updateGame(detail: Partial<GameDetail>) {
    setGameDetail(prev => ({
      ...prev,
      ...detail
    }));
  }

  return (
    <div className="v-container">
      <h1 className="header" >NiobiumFire Chess</h1>
      <div className="h-container">
        <div></div>
        <div className="chessboard-style">
          <ChessBoard gameDetail = { gameDetail } setStatus = { setGameStatus }/>
        </div>
        <div className="info-panel">
          <p>Status: { gameStatus }</p>
          <hr />
          <p>New Game</p>
          <div className="new-game-buttons">
            <button type='button' onClick={() => newGame('w')}>White</button>
            <button type='button' onClick={() => newGame(Math.random() < 0.5 ? 'w' : 'b')}>Random</button>
            <button type='button' onClick={() => newGame('b')}>Black</button>
          </div>
          <hr />
          <p>AI Skill: {gameDetail.skillLevel}</p>
          <input className="skill-slider" type="range" id="skill" name="skill" min="-1" max="20" value={gameDetail.skillLevel} onChange={(e) => updateGame({ skillLevel: Number(e.target.value) })} />
        </div>
      </div>
    </div>
  );
}
