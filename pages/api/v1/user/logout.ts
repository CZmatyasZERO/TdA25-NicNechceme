import type { NextApiRequest, NextApiResponse } from "next"
import { methodRouter } from "../../../../lib/methodRouter"
import type { IronSession } from "iron-session"

// POST handler
const handlePost = async (req: NextApiRequest, res: NextApiResponse, data: unknown, session: IronSession<SessionData>) => {
  session.destroy()
  res.status(200).json({ code: 200, message: "Logout successful" })
}

// Export the API route
export default methodRouter({
  POST: { handler: handlePost },
})
