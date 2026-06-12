// functions/api/grades.js
//   GET  ?offering=OF0001            -> roster + scores + attendance (teacher/exec/academic)
//   POST { offeringId, studentId, collected, midterm, final, remark }
//                                    -> upsert one student's record (teacher only)
import { json, bad, requireRole, getUser, uid } from "./_lib.js";

export async function onRequestGet(context) {
  const user = await getUser(context);
  if (!user) return json({ error: "unauthorized" }, 401);

  const url = new URL(context.request.url);
  const offeringId = url.searchParams.get("offering");
  const studentId = url.searchParams.get("student"); // parents pass their child id

  let sql = `SELECT e.*, s.full_name, s.code AS student_code, s.nickname, s.avatar
             FROM enrollments e JOIN students s ON s.id = e.student_id WHERE 1=1`;
  const args = [];
  if (offeringId) { sql += " AND e.offering_id = ?"; args.push(offeringId); }
  if (studentId)  { sql += " AND e.student_id  = ?"; args.push(studentId); }

  // Parents may only read their own child
  if (user.role === "parent" && user.linked_id) {
    sql += " AND e.student_id = ?"; args.push(user.linked_id);
  }

  const { results } = await context.env.DB.prepare(sql).bind(...args).all();

  // attach attendance
  for (const row of results) {
    const att = await context.env.DB.prepare(
      "SELECT week, status FROM attendance WHERE enrollment_id = ? ORDER BY week").bind(row.id).all();
    row.attendance = att.results;
  }
  return json({ rows: results });
}

export async function onRequestPost(context) {
  const { error } = await requireRole(context, ["teacher"]);
  if (error) return error;

  const b = await context.request.json().catch(() => ({}));
  if (!b.offeringId || !b.studentId) return bad("ต้องระบุ offeringId และ studentId");

  // upsert enrollment
  const existing = await context.env.DB.prepare(
    "SELECT id FROM enrollments WHERE offering_id = ? AND student_id = ?")
    .bind(b.offeringId, b.studentId).first();

  if (existing) {
    await context.env.DB.prepare(
      `UPDATE enrollments SET collected=?, midterm=?, final=?, remark=?, updated_at=datetime('now')
       WHERE id = ?`
    ).bind(b.collected || 0, b.midterm || 0, b.final || 0, b.remark || "", existing.id).run();
    return json({ id: existing.id, ok: true });
  } else {
    const id = uid("EN");
    await context.env.DB.prepare(
      `INSERT INTO enrollments (id, offering_id, student_id, collected, midterm, final, remark)
       VALUES (?,?,?,?,?,?,?)`
    ).bind(id, b.offeringId, b.studentId, b.collected || 0, b.midterm || 0, b.final || 0, b.remark || "").run();
    return json({ id, ok: true }, 201);
  }
}
