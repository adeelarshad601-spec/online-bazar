import { z } from "zod";

// Stats endpoint doesn't require any input validation
// Just serves as a documentation placeholder
export const adminStatsQuerySchema = z.object({}).strict();

export type AdminStatsQuery = z.infer<typeof adminStatsQuerySchema>;
