import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { methodRouter } from "../../../../lib/methodRouter"
import { connectToDatabase } from "../../../../lib/db"
import User from "../../../../models/User"
import type { IronSession } from "iron-session"

// Validation schema for POST body
const postBodySchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password should be at least 6 characters"),
  })
  .strict()

// Define the types based on the schemas
type PostBodyType = z.infer<typeof postBodySchema>

// POST handler
const handlePost = async (req: NextApiRequest, res: NextApiResponse, data: PostBodyType, session: IronSession<SessionData>) => {
  await connectToDatabase()
  const user = new User({ ...data, elo: 400 })

  try {
    await user.save()

    session.uuid = user.uuid
    session.loggedIn = true
    await session.save()

    res.status(201).json(user)
  } catch (error: any) {
    res.status(422).json({ code: 422, message: error.message })
  }
}

// Export the API route
export default methodRouter({
  POST: { handler: handlePost, schema: postBodySchema },
})
