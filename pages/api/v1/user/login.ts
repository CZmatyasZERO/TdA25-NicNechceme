import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { methodRouter } from "../../../../lib/methodRouter"
import { connectToDatabase } from "../../../../lib/db"
import type { IronSession } from "iron-session"
import User from "../../../../models/User"

// Validation schema for POST body
const postBodySchema = z
  .object({
    login: z.string(),
    password: z.string(),
  })
  .strict()

// Define the types based on the schemas
type PostBodyType = z.infer<typeof postBodySchema>

// POST handler
const handlePost = async (req: NextApiRequest, res: NextApiResponse, data: PostBodyType, session: IronSession<SessionData>) => {
  await connectToDatabase()
  const user = await User.findOne({
    $or: [{ username: data.login }, { email: data.login }],
  })

  if (!user) {
    return res.status(401).json({ code: 401, message: "Invalid login" })
  }
  let compare = await user.comparePassword(data.password)
  if (!compare) {
    return res.status(401).json({ code: 401, message: "Invalid login" })
  }

  session.uuid = user.uuid
  session.loggedIn = true
  await session.save()

  res.status(201).json({ code: 201, message: "Login successful" })
}

// Export the API route
export default methodRouter({
  POST: { handler: handlePost, schema: postBodySchema },
})
