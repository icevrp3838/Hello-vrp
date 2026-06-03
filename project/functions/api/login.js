// functions/api/login.js  —  POST { username, password } -> { token, user }
import { json, bad, verifyPassword, createSession } from "./_lib.js";

export async function onRequestPost(context) {
  const { username, password } = await context.request.json().catch(() => ({}));
  if (!username || !password) return bad("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");

  const user = await context.env.DB
    .prepare("SELECT * FROM users WHERE username = ?").bind(username).first();
  if (!user) return bad("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", 401);

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return bad("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", 401);

  const token = await createSession(context.env.DB, user.id);
  return json({
    token,
    user: {
      id: user.id, role: user.role, name: user.display_name,
      email: user.email, linkedId: user.linked_id,
    },
  });
}
