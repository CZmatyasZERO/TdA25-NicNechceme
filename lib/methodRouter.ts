import { z, ZodError, ZodType } from "zod"
import type { NextApiRequest, NextApiResponse } from "next"
import { getIronSession, IronSession } from "iron-session"
import { v4 as uuidv4 } from "uuid"

const sessionOptions = {
  password: process.env.SECRET_SESSION_PASSWORD as string,
  cookieName: "ssid",
  // Additional options can be added here
  cookieOptions: {
    secure: true,
  },
}

type HandlerWithSchema<T> = {
  handler: (
    req: NextApiRequest, // Original Next.js Request and Response objects
    res: NextApiResponse,
    data: T,
    session: IronSession<SessionData>, // Include session in the handler's parameters
  ) => Promise<void>
  schema?: ZodType
}

export const methodRouter =
  <T>(handlers: { [method: string]: HandlerWithSchema<T> }) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Retrieve the session using getIronSession
      const session = await getIronSession(req, res, sessionOptions) as IronSession<SessionData>

      if (!session.uuid) {
        session.uuid = uuidv4()
        await session.save()
      }
      const method = req.method ?? ""
      const route = handlers[method]

      if (!route) {
        res.setHeader("Allow", Object.keys(handlers))
        return res.status(405).json({
          code: 405,
          message: `Bad request: Method ${method} not allowed`,
        } as errorMessage)
      }

      const { handler, schema } = route

      let data: T = {} as T
      if (schema) {
        if (method === "GET") {
          data = schema.parse(req.query) // Validate and assign to `data`
        } else {
          data = schema.parse(req.body) // Validate and assign to `data`
        }
      }

      // Pass the session along to the handler
      await handler(req, res, data, session)
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          code: 400,
          message: "Bad request: " + error.errors.map((e) => `${e.path}: ${e.message}`).join(", "),
        } as errorMessage)
      } else {
        res.status(500).json({ code: 500, message: "Internal Server Error " + error } as errorMessage)
      }
    }
  }
