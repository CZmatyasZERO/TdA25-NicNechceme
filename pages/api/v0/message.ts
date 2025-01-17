import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { methodRouter } from '../../../lib/methodRouter';

// Validation schema for POST body
const messageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
}).strict();

// Define the types based on the schema
type MessageType = z.infer<typeof messageSchema>;

// POST handler for sending messages
const handlePost = async (req: NextApiRequest, res: NextApiResponse, data: MessageType) => {
  console.log("Received message: ", data);
  res.status(200).json({ message: "Message received successfully" });
};

// Export the API route
export default methodRouter({
  POST: { handler: handlePost, schema: messageSchema },
});