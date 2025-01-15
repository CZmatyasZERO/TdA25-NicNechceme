import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { methodRouter } from '../../../lib/methodRouter'; 
import { connectToDatabase } from '../../../lib/db';
import Game from '../../../models/Game';

// Validation schema for POST body
const boardSchema = z.array(z.array(z.string()));
const difficultySchema = z.union([z.literal("beginner"), z.literal("easy"), z.literal("medium"), z.literal("hard"), z.literal("extreme")]);
const postBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  difficulty: difficultySchema, 
  board: boardSchema,
}).strict();

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
  await connectToDatabase();
  const game = new Game(data);

  try {
    await game.save();
    
    res.status(201).json(game);
  } catch (error: any) {
    res.status(422).json({ code: 422, message: error.message } as errorMessage);
  }
};

// Export the API route
export default methodRouter({
  GET: { handler: handleGet },
  POST: { handler: handlePost, schema: postBodySchema },
});
