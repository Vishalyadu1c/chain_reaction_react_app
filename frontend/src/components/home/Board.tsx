import Cell from "../cell";

import type { CellData } from "../types";

interface Props {
  board: CellData[][];

  onCellClick: (row: number, col: number) => void;
}

export default function Board({
  board,

  onCellClick,
}: Props) {
  return (
    <div
      className="
    p-1
    rounded
    bg-white/10
    backdrop-blur-lg
    border
    border-white/20
    shadow-2xl
    mx-auto
    w-fit
  "
    >
      <div
        className="
      grid
      grid-cols-8
      gap-0.5
      justify-center
    "
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              row={rowIndex}
              col={colIndex}
              onClick={() => onCellClick(rowIndex, colIndex)}
            />
          )),
        )}
      </div>
    </div>
  );
}
