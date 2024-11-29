import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const GameSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: uuidv4, // Generate UUID for uuid field
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
      type: [[String]], // A 2D array of strings
      required: true,
      validate: {
        validator: function (value: String[][]) {
          return (
            Array.isArray(value) &&
            value.length === 15 && // Ensure 15 rows
            value.every((row) => Array.isArray(row) && row.length === 15) // Ensure 15 columns per row
          );
        },
        message: 'Board must be a 15x15 grid of strings.',
      },
    },
  },
  {
    toJSON: {
      virtuals: true, // Include virtuals
      transform: function (doc, ret) {
        delete ret._id; // Remove _id from the response
        delete ret.__v; // Remove __v from the response
        delete ret.id
      },
    },
    toObject: {
      virtuals: true, // Include virtuals
      transform: function (doc, ret) {
        delete ret._id; // Remove _id from the response
        delete ret.__v; // Remove __v from the response
        delete ret.id
      },
    },
  }
);

// Virtual property for computed `gameState`
GameSchema.virtual('gameState').get(function () {
  return "unknown";
});

// Middleware to update `updatedAt` on save
GameSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});


// Create the model
const Game = mongoose.models.Game || mongoose.model('Game', GameSchema);

export default Game;
