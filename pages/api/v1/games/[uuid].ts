import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { methodRouter } from '../../../../lib/methodRouter'; // Adjust path accordingly
import { connectToDatabase } from '../../../../lib/db';
import Game from '../../../../models/Game';

// Validation schema for PUT body
const boardSchema = z.array(z.array(z.string()));
const difficultySchema = z.union([z.literal("beginner"), z.literal("easy"), z.literal("medium"), z.literal("hard"), z.literal("extreme")]);

const putBodySchema = z.object({
  name: z.string().min(1, "Name is required"), // A non-empty name is required
  difficulty: difficultySchema, // Validate difficulty
  board: boardSchema, // Validate the board structure
}).strict(); // Ensure all properties are present

// Define the types based on the schemas
type PutBodyType = z.infer<typeof putBodySchema>;

// GET handler
const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase();
  const game = await Game.findOne({ uuid: req.query.uuid });
  if (!game) {
    return res.status(404).json({
      code: 404,
      message: "Resource not found",
    });
  }
  res.status(200).json(game);
};

// PUT handler
const handlePut = async (req: NextApiRequest, res: NextApiResponse, data: PutBodyType) => {
  await connectToDatabase();

  const game = await Game.findOne({ uuid: req.query.uuid });
  if (!game) {
    return res.status(404).json({
      code: 404,
      message: "Resource not found",
    });
  }

  game.name = data.name;
  game.difficulty = data.difficulty;
  game.board = data.board;

  try {
    await game.save();
    res.status(200).json(game);
  } catch (error: any) {
    res.status(422).json({ code: 422, message: error.message } as errorMessage);
  }
};

const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase();
  const game = await Game.findOneAndDelete({ uuid: req.query.uuid });
  if (!game) {
    return res.status(404).json({
      code: 404,
      message: "Resource not found",
    });
  }
  res.status(204).send("OK");
};

// Export the API route
export default methodRouter({
  GET: { handler: handleGet },
  PUT: { handler: handlePut, schema: putBodySchema },
  DELETE: { handler: handleDelete },
});
