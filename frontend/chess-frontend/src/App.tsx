//import React from "react";
import "./App.css";
import { useState } from "react";
import { ChessBoard } from "@chess/chessBoard";
import type { GameDetail } from "@chess/gameDetail";

export default function App() {
  const [gameDetail, setGameDetail] = useState<GameDetail>({ gameNumber : 0, colour : 'w' });
  const [gameStatus, setGameStatus] = useState('In Progress');

  function newGame(colour : 'w' | 'b' | 'r') {
    if (colour === 'r'){
      colour = Math.random() < 0.5 ? 'w' : 'b';
    }

    setGameDetail(prev => ({ 
      gameNumber: prev.gameNumber + 1,
      colour,
    }));
  }

  return (
    <div className="v-container">
      <h1 className="header" >NiobiumFire Chess</h1>
      <div className="h-container">
        <div></div>
        <div>
          <ChessBoard gameDetail = { gameDetail } setStatus = { setGameStatus }/>
        </div>
        <div className="info-panel">
          <p>New Game</p>
          <div className="new-game-buttons">
            <button onClick={() => newGame('w')}>White</button>
            <button onClick={() => newGame('r')}>Random</button>
            <button onClick={() => newGame('b')}>Black</button>
          </div>
          <hr />
          <p>Status: { gameStatus }</p>
        </div>
      </div>
    </div>
  );
}
