import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { methodRouter } from '../../../lib/methodRouter'; // Adjust path accordingly
import { connectToDatabase } from '../../../lib/db';
import Game from '../../../models/Game';


// Validation schema for POST body

const boardSchema = z.array(z.array(z.string()))

const difficultySchema = z.union([z.literal("beginner"), z.literal("easy"), z.literal("medium"), z.literal("hard"), z.literal("extreme")]);

const postBodySchema = z.object({
  name: z.string().min(1, "Name is required"), // A non-empty name is required
  difficulty: difficultySchema, // Validate difficulty
  board: boardSchema, // Validate the board structure
}).strict(); // Ensure all properties are present

// Example usage:

// Define the types based on the schemas
type PostBodyType = z.infer<typeof postBodySchema>;

// GET handler
const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase();
  const games = await Game.find({});
  res.status(200).json(games);
};

// POST handler
const handlePost = async (req: NextApiRequest, res: NextApiResponse, data: PostBodyType) => {
  const { board } = data;

  // Check if the board is 15x15
  const isValidBoard = board.length === 15 && board.every((row) => row.length === 15);
  if (!isValidBoard) {
    return res.status(422).json({
      code: 422,
      message: "Semantic error: Invalid board dimensions. The board must be a 15x15 grid.",
    } as errorMessage);
  }

  // Check if all cells are valid values
  const isValidValues = board.every((row) => row.every((cell) => ["", "X", "O"].includes(cell)));
  if (!isValidValues) {
    return res.status(422).json({
      code: 422,
      message: "Semantic error: Board can only contain 'X', 'O', or ''.",
    } as errorMessage);
  }
  await connectToDatabase();
  const game = new Game(data);
  await game.save();
  res.status(200).json(game);
};



// Export the API route
export default methodRouter({
  GET: { handler: handleGet },
  POST: { handler: handlePost, schema: postBodySchema },
});
