interface PopUpProps {
  winner: number | null;
  restart(): void;
}

export default function WinnerPopUp({ winner, restart }: PopUpProps) {
  return (
    <div
      className="
    fixed
    inset-0
    flex
    items-center
    justify-center
    bg-black/50
    backdrop-blur-sm
    z-50
  "
    >
      <div
        className="
      w-full
      max-w-sm
      p-8
      bg-white/10
      backdrop-blur-xl
      rounded-3xl
      border
      border-white/20
      shadow-2xl
      text-center
    "
      >
        <div className="text-6xl mb-4">🏆</div>

        <h2
          className="
        text-3xl
        font-bold
        text-white
        mb-6
      "
        >
          Player {winner} Wins 🎉
        </h2>

        <button
          onClick={restart}
          className="
        w-full
        py-3
        rounded-xl
        bg-linear-to-r
        from-cyan-400
        to-blue-600
        text-white
        font-bold
        text-lg
        shadow-lg
        hover:scale-105
        hover:shadow-cyan-400/50
        transition
      "
        >
          🔄 Restart Game
        </button>
      </div>
    </div>
  );
}
