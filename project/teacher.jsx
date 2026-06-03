/* ======================================================
   Teacher dashboard
====================================================== */

function TeacherDashboard({ data, setData, subjectId, setSubjectId, toast }) {
  const { SUBJECTS, STUDENTS } = window.VRP_DATA;
  const subject = SUBJECTS.find(s => s.id === subjectId);
  const [tab, setTab] = useState("scores"); // scores | attendance | remarks
  const [query, setQuery] = useState("");
  const [editingRemark, setEditingRemark] = useState(null);
  const [remarkDraft, setRemarkDraft] = useState("");

  const filtered = STUDENTS.filter(s =>
    s.fullName.includes(query) || s.code.includes(query) || s.nickname.includes(query)
  );

  // Subject-level stats
  const stats = useMemo(() => {
    const rows = STUDENTS.map(s => {
      const r = data[s.id][subject.id];
      return { ...r, total: totalScore(r.scores), att: attendanceRate(r.attendance) };
    });
    const avg = rows.reduce((a,r) => a + r.total, 0) / rows.length;
    const avgAtt = rows.reduce((a,r) => a + r.att, 0) / rows.length;
    const pass = rows.filter(r => r.total >= 50).length;
    return {
      avg: avg.toFixed(1),
      avgAtt: (avgAtt * 100).toFixed(1),
      pass, passRate: ((pass / rows.length) * 100).toFixed(0),
      atRisk: rows.filter(r => r.total < 50 || r.att < 0.8).length,
    };
  }, [data, subjectId]);

  const setScore = (sid, field, val) => {
    const max = field === "final" ? 40 : 30;
    const num = Math.max(0, Math.min(max, Number(val) || 0));
    setData(prev => ({
      ...prev,
      [sid]: { ...prev[sid], [subject.id]: { ...prev[sid][subject.id], scores: { ...prev[sid][subject.id].scores, [field]: num } } }
    }));
  };

  const cycleAtt = (sid, weekIdx) => {
    const cur = data[sid][subject.id].attendance[weekIdx];
    if (cur === "H") return;
    const next = { P: "L", L: "A", A: "P" }[cur] || "P";
    setData(prev => {
      const att = [...prev[sid][subject.id].attendance];
      att[weekIdx] = next;
      return { ...prev, [sid]: { ...prev[sid], [subject.id]: { ...prev[sid][subject.id], attendance: att } } };
    });
  };

  const saveRemark = (sid) => {
    setData(prev => ({ ...prev, [sid]: { ...prev[sid], [subject.id]: { ...prev[sid][subject.id], remark: remarkDraft } } }));
    setEditingRemark(null);
    toast && toast("บันทึกความคิดเห็นเรียบร้อย");
  };

  return (
    <div className="fade-in">
      {/* Subject hero */}
      <div className="hero-card" style={{ marginBottom: 18 }}>
        <div>
          <div className="eyebrow">รายวิชาที่กำลังจัดการ</div>
          <h2>{subject.th}</h2>
          <div className="muted" style={{ fontSize: 13 }}>
            <span className="eng" style={{ marginRight: 10 }}>{subject.id}</span>
            <span className="eng">{subject.en}</span> · {subject.credits} หน่วยกิต · ปวส.2 · ภาคต้น 2569
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <b><AnimNum value={Number(stats.avg)} decimals={1} /></b>
              <small>คะแนนเฉลี่ย / 100</small>
            </div>
            <div className="hero-stat">
              <b><AnimNum value={Number(stats.avgAtt)} decimals={1} suffix="%" /></b>
              <small>อัตราการเข้าเรียนเฉลี่ย</small>
            </div>
            <div className="hero-stat">
              <b><AnimNum value={stats.atRisk} />&nbsp;<span style={{ fontSize: 14, color: 'var(--fg-2)' }}>คน</span></b>
              <small>นักศึกษากลุ่มเสี่ยง</small>
            </div>
          </div>
        </div>
        <div style={{ display:'grid', placeItems: 'center' }}>
          <Donut value={stats.pass / STUDENTS.length}
            label={stats.passRate + "%"} sub={"ผ่านเกณฑ์ " + stats.pass + "/" + STUDENTS.length} size={160} thickness={16}/>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display:'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12 }}>
        <div className="segment">
          <button className={tab === "scores" ? "active" : ""} onClick={() => setTab("scores")}>คะแนน</button>
          <button className={tab === "attendance" ? "active" : ""} onClick={() => setTab("attendance")}>เช็คชื่อเข้าเรียน</button>
          <button className={tab === "remarks" ? "active" : ""} onClick={() => setTab("remarks")}>ข้อเสนอแนะ</button>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap: 10, flex: 1, maxWidth: 360 }}>
          <div style={{ position:'relative', flex: 1 }}>
            <Icon.search width={16} height={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)' }}/>
            <input className="input" style={{ paddingLeft: 36 }} placeholder="ค้นหานักศึกษา / รหัสนักศึกษา" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </div>
        <button className="btn primary" onClick={() => toast && toast("บันทึกข้อมูลทั้งหมดแล้ว")}>
          <Icon.save width={16} height={16}/> บันทึก
        </button>
      </div>

      {/* Scores tab */}
      {tab === "scores" && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>นักศึกษา</th>
                <th style={{ textAlign:'right' }}>เก็บสะสม<br/><span className="eng dim">/30</span></th>
                <th style={{ textAlign:'right' }}>กลางภาค<br/><span className="eng dim">/30</span></th>
                <th style={{ textAlign:'right' }}>ปลายภาค<br/><span className="eng dim">/40</span></th>
                <th style={{ textAlign:'right' }}>รวม<br/><span className="eng dim">/100</span></th>
                <th>เกรด</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const r = data[s.id][subject.id];
                const total = totalScore(r.scores);
                const g = grade(total);
                return (
                  <tr key={s.id}>
                    <td className="num dim">{String(i + 1).padStart(2, "0")}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                        <Avatar name={s.firstName + " " + s.lastName} seed={s.avatarSeed} />
                        <div style={{ lineHeight: 1.2 }}>
                          <div>{s.fullName} <span className="dim">({s.nickname})</span></div>
                          <div className="dim eng" style={{ fontSize: 11 }}>{s.code} · {s.classroom}</div>
                        </div>
                      </div>
                    </td>
                    <td><input className="input num" type="number" value={r.scores.collected} onChange={e => setScore(s.id, "collected", e.target.value)} /></td>
                    <td><input className="input num" type="number" value={r.scores.midterm}   onChange={e => setScore(s.id, "midterm",   e.target.value)} /></td>
                    <td><input className="input num" type="number" value={r.scores.final}     onChange={e => setScore(s.id, "final",     e.target.value)} /></td>
                    <td className="num" style={{ textAlign: 'right', fontWeight: 700, fontSize: 15 }}>{total}</td>
                    <td><span className={"pill " + g.tone}>{g.letter} · {g.gpa.toFixed(1)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Attendance tab */}
      {tab === "attendance" && (
        <div className="card" style={{ padding: 18, overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="muted" style={{ fontSize: 12 }}>คลิกที่ช่องเพื่อสลับสถานะ <span className="pill good" style={{ marginLeft: 8 }}>เข้าเรียน</span> <span className="pill warn">สาย</span> <span className="pill bad">ขาด</span></div>
            <div className="dim" style={{ fontSize: 11 }}>สัปดาห์ที่ 8 = สอบกลางภาค (วันหยุด)</div>
          </div>
          <div className="att-grid">
            <div></div>
            {Array.from({length: 16}, (_,i) => <div key={i} className="head">W{i + 1}</div>)}
            {filtered.map((s) => (
              <React.Fragment key={s.id}>
                <div style={{ display:'flex', alignItems:'center', gap: 10, paddingRight: 8 }}>
                  <Avatar name={s.firstName + " " + s.lastName} seed={s.avatarSeed} size={26}/>
                  <div style={{ lineHeight: 1.1, fontSize: 13 }}>
                    <div>{s.firstName} <span className="dim">({s.nickname})</span></div>
                    <div className="dim eng" style={{ fontSize: 10 }}>{s.code}</div>
                  </div>
                </div>
                {data[s.id][subject.id].attendance.map((st, w) => {
                  const cls = st === "P" ? "present" : st === "L" ? "late" : st === "A" ? "absent" : "holiday";
                  return (
                    <div key={w} className={"att-cell " + cls} onClick={() => cycleAtt(s.id, w)} title={"W" + (w+1)}>
                      {st === "H" ? "·" : st}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Remarks tab */}
      {tab === "remarks" && (
        <div className="grid-2">
          <div className="card" style={{ padding: 18 }}>
            <h3 style={{ marginBottom: 12 }}>ความคิดเห็นรายนักศึกษา</h3>
            <div style={{ display:'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(s => {
                const r = data[s.id][subject.id];
                const isEditing = editingRemark === s.id;
                return (
                  <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 14, alignItems: 'start', padding: '10px 0', borderTop: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <Avatar name={s.firstName + " " + s.lastName} seed={s.avatarSeed} size={28}/>
                      <div style={{ lineHeight: 1.1, fontSize: 13 }}>
                        <div>{s.firstName}</div>
                        <div className="dim" style={{ fontSize: 11 }}>{s.nickname}</div>
                      </div>
                    </div>
                    {isEditing ? (
                      <textarea autoFocus value={remarkDraft} onChange={e => setRemarkDraft(e.target.value)} />
                    ) : (
                      <div style={{ fontSize: 13, color: r.remark ? 'var(--fg-1)' : 'var(--fg-3)', lineHeight: 1.5 }}>
                        {r.remark || "— ยังไม่มีความคิดเห็น —"}
                      </div>
                    )}
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn small primary" onClick={() => saveRemark(s.id)}>บันทึก</button>
                        <button className="btn small" onClick={() => setEditingRemark(null)}>ยกเลิก</button>
                      </div>
                    ) : (
                      <button className="btn small ghost" onClick={() => { setEditingRemark(s.id); setRemarkDraft(r.remark || ""); }}>
                        <Icon.edit width={14} height={14}/> แก้ไข
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card" style={{ padding: 18, height: 'fit-content' }}>
            <div className="h-eyebrow">เคล็ดลับการเขียน</div>
            <h3 style={{ marginBottom: 10 }}>เขียนข้อเสนอแนะที่ดี</h3>
            <ul style={{ paddingLeft: 18, color: 'var(--fg-1)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
              <li>ระบุพฤติกรรมและผลงานที่สังเกตได้</li>
              <li>ชมเชยจุดแข็ง ควบคู่กับข้อเสนอเพื่อพัฒนา</li>
              <li>หลีกเลี่ยงการตัดสินเชิงลบโดยไม่มีข้อเสนอแก้ไข</li>
              <li>เชื่อมโยงกับเกณฑ์การประเมิน (Rubric)</li>
            </ul>
            <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: 'color-mix(in oklab, var(--magenta) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--magenta) 30%, transparent)' }}>
              <div style={{ fontSize: 11, color: 'oklch(0.85 0.1 320)', letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 4 }}>
                <Icon.sparkle width={12} height={12} style={{ verticalAlign: '-2px', marginRight: 4 }}/>
                AI Suggestion
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--fg-1)' }}>
                ระบบสังเกตว่ามีนักศึกษา {stats.atRisk} คน ที่อาจต้องการความช่วยเหลือ
                แนะนำให้บันทึกข้อเสนอแนะเชิงสร้างสรรค์ และนัดติวเสริมในสัปดาห์หน้า
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.TeacherDashboard = TeacherDashboard;
