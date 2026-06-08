/* ======================================================
   Login screen — role-aware username/password
====================================================== */

const CREDENTIALS = {
  teacher:   { user: "teacher",   pass: "teacher123",   name: "อ. สิริชัย วงศ์รัตนา",     role: "teacher",   roleLabel: "อาจารย์ผู้สอน",   subtitle: "ผู้สอน · เทคโนโลยีธุรกิจดิจิทัล" },
  parent:    { user: "parent",    pass: "parent123",    name: "คุณพ่อ/แม่ของ น.ส.พลอย",  role: "parent",    roleLabel: "ผู้ปกครอง",       subtitle: "ผู้ปกครอง · ปวส.2 DBT" },
  executive: { user: "executive", pass: "executive123", name: "ดร. วิทวัส สูญยี่ขันธ์",    role: "executive", roleLabel: "ผู้บริหาร",       subtitle: "ผู้อำนวยการวิทยาลัย" },
  academic:  { user: "academic",  pass: "academic123",  name: "นางสาว ปริญญา ขจรกิตติ",   role: "academic",  roleLabel: "งานวิชาการ",      subtitle: "หัวหน้างานวิชาการ" },
};

const ROLE_META = {
  teacher:   { label: "อาจารย์",     desc: "ป้อนคะแนน · เช็คชื่อ · บันทึกความเห็น", grad: "linear-gradient(135deg, oklch(0.72 0.25 340), oklch(0.60 0.27 295))", icon: <Icon.edit width={20} height={20}/>, hint: "teacher / teacher123" },
  parent:    { label: "ผู้ปกครอง",   desc: "ดูผลการเรียนของบุตรหลาน",              grad: "linear-gradient(135deg, oklch(0.78 0.18 220), oklch(0.65 0.22 270))", icon: <Icon.heart width={20} height={20}/>, hint: "parent / parent123" },
  executive: { label: "ผู้บริหาร",   desc: "วิเคราะห์ภาพรวม · กลุ่มเสี่ยง",       grad: "linear-gradient(135deg, oklch(0.80 0.18 130), oklch(0.70 0.22 200))", icon: <Icon.chart width={20} height={20}/>, hint: "executive / executive123" },
  academic:  { label: "งานวิชาการ",  desc: "จัดการรายวิชา · อาจารย์ผู้สอน",       grad: "linear-gradient(135deg, oklch(0.82 0.17 75), oklch(0.70 0.22 30))",  icon: <Icon.book width={20} height={20}/>, hint: "academic / academic123" },
};

function Login({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState("teacher");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset fields on role change
  useEffect(() => { setError(""); }, [selectedRole]);

  const fillDemo = () => {
    const c = CREDENTIALS[selectedRole];
    setUser(c.user);
    setPass(c.pass);
    setError("");
  };

  const submit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    if (!user.trim()) return setError("กรุณากรอกชื่อผู้ใช้");
    if (!pass) return setError("กรุณากรอกรหัสผ่าน");
    setLoading(true);
    // VRPApi.login talks to the Cloudflare D1 backend when deployed,
    // and falls back to the built-in demo credentials offline.
    window.VRPApi.login(user.trim(), pass)
      .then((u) => {
        // ensure role label/subtitle present (API user may omit them)
        const meta = CREDENTIALS[u.role] || {};
        onLogin({ roleLabel: meta.roleLabel, subtitle: meta.subtitle, ...u });
      })
      .catch((err) => { setError(err.message || "เข้าสู่ระบบไม่สำเร็จ"); })
      .finally(() => setLoading(false));
  };

  return (
    <div className="login-root fade-in">
      <div className="login-card">
        <div className="login-left">
          <div style={{ display:'flex', alignItems:'center', gap: 12, marginBottom: 36 }}>
            <div className="brand-mark"><span>V</span></div>
            <div>
              <div style={{ fontWeight: 800, letterSpacing: '.02em' }}>VRP Progress</div>
              <div style={{ opacity: .8, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase' }}>Veerapat Tech College</div>
            </div>
          </div>
          <div className="eng" style={{ fontSize: 11, letterSpacing: '.3em', opacity: .85, marginBottom: 12 }}>SEMESTER 1 / 2569</div>
          <h1>ติดตามทุกความก้าวหน้า<br/>ของผู้เรียน ในที่เดียว</h1>
          <p style={{ marginTop: 10 }}>
            แพลตฟอร์มสำหรับอาจารย์ ผู้ปกครอง และผู้บริหาร
            เพื่อบันทึก ดูผล และวิเคราะห์ความคืบหน้ารายวิชาตลอดภาคการศึกษา
          </p>
          <div style={{ display: 'flex', gap: 18, marginTop: 28, alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { ic: <Icon.book width={18} height={18}/>, n: 9,   l: "รายวิชา/ภาคเรียน" },
              { ic: <Icon.users width={18} height={18}/>, n: window.VRP_DATA.COLLEGE_STATS.students, l: "นักศึกษาทั้งหมด" },
              { ic: <Icon.cap width={18} height={18}/>, n: window.VRP_DATA.COLLEGE_STATS.majors,   l: "สาขาวิชา" },
            ].map((m, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.15)', display:'grid', placeItems:'center' }}>{m.ic}</div>
                <div style={{ lineHeight: 1.1 }}>
                  <div className="num" style={{ fontWeight: 800 }}>{m.n}</div>
                  <div style={{ fontSize: 11, opacity: .8 }}>{m.l}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ position: 'absolute', bottom: 24, left: 44, right: 44, fontSize: 11, opacity: .7, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>เข้ารหัส TLS 1.3 · ระบบเป็นไปตาม PDPA</span>
            <span className="eng">v1.0</span>
          </div>
        </div>

        <div className="login-right">
          <div style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: '.25em', textTransform: 'uppercase', marginBottom: 8 }}>เข้าสู่ระบบ</div>
          <h2 style={{ fontSize: 22, marginBottom: 6, fontWeight: 700 }}>ยินดีต้อนรับ <span style={{ background: 'var(--grad-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>กลับมา</span></h2>
          <p className="muted" style={{ fontSize: 13, marginBottom: 18 }}>เลือกบทบาทและใช้ชื่อผู้ใช้/รหัสผ่านของท่าน</p>

          {/* Role tabs */}
          <div className="login-role-tabs">
            {Object.keys(ROLE_META).map(k => {
              const m = ROLE_META[k];
              const active = k === selectedRole;
              return (
                <button key={k} type="button" className={"login-role-tab " + (active ? "active" : "")} onClick={() => setSelectedRole(k)}>
                  <span className="ic" style={{ background: active ? m.grad : 'color-mix(in oklab, white 6%, transparent)' }}>{m.icon}</span>
                  <span className="lbl">{m.label}</span>
                  <span className="desc">{m.desc}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
            <div className="field">
              <label>ชื่อผู้ใช้</label>
              <div className="input-wrap">
                <svg className="input-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/></svg>
                <input className="input" autoComplete="username" value={user} onChange={e => setUser(e.target.value)} placeholder={"เช่น " + CREDENTIALS[selectedRole].user} />
              </div>
            </div>
            <div className="field">
              <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>รหัสผ่าน</span>
                <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'oklch(0.78 0.22 320)', fontSize: 11, textDecoration: 'none' }}>ลืมรหัสผ่าน?</a>
              </label>
              <div className="input-wrap">
                <svg className="input-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                <input className="input" autoComplete="current-password" type={showPass ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" />
                <button type="button" className="input-eye" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                  {showPass
                    ? <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l18 18"/><path d="M10.6 6.2A10 10 0 0 1 22 12s-1.3 2.4-3.6 4.4"/><path d="M6.3 7.6C3.6 9.4 2 12 2 12s4 7 10 7c1.5 0 2.9-.4 4.1-1"/></svg>
                    : <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display:'flex', alignItems:'center', gap: 8, fontSize: 12, color: 'var(--fg-2)', cursor: 'pointer' }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: 'oklch(0.72 0.25 340)' }}/>
                จดจำการเข้าสู่ระบบ
              </label>
              <button type="button" className="btn small ghost" onClick={fillDemo} title={ROLE_META[selectedRole].hint}>
                <Icon.sparkle width={12} height={12}/> ใช้ข้อมูลทดลอง
              </button>
            </div>

            {error && (
              <div style={{ padding: '10px 12px', borderRadius: 10, background: 'color-mix(in oklab, var(--bad) 14%, transparent)', border: '1px solid color-mix(in oklab, var(--bad) 35%, transparent)', color: 'oklch(0.85 0.12 25)', fontSize: 12.5, display: 'flex', gap: 8, alignItems: 'center' }}>
                <Icon.alert width={14} height={14}/> {error}
              </div>
            )}

            <button type="submit" className="btn primary" style={{ padding: '12px 16px', justifyContent: 'center', fontWeight: 600 }} disabled={loading}>
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.2-8.5"/>
                  </svg>
                  กำลังเข้าสู่ระบบ…
                </>
              ) : (
                <>เข้าสู่ระบบในฐานะ {ROLE_META[selectedRole].label} <Icon.arrow width={16} height={16}/></>
              )}
            </button>

            <div style={{ marginTop: 8, padding: '10px 12px', borderRadius: 10, background: 'color-mix(in oklab, var(--cyan) 10%, transparent)', border: '1px dashed color-mix(in oklab, var(--cyan) 30%, transparent)', fontSize: 11.5, color: 'var(--fg-2)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Icon.sparkle width={14} height={14} style={{ color: 'var(--cyan)', flex: '0 0 14px', marginTop: 1 }}/>
                <div style={{ lineHeight: 1.5 }}>
                  <b style={{ color: 'var(--fg-1)' }}>ข้อมูลทดลอง · </b>
                  <span className="eng mono">{CREDENTIALS[selectedRole].user}</span> / <span className="eng mono">{CREDENTIALS[selectedRole].pass}</span>
                </div>
            </div>
          </form>

          <div style={{ marginTop: 18, fontSize: 11, color: 'var(--fg-3)', textAlign: 'center' }}>
            VRP Progress · <span className="eng">© Veerapat Tech College 2569</span>
          </div>
        </div>
      </div>
    </div>
  );
}

window.Login = Login;
window.CREDENTIALS = CREDENTIALS;
