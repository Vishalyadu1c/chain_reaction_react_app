import type { CellData } from "./types";

interface Props {
  cell: CellData;
  row: number;
  col: number;
  onClick: () => void;
}

export default function Cell({ cell, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="
        w-9
        h-8
        rounded
        border
        border-white/20
        bg-slate-900/70
        flex
        items-center
        justify-center
        cursor-pointer
        transition
        hover:bg-white/10
      "
    >
      {cell.count > 0 && (
        <div
          className={`
            w-4.5
            h-4.5
            rounded-full
            flex
            items-center
            justify-center
            text-white
            text-[10px]
            shadow-md
            animate-pulse

            ${
              cell.player === 0
                ? `
                  bg-linear-to-br
                  from-cyan-400
                  to-blue-600
                  shadow-cyan-400/50
                `
                : `
                  bg-linear-to-br
                  from-red-400
                  to-orange-600
                  shadow-red-500/50
                `
            }
          `}
        >
          {cell.count}
        </div>
      )}
    </div>
  );
}
