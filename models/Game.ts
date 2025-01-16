import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Board, isValidBoard, getGameState } from '../lib/tictactoe'; // Adjust the import path if necessary

const GameSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: uuidv4,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    name: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "easy", "medium", "hard", "extreme"],
      required: true,
    },
    board: {
      type: [[String]],
      required: true,
      validate: {
        validator: function (value: string[][]) {
          const { valid, message } = isValidBoard(value as Board);
          if(!valid) {
            throw new Error(message);
          }
          return true;
        },
      },
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
        delete ret.id;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
        delete ret.id;
      },
    },
    virtuals: {
      gameState: {
        get() {
          return getGameState(this.board as unknown as Board);
        },
      }
    }
  }
);


// Middleware to update `updatedAt` on save
GameSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Create the model
const Game = mongoose.models.Game || mongoose.model('Game', GameSchema);

export default Game;
