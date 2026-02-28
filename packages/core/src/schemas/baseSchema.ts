import { z } from "zod";

export const baseSchema = z.object({
  id: z.uuid(),
  updated_at: z.date(),
  is_deleted: z.boolean().default(false),
});
