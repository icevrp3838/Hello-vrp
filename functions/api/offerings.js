// functions/api/offerings.js
//   GET  ?semester=1/2569&level=hvd&major=hvd-dbt   -> list (any logged-in user)
//   POST { ...offering }                            -> create  (academic only)
import { json, bad, requireRole, getUser, uid } from "./_lib.js";

export async function onRequestGet(context) {
  const user = await getUser(context);
  if (!user) return json({ error: "unauthorized" }, 401);

  const url = new URL(context.request.url);
  const semester = url.searchParams.get("semester");
  const level = url.searchParams.get("level");
  const major = url.searchParams.get("major");

  let sql = `SELECT o.*, t.name AS teacher_name, t.email AS teacher_email,
                    m.name AS major_name, c.name AS category_name, c.color AS major_color,
                    l.code AS level_code
             FROM offerings o
             JOIN teachers t   ON t.id = o.teacher_id
             JOIN majors m     ON m.id = o.major_id
             JOIN categories c ON c.id = m.category_id
             JOIN levels l     ON l.id = c.level_id
             WHERE 1=1`;
  const args = [];
  if (semester) { sql += " AND o.semester = ?"; args.push(semester); }
  if (level)    { sql += " AND l.id = ?";       args.push(level); }
  if (major)    { sql += " AND o.major_id = ?"; args.push(major); }
  sql += " ORDER BY l.id, m.name, o.code";

  const { results } = await context.env.DB.prepare(sql).bind(...args).all();
  return json({ offerings: results });
}

export async function onRequestPost(context) {
  const { user, error } = await requireRole(context, ["academic"]);
  if (error) return error;

  const b = await context.request.json().catch(() => ({}));
  if (!b.code || !b.name || !b.teacherId || !b.majorId) return bad("กรอกข้อมูลให้ครบ");

  const id = uid("OF");
  await context.env.DB.prepare(
    `INSERT INTO offerings
       (id, semester, course_code, name, credits, major_id, teacher_id, year, student_grp, schedule, room, capacity)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(id, b.semester, b.code, b.name, b.credits || 3, b.majorId, b.teacherId,
         b.year || 1, b.group || "1", b.schedule || "", b.room || "", b.students || 30).run();

  return json({ id }, 201);
}
