/* ======================================================
   db.js — frontend data access layer
   Auto-detects backend: if /api/login responds, uses the
   real Cloudflare D1 API. Otherwise falls back to
   localStorage (offline / preview mode).
====================================================== */

window.VRPApi = (() => {
  let token = null;
  try { token = localStorage.getItem("vrp.token"); } catch (e) {}

  let mode = "local"; // 'local' | 'api'

  const headers = () => ({
    "content-type": "application/json",
    ...(token ? { authorization: "Bearer " + token } : {}),
  });

  async function probe() {
    try {
      const r = await fetch("/api/login", { method: "OPTIONS" });
      mode = r.ok || r.status === 405 ? "api" : "local";
    } catch (e) { mode = "local"; }
    return mode;
  }

  async function login(username, password) {
    if (mode === "local") {
      // offline: validate against the mock CREDENTIALS table
      const c = Object.values(window.CREDENTIALS || {}).find(
        c => c.user === username && c.pass === password);
      if (!c) throw new Error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      return { id: c.role, role: c.role, name: c.name, roleLabel: c.roleLabel, subtitle: c.subtitle };
    }
    const r = await fetch("/api/login", {
      method: "POST", headers: headers(), body: JSON.stringify({ username, password }) });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "เข้าสู่ระบบไม่สำเร็จ");
    token = data.token;
    try { localStorage.setItem("vrp.token", token); } catch (e) {}
    return data.user;
  }

  function logout() {
    token = null;
    try { localStorage.removeItem("vrp.token"); } catch (e) {}
  }

  // Generic helpers — used by dashboards when mode === 'api'
  const get  = (path)        => fetch("/api" + path, { headers: headers() }).then(r => r.json());
  const post = (path, body)  => fetch("/api" + path, { method: "POST",   headers: headers(), body: JSON.stringify(body) }).then(r => r.json());
  const put  = (path, body)  => fetch("/api" + path, { method: "PUT",    headers: headers(), body: JSON.stringify(body) }).then(r => r.json());
  const del  = (path)        => fetch("/api" + path, { method: "DELETE", headers: headers() }).then(r => r.json());

  return { probe, login, logout, get, post, put, del, get mode() { return mode; } };
})();
