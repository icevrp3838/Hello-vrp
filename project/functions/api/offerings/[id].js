// functions/api/offerings/[id].js
//   PUT    /api/offerings/:id   -> update (academic only)
//   DELETE /api/offerings/:id   -> delete (academic only)
import { json, bad, requireRole } from "../_lib.js";

export async function onRequestPut(context) {
  const { error } = await requireRole(context, ["academic"]);
  if (error) return error;

  const id = context.params.id;
  const b = await context.request.json().catch(() => ({}));
  const exists = await context.env.DB.prepare("SELECT id FROM offerings WHERE id = ?").bind(id).first();
  if (!exists) return bad("ไม่พบรายวิชา", 404);

  await context.env.DB.prepare(
    `UPDATE offerings SET semester=?, course_code=?, name=?, credits=?, major_id=?,
                          teacher_id=?, year=?, student_grp=?, schedule=?, room=?, capacity=?
     WHERE id = ?`
  ).bind(b.semester, b.code, b.name, b.credits || 3, b.majorId, b.teacherId,
         b.year || 1, b.group || "1", b.schedule || "", b.room || "", b.students || 30, id).run();

  return json({ ok: true });
}

export async function onRequestDelete(context) {
  const { error } = await requireRole(context, ["academic"]);
  if (error) return error;
  await context.env.DB.prepare("DELETE FROM offerings WHERE id = ?").bind(context.params.id).run();
  return json({ ok: true });
}
