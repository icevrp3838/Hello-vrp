/* ======================================================
   Academic Affairs dashboard
   - Add/edit/delete course offerings (subject + teacher + class)
   - Filters: level / major / semester / search
====================================================== */

function AcademicDashboard({ offerings, setOfferings, toast }) {
  const { PROGRAMS, TEACHERS, SEMESTERS, CATALOG, CURRENT_SEMESTER } = window.VRP_DATA;

  const [level, setLevel] = useState("ALL"); // ALL | voc | hvd
  const [majorId, setMajorId] = useState("ALL");
  const [semester, setSemester] = useState(CURRENT_SEMESTER);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null); // offering id or "new"
  const [draft, setDraft] = useState(null);

  // Build a flat majors list with metadata
  const allMajors = useMemo(() => {
    const list = [];
    Object.values(PROGRAMS).forEach(p => p.categories.forEach(c => c.majors.forEach(m => {
      list.push({ ...m, level: p.id, levelCode: p.code, catName: c.name, color: c.color });
    })));
    return list;
  }, []);
  const visibleMajors = level === "ALL" ? allMajors : allMajors.filter(m => m.level === level);

  // Filter offerings
  const filtered = offerings.filter(o => {
    if (semester !== "ALL" && o.semester !== semester) return false;
    if (level !== "ALL" && o.level !== level) return false;
    if (majorId !== "ALL" && o.majorId !== majorId) return false;
    if (query) {
      const q = query.toLowerCase();
      const t = TEACHERS.find(t => t.id === o.teacherId);
      if (!(o.name.toLowerCase().includes(q) ||
            o.code.toLowerCase().includes(q) ||
            (t && t.name.toLowerCase().includes(q)))) return false;
    }
    return true;
  });

  const stats = useMemo(() => {
    const t = { offerings: filtered.length, credits: 0, students: 0, teachers: new Set() };
    filtered.forEach(o => { t.credits += o.credits; t.students += o.students; t.teachers.add(o.teacherId); });
    return { ...t, teachers: t.teachers.size };
  }, [filtered]);

  const startNew = () => {
    const mj = majorId === "ALL" ? "hvd-dbt" : majorId;
    setDraft({
      id: null, semester, level: mj.startsWith("voc-") ? "voc" : "hvd",
      majorId: mj, code: "", name: "", credits: 3, teacherId: TEACHERS[0].id,
      year: 1, group: "1", schedule: "จ. 09:00-12:00", room: "", students: 25,
    });
    setEditing("new");
  };

  const startEdit = (o) => { setDraft({ ...o }); setEditing(o.id); };
  const cancel = () => { setDraft(null); setEditing(null); };

  const save = () => {
    if (!draft.code || !draft.name || !draft.teacherId) { toast && toast("กรอกข้อมูลให้ครบ"); return; }
    const major = allMajors.find(m => m.id === draft.majorId);
    const enriched = { ...draft,
      level: draft.majorId.startsWith("voc-") ? "voc" : "hvd",
      majorName: major.name, levelCode: major.levelCode, catName: major.catName, majorColor: major.color,
    };
    if (editing === "new") {
      const id = "OF" + String(Date.now() % 100000).padStart(5, "0");
      setOfferings([...offerings, { ...enriched, id }]);
      toast && toast("เพิ่มรายวิชาเรียบร้อย");
    } else {
      setOfferings(offerings.map(o => o.id === editing ? enriched : o));
      toast && toast("บันทึกการแก้ไขเรียบร้อย");
    }
    cancel();
  };

  const remove = (id) => {
    setOfferings(offerings.filter(o => o.id !== id));
    toast && toast("ลบรายวิชาเรียบร้อย");
  };

  const teacherOf = (id) => TEACHERS.find(t => t.id === id);

  return (
    <div className="fade-in">
      {/* Hero */}
      <div className="hero-card" style={{ marginBottom: 18 }}>
        <div>
          <div className="eyebrow">งานวิชาการ · จัดการหลักสูตรและการเรียนการสอน</div>
          <h2>รายวิชาที่เปิดสอน · ภาคเรียน {semester}</h2>
          <p>กำหนดอาจารย์ผู้สอน รายวิชา และห้องเรียนสำหรับแต่ละสาขา ทั้งระดับ ปวช. และ ปวส. ในแต่ละภาคการศึกษา</p>
          <div className="hero-stats">
            <div className="hero-stat"><b><AnimNum value={stats.offerings}/></b><small>รายวิชาที่เปิด</small></div>
            <div className="hero-stat"><b><AnimNum value={stats.credits}/></b><small>หน่วยกิตรวม</small></div>
            <div className="hero-stat"><b><AnimNum value={stats.teachers}/></b><small>อาจารย์ผู้สอน</small></div>
          </div>
        </div>
        <div style={{ display:'grid', placeItems:'center' }}>
          <Donut value={Math.min(1, stats.offerings / 30)} label={stats.offerings + ""} sub="รายวิชา" size={150} thickness={14}/>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ padding: 14, marginBottom: 14, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="segment">
          <button className={level === "ALL" ? "active" : ""} onClick={() => { setLevel("ALL"); setMajorId("ALL"); }}>ทุกระดับ</button>
          <button className={level === "voc" ? "active" : ""} onClick={() => { setLevel("voc"); setMajorId("ALL"); }}>ปวช.</button>
          <button className={level === "hvd" ? "active" : ""} onClick={() => { setLevel("hvd"); setMajorId("ALL"); }}>ปวส.</button>
        </div>

        <select className="select" value={majorId} onChange={e => setMajorId(e.target.value)} style={{ minWidth: 220 }}>
          <option value="ALL">— ทุกสาขาวิชา —</option>
          {visibleMajors.map(m => (
            <option key={m.id} value={m.id}>{m.levelCode} {m.name}</option>
          ))}
        </select>

        <select className="select" value={semester} onChange={e => setSemester(e.target.value)} style={{ minWidth: 140 }}>
          <option value="ALL">— ทุกภาคเรียน —</option>
          {SEMESTERS.map(s => <option key={s} value={s}>ภาคเรียน {s}</option>)}
        </select>

        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Icon.search width={16} height={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)' }}/>
          <input className="input" style={{ paddingLeft: 36 }} placeholder="ค้นหารหัสวิชา / ชื่อวิชา / อาจารย์" value={query} onChange={e => setQuery(e.target.value)}/>
        </div>

        <button className="btn primary" onClick={startNew}>
          <Icon.sparkle width={14} height={14}/> เพิ่มรายวิชา
        </button>
      </div>

      {/* Add/edit form */}
      {editing && draft && (
        <OfferingForm draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel}
          isNew={editing === "new"} allMajors={allMajors} teachers={TEACHERS}
          catalog={CATALOG} semesters={SEMESTERS}/>
      )}

      {/* Offerings table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', display:'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>รายวิชาที่เปิดสอน</h3>
            <div className="muted" style={{ fontSize: 12 }}>{filtered.length} รายการ</div>
          </div>
          <div className="muted" style={{ fontSize: 11 }}>คลิก <Icon.edit width={11} height={11} style={{ verticalAlign: '-1px' }}/> เพื่อแก้ไข</div>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--fg-2)' }}>
            <Icon.book width={32} height={32} style={{ opacity: .4, marginBottom: 10 }}/>
            <div style={{ fontSize: 14 }}>ไม่พบรายวิชาที่ตรงกับเงื่อนไข</div>
            <button className="btn small primary" style={{ marginTop: 14 }} onClick={startNew}>
              <Icon.sparkle width={12} height={12}/> เพิ่มรายวิชาแรก
            </button>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 110 }}>รหัสวิชา</th>
                <th>ชื่อวิชา</th>
                <th>สาขา / ระดับ</th>
                <th>อาจารย์ผู้สอน</th>
                <th>ตารางเรียน</th>
                <th style={{ textAlign: 'right' }}>นศ.</th>
                <th style={{ width: 90 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const t = teacherOf(o.teacherId);
                return (
                  <tr key={o.id}>
                    <td className="eng mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{o.code}</td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{o.name}</div>
                      <div className="dim" style={{ fontSize: 11 }}>{o.credits} หน่วยกิต · ปี {o.year} กลุ่ม {o.group}</div>
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems: 'center', gap: 8 }}>
                        <span className="subj-dot" style={{ background: o.majorColor }}/>
                        <div style={{ lineHeight: 1.15 }}>
                          <div style={{ fontSize: 12 }}>{o.majorName}</div>
                          <div className="dim" style={{ fontSize: 10.5 }}>{o.levelCode} · {o.catName}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                        <Avatar name={t.name} seed={t.avatar} size={26}/>
                        <div style={{ lineHeight: 1.15 }}>
                          <div style={{ fontSize: 12 }}>{t.name}</div>
                          <div className="dim eng" style={{ fontSize: 10 }}>{t.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      <div>{o.schedule}</div>
                      <div className="dim eng" style={{ fontSize: 11 }}>{o.room}</div>
                    </td>
                    <td className="num" style={{ textAlign: 'right' }}>{o.students}</td>
                    <td>
                      <div style={{ display:'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button className="btn small ghost" title="แก้ไข" onClick={() => startEdit(o)}><Icon.edit width={13} height={13}/></button>
                        <button className="btn small ghost danger" title="ลบ" onClick={() => remove(o.id)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M5 7v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7"/><path d="M9 7V4h6v3"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Catalog hint */}
      <div className="card" style={{ marginTop: 14, padding: 16, display:'flex', alignItems: 'center', gap: 12, background: 'color-mix(in oklab, var(--cyan) 8%, transparent)' }}>
        <Icon.sparkle width={16} height={16} style={{ color: 'var(--cyan)' }}/>
        <div style={{ fontSize: 12.5, color: 'var(--fg-1)' }}>
          ระบบมีหลักสูตรกลางครบทั้ง {Object.keys(CATALOG).length} สาขา · เมื่อเลือกสาขาในฟอร์มเพิ่มรายวิชา ระบบจะแสดงรายวิชาที่มีในหลักสูตรให้เลือก หรือเพิ่มรายวิชาใหม่นอกหลักสูตรได้
        </div>
      </div>
    </div>
  );
}

/* ---------- Offering form ---------- */

const DAYS_TH = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];
const PERIODS = ["08:30", "09:30", "10:30", "11:30", "12:30", "13:30", "14:30", "15:30"]; // 7 periods × 1hr

function parseSchedule(str) {
  if (!str) return { day: 0, start: "08:30", end: "11:30" };
  const m = String(str).match(/^(\S+)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
  if (!m) return { day: 0, start: "08:30", end: "11:30" };
  const day = DAYS_TH.indexOf(m[1]);
  return { day: day >= 0 ? day : 0, start: m[2], end: m[3] };
}
const formatSchedule = (s) => `${DAYS_TH[s.day]} ${s.start}-${s.end}`;

function OfferingForm({ draft, setDraft, onSave, onCancel, isNew, allMajors, teachers, catalog, semesters }) {
  const upd = (k, v) => {
    let next = { ...draft, [k]: v };
    // Clamp year to allowed range when major changes
    if (k === "majorId") {
      const maxYear = v.startsWith("voc-") ? 3 : 2;
      if (next.year > maxYear) next.year = maxYear;
    }
    setDraft(next);
  };
  const catalogList = catalog[draft.majorId] || [];

  return (
    <div className="card glow" style={{ padding: 22, marginBottom: 14, position: 'relative' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 14 }}>
        <div>
          <div className="h-eyebrow">{isNew ? "เพิ่มรายวิชา" : "แก้ไขรายวิชา"}</div>
          <h3>{isNew ? "เพิ่มรายวิชาที่เปิดสอนใหม่" : draft.code + " · " + draft.name}</h3>
        </div>
        <button className="btn ghost small" onClick={onCancel}>✕ ปิด</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <div className="field" style={{ gridColumn: 'span 2' }}>
          <label>สาขาวิชา · ระดับ</label>
          <select className="select" value={draft.majorId} onChange={e => upd("majorId", e.target.value)}>
            {allMajors.map(m => <option key={m.id} value={m.id}>{m.levelCode} {m.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>ภาคเรียน</label>
          <select className="select" value={draft.semester} onChange={e => upd("semester", e.target.value)}>
            {semesters.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="field">
          <label>ปี / กลุ่ม</label>
          <div style={{ display:'flex', gap: 6 }}>
            <select className="select" value={draft.year} onChange={e => upd("year", Number(e.target.value))} style={{ flex: 1 }}>
              {(draft.majorId.startsWith("voc-") ? [1,2,3] : [1,2]).map(y => <option key={y} value={y}>ปี {y}</option>)}
            </select>
            <input className="input" value={draft.group} onChange={e => upd("group", e.target.value)} style={{ width: 60 }}/>
          </div>
        </div>

        {catalogList.length > 0 && (
          <div className="field" style={{ gridColumn: 'span 4' }}>
            <label>เลือกจากหลักสูตร <span className="dim" style={{ textTransform: 'none', letterSpacing: 0 }}>(หรือกรอกเองด้านล่าง)</span></label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {catalogList.map(c => (
                <button key={c.code} type="button"
                        className="btn small"
                        style={{
                          background: draft.code === c.code ? 'var(--grad-hero)' : undefined,
                          color: draft.code === c.code ? 'white' : undefined,
                          border: draft.code === c.code ? 'none' : undefined,
                        }}
                        onClick={() => setDraft({ ...draft, code: c.code, name: c.name, credits: c.credits })}>
                  <span className="eng mono" style={{ fontSize: 10.5, opacity: .7 }}>{c.code}</span> {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="field">
          <label>รหัสวิชา</label>
          <input className="input eng mono" value={draft.code} onChange={e => upd("code", e.target.value)} placeholder="เช่น 30204-2001"/>
        </div>
        <div className="field" style={{ gridColumn: 'span 2' }}>
          <label>ชื่อวิชา</label>
          <input className="input" value={draft.name} onChange={e => upd("name", e.target.value)} placeholder="ชื่อรายวิชาเต็ม"/>
        </div>
        <div className="field">
          <label>หน่วยกิต</label>
          <input className="input num" type="number" min="1" max="6" value={draft.credits} onChange={e => upd("credits", Number(e.target.value))}/>
        </div>

        <div className="field" style={{ gridColumn: 'span 2' }}>
          <label>อาจารย์ผู้สอน</label>
          <select className="select" value={draft.teacherId} onChange={e => upd("teacherId", e.target.value)}>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.spec})</option>)}
          </select>
        </div>
        <div className="field" style={{ gridColumn: 'span 3' }}>
          <label>ตารางเรียน · คาบละ 1 ชม. ระหว่าง 08:30–15:30</label>
          {(() => {
            const sched = parseSchedule(draft.schedule);
            const startIdx = PERIODS.indexOf(sched.start);
            const updSched = (patch) => {
              let next = { ...sched, ...patch };
              const si = PERIODS.indexOf(next.start);
              const ei = PERIODS.indexOf(next.end);
              if (ei <= si) next.end = PERIODS[Math.min(PERIODS.length - 1, si + 1)];
              upd("schedule", formatSchedule(next));
            };
            return (
              <div style={{ display: 'flex', gap: 6, alignItems: 'stretch' }}>
                <div style={{ display: 'flex', gap: 2, padding: 3, borderRadius: 10, background: 'color-mix(in oklab, var(--bg-0) 50%, transparent)', border: '1px solid var(--line)' }}>
                  {DAYS_TH.map((d, i) => (
                    <button key={i} type="button"
                      onClick={() => updSched({ day: i })}
                      style={{
                        border: 0, padding: '7px 11px', borderRadius: 7, cursor: 'pointer',
                        fontFamily: 'var(--font-thai)', fontSize: 12.5, fontWeight: 500,
                        background: sched.day === i ? 'var(--grad-hero)' : 'transparent',
                        color: sched.day === i ? 'white' : 'var(--fg-2)',
                        transition: '.15s',
                      }}>{d}</button>
                  ))}
                </div>
                <select className="select eng mono" value={sched.start} onChange={e => updSched({ start: e.target.value })} style={{ width: 95 }}>
                  {PERIODS.slice(0, -1).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <span style={{ display:'grid', placeItems:'center', color: 'var(--fg-3)', fontSize: 13 }}>—</span>
                <select className="select eng mono" value={sched.end} onChange={e => updSched({ end: e.target.value })} style={{ width: 95 }}>
                  {PERIODS.slice(1).filter((_, i) => i + 1 > startIdx).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <div style={{ display: 'grid', placeItems: 'center', padding: '0 10px', borderRadius: 10, background: 'color-mix(in oklab, var(--magenta) 14%, transparent)', border: '1px solid color-mix(in oklab, var(--magenta) 30%, transparent)', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'oklch(0.85 0.1 320)' }}>
                  {Math.max(1, PERIODS.indexOf(sched.end) - PERIODS.indexOf(sched.start))} คาบ
                </div>
              </div>
            );
          })()}
        </div>
        <div className="field">
          <label>ห้องเรียน</label>
          <input className="input eng" value={draft.room} onChange={e => upd("room", e.target.value)} placeholder="เช่น IT-301"/>
        </div>

        <div className="field">
          <label>จำนวนนักศึกษา (โดยประมาณ)</label>
          <input className="input num" type="number" min="0" max="60" value={draft.students} onChange={e => upd("students", Number(e.target.value))}/>
        </div>
      </div>

      <div style={{ display:'flex', justifyContent:'flex-end', gap: 8, marginTop: 18, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
        <button className="btn" onClick={onCancel}>ยกเลิก</button>
        <button className="btn primary" onClick={onSave}>
          <Icon.save width={14} height={14}/> {isNew ? "เพิ่มรายวิชา" : "บันทึกการแก้ไข"}
        </button>
      </div>
    </div>
  );
}

window.AcademicDashboard = AcademicDashboard;
