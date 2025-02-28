import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { methodRouter } from "../../../../lib/methodRouter"
import { connectToDatabase } from "../../../../lib/db"
import User from "../../../../models/User"
import type { IronSession } from "iron-session"

// GET handler
const handleGet = async (req: NextApiRequest, res: NextApiResponse, data: unknown, session: IronSession<SessionData>) => {
  await connectToDatabase()

  const TdAAdmin = await User.findOne({ admin: true })
  if (!TdAAdmin) {
    const admin = new User({
      username: "TdA",
      email: "tda@scg.cz",
      password: "StudentCyberGames25!",
      admin: true,
    })
    await admin.save()
  }
  if (session.uuid && session.loggedIn) {
    const user = await User.findOne({ uuid: session.uuid })
    if (user) {
      return res.status(201).json({ loggedIn: true, ...user.toJSON() })
    }
    return res.status(201).json({ loggedIn: false })
  }
  return res.status(201).json({ loggedIn: false })
}

// Export the API route
export default methodRouter({
  GET: { handler: handleGet },
})
