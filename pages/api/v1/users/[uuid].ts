import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { methodRouter } from "../../../../lib/methodRouter" // Adjust path accordingly
import { connectToDatabase } from "../../../../lib/db"
import User from "../../../../models/User"

// Validation schema for PUT body
const putBodySchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    elo: z.number().int("Elo must be an integer"),
    password: z.string().min(1, "Password is required"),
  })
  .strict()

// Define the types based on the schemas
type PutBodyType = z.infer<typeof putBodySchema>

// GET handler
const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase()
  const user = await User.findOne({ uuid: req.query.uuid as string })
  if (!user) {
    return res.status(404).json({
      code: 404,
      message: "Resource not found",
    })
  }
  res.status(200).json(user)
}

// PUT handler
const handlePut = async (req: NextApiRequest, res: NextApiResponse, data: PutBodyType) => {
  await connectToDatabase()

  const user = await User.findOne({ uuid: req.query.uuid as string })
  if (!user) {
    return res.status(404).json({
      code: 404,
      message: "Resource not found",
    })
  }

  user.username = data.username
  user.email = data.email
  user.elo = data.elo
  if (!(await user.comparePassword(data.password))) {
    user.password = data.password
  }

  try {
    await user.save()
    res.status(200).json(user)
  } catch (error: any) {
    res.status(422).json({ code: 422, message: error.message })
  }
}

// DELETE handler
const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase()
  const user = await User.findOneAndDelete({ uuid: req.query.uuid as string })
  if (!user) {
    return res.status(404).json({
      code: 404,
      message: "Resource not found",
    })
  }
  res.status(204).send("OK")
}

// Export the API route
export default methodRouter({
  GET: { handler: handleGet },
  PUT: { handler: handlePut, schema: putBodySchema },
  DELETE: { handler: handleDelete },
})
