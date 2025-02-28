import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { methodRouter } from "../../../../lib/methodRouter" // Adjust path accordingly
import { connectToDatabase } from "../../../../lib/db"
import User from "../../../../models/User"
import type { IronSession } from "iron-session"

// PUT handler
const handlePut = async (req: NextApiRequest, res: NextApiResponse, data: unknown, session: IronSession<SessionData>) => {
  await connectToDatabase()

  if (!session.loggedIn) {
    return res.status(401).json({ code: 401, message: "You must be logged in" })
  }

  const user = await User.findOne({ uuid: session.uuid })
  if (!user) {
    return res.status(404).json({ code: 404, message: "User not found" })
  }

  if (!user.admin) {
    return res.status(403).json({ code: 403, message: "You are not admin" })
  }

  const userToBan = await User.findOne({ uuid: req.query.uuid as string })
  if (!userToBan) {
    return res.status(404).json({ code: 404, message: "User not found" })
  }

  if (userToBan.banned) {
    userToBan.banned = false
  } else {
    userToBan.banned = true
  }

  try {
    await userToBan.save()
    res.status(200).json({ code: 200, message: "Successfully toggled user ban" })
  } catch (error: any) {
    res.status(422).json({ code: 422, message: error.message })
  }
}

// Export the API route
export default methodRouter({
  PUT: { handler: handlePut },
})
