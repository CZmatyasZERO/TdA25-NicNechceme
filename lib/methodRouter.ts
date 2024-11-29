import { z, ZodError, ZodType } from 'zod';
import type { NextApiRequest, NextApiResponse } from 'next';

// Modify HandlerWithSchema to accept a generic type for the schema
type HandlerWithSchema<T> = {
  handler: (req: NextApiRequest, res: NextApiResponse, data: any) => Promise<void>;
  schema?: ZodType; // Schema should be a ZodType that infers type T
};

export const methodRouter = <T>(
  handlers: { [method: string]: HandlerWithSchema<T> }
) => async (req: NextApiRequest, res: NextApiResponse) => {
  const method = req.method ?? '';
  const route = handlers[method];

  if (!route) {
    res.setHeader('Allow', Object.keys(handlers));
    return res.status(405).json({ code: 405, message: `Bad request: Method ${method} not allowed` } as errorMessage);
  }

  const { handler, schema } = route;

  try {
    let data: T = {} as T;

    // Automatically validate `req.query` for `GET` or `req.body` for other methods
    if (schema) {
      if (method === 'GET') {
        data = schema.parse(req.query); // Validate and assign to `data`
      } else {
        data = schema.parse(req.body); // Validate and assign to `data`
      }
    }

    // Call the handler with the validated data (typed as T)
    await handler(req, res, data);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        code: 400,
        message: "Bad request: " + error.errors.map((e) => `${e.path}: ${e.message}`).join(", "),
      } as errorMessage);
    } else {
      throw error;
      //res.status(500).json({ code: 500 ,message: 'Internal Server Error' } as errorMessage);
    }
  }
};
