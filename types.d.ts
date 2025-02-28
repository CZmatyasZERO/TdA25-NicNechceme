interface errorMessage {
  code: integer
  message: string
}

type Player = "X" | "O"
type Cell = "X" | "O" | ""
type Board = Cell[][]
type GameStates = "opening" | "midgame" | "endgame"
type Move = { x: number; y: number } //x is row, y is collumn

interface SessionData {
  uuid: string
  loggedIn: boolean
}
