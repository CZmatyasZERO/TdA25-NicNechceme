import React from "react"
import classes from "./board.module.css"
import TdAIcon from "./TdAIcon"

const TicTacToeBoard = (params: {
  board: Board
  onClick?: (x: number, y: number) => void
  gap?: number
  interative?: boolean
  lines?: boolean
  fullWidth?: boolean
  emphasize?: Move
  style?: React.CSSProperties
}) => {
  let gap: number | string = "1%"
  if (params.lines) {
    gap = "0"
  } else {
    gap = params.gap ? params.gap : "1%"
  }
  return (
    <div className={classes.board} style={{ ...params.style, gap, width: params.fullWidth ? "100%" : undefined }}>
      {params.board.map((row, i) => (
        <div key={i} style={{ gap }} className={classes.row}>
          {row.map((cell, j) => (
            <div
              key={j}
              className={classes.cell}
              onClick={() => cell === "" && params.onClick && params.interative && params.onClick(i, j)}
              style={params.lines ? { border: "1px solid black" } : {}}
            >
              {cell === "X" ? (
                <TdAIcon size={22} color="blue" type="X" width="100%" height="100%" />
              ) : cell === "O" ? (
                <TdAIcon size={22} color="red" type="O" />
              ) : (
                <div className={params.interative ? classes.empty : ""}></div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default TicTacToeBoard
