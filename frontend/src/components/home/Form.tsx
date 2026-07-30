interface FormProps {
  inputRoom: string;

  setInputRoom: (value: string) => void;

  createRoom: () => void;

  joinRoom: () => void;
}

export default function Form({
  inputRoom,
  setInputRoom,
  createRoom,
  joinRoom,
}: FormProps) {
  return (
      <div className="w-ful max-w-md bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20" style={{padding:"10px"}}>
        <h1 className="text-4xl font-bold text-center text-white mb-2">
          ⚡ Chain Reaction
        </h1>

        <p className="text-center text-gray-300 mb-8">
          Create a room or join your friend's game
        </p>

        <div className="space-y-5">
          <input
            value={inputRoom}
            onChange={(e) => setInputRoom(e.target.value)}
            placeholder="Enter Room Code"
            className="
          w-full
          px-5
          py-3
          rounded-xl
          bg-white/20
          text-white
          placeholder-gray-300
          outline-none
          border
          border-white/30
          focus:border-purple-400
          focus:ring-2
          focus:ring-purple-400
          transition
        "
          />

          <button
            onClick={createRoom}
            className="
            cursor-pointer
          w-full
          py-3
          rounded-xl
          bg-linear-to-r
          from-cyan-400
          to-blue-500
          text-white
          font-semibold
          text-lg
          shadow-lg
          hover:scale-105
          hover:shadow-cyan-500/50
          transition
        "
          >
            🚀 Create Room
          </button>

          <button
            onClick={joinRoom}
            className="
            cursor-pointer
          w-full
          py-3
          rounded-xl
          bg-linear-to-r
          from-pink-500
          to-purple-600
          text-white
          font-semibold
          text-lg
          shadow-lg
          hover:scale-105
          hover:shadow-purple-500/50
          transition
        "
          >
            🎮 Join Room
          </button>
        </div>
      </div>
  );
}
