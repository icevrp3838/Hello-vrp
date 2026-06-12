// functions/api/teachers.js — GET list of teachers w/ aggregated load (exec/academic)
import { json, requireRole } from "./_lib.js";

export async function onRequestGet(context) {
  const { error } = await requireRole(context, ["executive", "academic"]);
  if (error) return error;

  const { results } = await context.env.DB.prepare(
    `SELECT t.*,
            COUNT(o.id)                AS offering_count,
            COALESCE(SUM(o.credits),0) AS total_credits,
            COALESCE(SUM(o.capacity),0) AS total_students
     FROM teachers t
     LEFT JOIN offerings o ON o.teacher_id = t.id
     GROUP BY t.id
     ORDER BY t.name`).all();
  return json({ teachers: results });
}
