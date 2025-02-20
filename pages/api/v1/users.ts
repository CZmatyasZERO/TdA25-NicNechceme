import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { methodRouter } from "../../../lib/methodRouter"
import { connectToDatabase } from "../../../lib/db"
import User from "../../../models/User"

// Validation schema for POST body
const postBodySchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password should be at least 6 characters"),
    elo: z.number().int("Elo must be an integer"),
  })
  .strict()

// Define the types based on the schemas
type PostBodyType = z.infer<typeof postBodySchema>

// GET handler
const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase()
  const users = await User.find({})
  res.status(200).json(users)
}

// POST handler
const handlePost = async (req: NextApiRequest, res: NextApiResponse, data: PostBodyType) => {
  await connectToDatabase()
  const user = new User(data)

  try {
    await user.save()
    res.status(201).json(user)
  } catch (error: any) {
    res.status(422).json({ code: 422, message: error.message })
  }
}

// Export the API route
export default methodRouter({
  GET: { handler: handleGet },
  POST: { handler: handlePost, schema: postBodySchema },
})
