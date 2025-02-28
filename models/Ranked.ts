import mongoose from "mongoose"
import { v4 as uuidv4 } from "uuid"
import { isValidBoard, getGameState, createEmptyBoard, checkGameEnd, getOnTurn } from "../lib/tictactoe"

const RankedSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: uuidv4,
    },
    creatorSessionId: {
      type: String,
      required: true,
    },
    opponentSessionId: {
      type: String,
      required: false,
    },
    creatorELO: {
      type: Number,
      required: true,
      default: 0,
    },
    creatorWins: {
      type: Number,
      required: true,
      default: 0,
    },
    creatorLosses: {
      type: Number,
      required: true,
      default: 0,
    },
    creatorDraws: {
      type: Number,
      required: true,
      default: 0,
    },
    opponentELO: {
      type: Number,
      required: true,
      default: 0,
    },
    opponentWins: {
      type: Number,
      required: true,
      default: 0,
    },
    opponentLosses: {
      type: Number,
      required: true,
      default: 0,
    },
    opponentDraws: {
      type: Number,
      required: true,
      default: 0,
    },
    lastMoveX: {
      type: Number,
      required: true,
      default: -1,
    },
    lastMoveY: {
      type: Number,
      required: true,
      default: -1,
    },
    startedAt: {
      type: Date,
    },
    creatorStarts: {
      type: Boolean,
      default: randomBoolean,
    },
    creatorPoints: {
      type: Number,
      required: true,
      default: 60 * 8,
    },
    lastMoveAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    opponentPoints: {
      type: Number,
      required: true,
      default: 60 * 8,
    },
    revenged: {
      type: Boolean,
      required: true,
      default: false,
    },
    board: {
      type: [[String]],
      required: true,
      validate: {
        validator: function (value: string[][]) {
          const { valid, message } = isValidBoard(value as Board)
          if (!valid) {
            throw new Error(message)
          }
          return true
        },
      },
      default: createEmptyBoard,
    },
    finished: {
      type: Boolean,
      required: true,
      default: false,
    },
    creatorRevenge: {
      type: Boolean,
      required: true,
      default: false,
    },
    opponentRevenge: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, ret: any) {
        delete ret._id
        delete ret.__v
        delete ret.id
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id
        delete ret.__v
        delete ret.id
      },
    },
    virtuals: {
      winner: {
        get() {
          let winner = checkGameEnd(this.board as unknown as Board).winner
          if (winner) {
            return this.creatorStarts ? (winner === "X" ? "creator" : "opponent") : winner === "X" ? "opponent" : "creator"
          }

          if (this.creatorPoints === 0) {
            return "opponent"
          } else if (this.opponentPoints === 0) {
            return "creator"
          }
          return null
        },
      },
      creatorTimeLeft: {
        get() {
          if (this.finished) {
            return this.creatorPoints
          }
          if (!this.startedAt) {
            return 8 * 60
          }
          // Checking if the creator is on move
          if (getOnTurn(this.board as unknown as Board) === "X" ? (this.creatorStarts ? true : false) : this.creatorStarts ? false : true) {
            const timeDifferenceInSeconds = (Date.now() - this.lastMoveAt.getTime()) / 1000
            return Math.floor(Math.max(0, this.creatorPoints - timeDifferenceInSeconds))
          }
          return this.creatorPoints
        },
      },
      opponentTimeLeft: {
        get() {
          if (this.finished) {
            return this.opponentPoints
          }
          if (!this.startedAt) {
            return 8 * 60
          }
          // Checking if the opponent is on move
          if (getOnTurn(this.board as unknown as Board) === "O" ? (this.creatorStarts ? true : false) : this.creatorStarts ? false : true) {
            const timeDifferenceInSeconds = (Date.now() - this.lastMoveAt.getTime()) / 1000
            return Math.floor(Math.max(0, this.opponentPoints - timeDifferenceInSeconds))
          }
          return this.opponentPoints
        },
      },
    },
  },
)

function randomBoolean() {
  return Math.random() >= 0.5
}

function generateRandomCode() {
  return Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000
}

// Create the model
const Ranked = mongoose.models.Ranked || mongoose.model("Ranked", RankedSchema)

export default Ranked
