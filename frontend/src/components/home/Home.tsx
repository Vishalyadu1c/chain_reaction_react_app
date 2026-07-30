import { useEffect, useState } from "react";

import socket from "../socket";

import Board from "./Board";

import type { CellData } from "../types";
import Form from "./Form";
import ScoreBoard from "./ScoreBoard";
import WinnerPopUp from "./WinnerPopUp";

const ROWS = 17;
const COLS = 8;

function emptyBoard(): CellData[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      count: 0,
      player: null,
    })),
  );
}

export default function Home() {
  const [room, setRoom] = useState("");

  const [inputRoom, setInputRoom] = useState("");

  const [player, setPlayer] = useState<number | null>(null);

  const [board, setBoard] = useState<CellData[][]>(emptyBoard());

  const [turn, setTurn] = useState<number>(0);

  const [winner, setWinner] = useState<number | null>(null);

  useEffect(() => {
    socket.on("playerAssigned", (p: number) => {
      console.log("Player:", p);

      setPlayer(p);
    });

    socket.on("boardUpdate", (data) => {
      setBoard(data);
    });

    socket.on("turnChange", (t: number) => {
      setTurn(t);
    });

    socket.on("gameOver", (w: number) => {
      setWinner(w);
    });

    socket.on("gameStarted", () => {
      console.log("Game Started");
    });

    return () => {
      socket.off("playerAssigned");

      socket.off("boardUpdate");

      socket.off("turnChange");

      socket.off("gameOver");
    };
  }, []);

  function createRoom() {
    const code = inputRoom.trim().toUpperCase();

    if (!code) return;

    setRoom(code);

    socket.emit("createRoom", code);
  }

  function joinRoom() {
    const code = inputRoom.trim().toUpperCase();

    if (!code) return;

    setRoom(code);

    socket.emit("joinRoom", code);
  }

  function clickCell(row: number, col: number) {
    if (player === null) return;

    if (winner !== null) return;

    socket.emit("playerMove", {
      row,

      col,

      player,
    });
  }

  function restart() {
    socket.emit("restartGame");

    setWinner(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      {!room && (
        <Form
          inputRoom={inputRoom}
          setInputRoom={setInputRoom}
          createRoom={createRoom}
          joinRoom={joinRoom}
        />
      )}

      {room && (
    <div className="min-h-screen w-6xl md:flex  items-center justify-center ">
          <ScoreBoard room={room} player={player} turn={turn} />
          <Board board={board} onCellClick={clickCell} />
        </div>
      )}

      {winner !== null && <WinnerPopUp winner={winner} restart={restart} />}
    </div>
  );
}
