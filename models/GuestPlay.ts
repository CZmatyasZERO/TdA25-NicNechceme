import mongoose from "mongoose"
import { v4 as uuidv4 } from "uuid"
import { isValidBoard, getGameState, createEmptyBoard, checkGameEnd } from "../lib/tictactoe"

const GuestplaySchema = new mongoose.Schema(
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
    lastMoveX: {
      type: Number,
      required: true,
      default: 0,
    },
    lastMoveY: {
      type: Number,
      required: true,
      default: 0,
    },
    creatorStarts: {
      type: Boolean,
      default: randomBoolean,
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
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
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
      finished: {
        get() {
          return checkGameEnd(this.board as unknown as Board).finished
        },
      },
    },
  },
)

function randomBoolean() {
  return Math.random() >= 0.5
}

// Create the model
const GuestPlay = mongoose.models.GuestPlay || mongoose.model("GuestPlay", GuestplaySchema)

export default GuestPlay
