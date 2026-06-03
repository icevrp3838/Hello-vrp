// functions/api/attendance.js
//   POST { enrollmentId, week, status }  -> set one cell (teacher only)
import { json, bad, requireRole, uid } from "./_lib.js";

export async function onRequestPost(context) {
  const { error } = await requireRole(context, ["teacher"]);
  if (error) return error;

  const b = await context.request.json().catch(() => ({}));
  if (!b.enrollmentId || !b.week || !b.status) return bad("ต้องระบุ enrollmentId, week, status");
  if (!["P", "L", "A", "H"].includes(b.status)) return bad("status ไม่ถูกต้อง");

  const existing = await context.env.DB.prepare(
    "SELECT id FROM attendance WHERE enrollment_id = ? AND week = ?")
    .bind(b.enrollmentId, b.week).first();

  if (existing) {
    await context.env.DB.prepare("UPDATE attendance SET status = ? WHERE id = ?")
      .bind(b.status, existing.id).run();
  } else {
    await context.env.DB.prepare(
      "INSERT INTO attendance (id, enrollment_id, week, status) VALUES (?,?,?,?)")
      .bind(uid("AT"), b.enrollmentId, b.week, b.status).run();
  }
  return json({ ok: true });
}
