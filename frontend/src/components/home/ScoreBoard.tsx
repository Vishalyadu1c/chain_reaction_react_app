interface ScoreProps {
  room: string;
  player: number|null;
  turn: number;
}

export default function ScoreBoard({ room, player, turn }: ScoreProps) {
  return (
    <div
      className="
    mb-6
    w-full
    max-w-md
    p-5
    bg-white/10
    backdrop-blur-lg
    rounded-2xl
    border
    border-white/20
    shadow-xl
    text-white
  "
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">🏠 Room</h3>

        <span
          className="
      px-3
      py-1
      rounded-lg
      bg-purple-500/30
      border
      border-purple-400/30
      font-bold
    "
        >
          {room}
        </span>
      </div>

      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">👤 Player</h3>

        <span
          className={`
        px-3
        py-1
        rounded-lg
        font-bold

        ${
          player === 0
            ? "bg-cyan-500/30 text-cyan-300"
            : "bg-pink-500/30 text-pink-300"
        }
      `}
        >
          Player {player}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">⚡ Turn</h3>

        <span
          className={`
        px-4
        py-1
        rounded-full
        font-bold

        ${
          turn === player
            ? "bg-green-500/30 text-green-300"
            : "bg-red-500/30 text-red-300"
        }
      `}
        >
          {turn === player ? "Your Turn" : "Opponent Turn"}
        </span>
      </div>
    </div>
  );
}
