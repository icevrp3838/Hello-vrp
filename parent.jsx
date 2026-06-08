/* ======================================================
   Parent dashboard — view-only, one child
====================================================== */

function ParentDashboard({ data, child, target }) {
  const { SUBJECTS } = window.VRP_DATA;

  // Compute per-subject stats for child
  const rows = SUBJECTS.map(sub => {
    const r = data[child.id][sub.id];
    const total = totalScore(r.scores);
    const att = attendanceRate(r.attendance);
    return { sub, r, total, att, grade: grade(total) };
  });

  const avg = rows.reduce((a, r) => a + r.total, 0) / rows.length;
  const avgAtt = rows.reduce((a, r) => a + r.att, 0) / rows.length;
  const gpa = rows.reduce((a, r) => a + r.grade.gpa * r.sub.credits, 0) / rows.reduce((a, r) => a + r.sub.credits, 0);
  const passing = rows.filter(r => r.total >= 50).length;

  const radarAxes = SUBJECTS.map(s => ({ label: s.th, short: s.en.split(" ").slice(0, 2).join(" ") }));
  const radarValues = rows.map(r => r.total / 100);
  const targetVals = rows.map(() => target.score / 100);

  return (
    <div className="fade-in">
      {/* Hero with child info */}
      <div className="hero-card" style={{ marginBottom: 18 }}>
        <div>
          <div className="eyebrow">บุตรหลานของท่าน · ภาคต้น 2569</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
            <Avatar name={child.firstName + " " + child.lastName} seed={child.avatarSeed} size={56}/>
            <div>
              <h2 style={{ fontSize: 26, marginBottom: 4 }}>{child.fullName} <span style={{ color: 'var(--fg-2)', fontWeight: 500 }}>({child.nickname})</span></h2>
              <div className="muted" style={{ fontSize: 13 }}>
                <span className="eng">{child.code}</span> · {child.classroom} · {child.program}
              </div>
            </div>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <b style={{ color: 'oklch(0.78 0.22 320)' }}><AnimNum value={gpa} decimals={2}/></b>
              <small>GPA ปัจจุบัน</small>
            </div>
            <div className="hero-stat">
              <b><AnimNum value={avg} decimals={1}/></b>
              <small>คะแนนเฉลี่ย / 100</small>
            </div>
            <div className="hero-stat">
              <b><AnimNum value={avgAtt * 100} decimals={1} suffix="%"/></b>
              <small>อัตราการเข้าเรียน</small>
            </div>
          </div>
        </div>
        <div className="radar-wrap">
          <RadarChart axes={radarAxes} values={radarValues} target={targetVals}/>
        </div>
      </div>

      {/* Goal vs current */}
      <div className="grid-2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="h-eyebrow">ความคืบหน้าทุกรายวิชา</div>
          <h3 style={{ marginBottom: 14 }}>{passing}/{rows.length} รายวิชา ผ่านเกณฑ์</h3>
          <div style={{ display:'flex', flexDirection:'column', gap: 12 }}>
            {rows.map(({ sub, r, total, att, grade: g }) => (
              <div key={sub.id} style={{ display:'grid', gridTemplateColumns: '18px 1.5fr auto 90px auto', gap: 12, alignItems: 'center' }}>
                <span className="subj-dot" style={{ background: sub.color }}/>
                <div style={{ lineHeight: 1.15 }}>
                  <div style={{ fontSize: 13 }}>{sub.th}</div>
                  <div className="dim eng" style={{ fontSize: 10.5 }}>{sub.id} · {sub.en}</div>
                </div>
                <div className="num" style={{ fontWeight: 700, textAlign: 'right' }}>{total}<span className="dim" style={{ fontWeight: 400, fontSize: 11 }}>/100</span></div>
                <HBar value={total} color={`linear-gradient(90deg, ${sub.color}, oklch(0.75 0.18 220))`}/>
                <span className={"pill " + g.tone}>{g.letter}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="h-eyebrow">เป้าหมายภาคการศึกษา</div>
          <h3 style={{ marginBottom: 14 }}>เทียบกับเป้าหมายของผู้ปกครอง</h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <Donut value={avg / 100} label={Math.round(avg) + ""} sub={"จากเป้า " + target.score} size={130} thickness={14}/>
            <div>
              <div className="dim" style={{ fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase' }}>คะแนน</div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {avg >= target.score ? "🎯" : (target.score - avg).toFixed(1) + " ห่างจากเป้า"}
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                {avg >= target.score
                  ? "ทำได้ตามเป้าหมายแล้ว ขอแสดงความยินดี"
                  : "ยังต้องผลักดันอีกเล็กน้อย น้องทำได้แน่นอน"}
              </div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ padding: 12, borderRadius: 12, background: 'color-mix(in oklab, var(--cyan) 8%, transparent)', border: '1px solid var(--line)' }}>
              <div className="dim" style={{ fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase' }}>เข้าเรียน</div>
              <div className="num" style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{Math.round(avgAtt * 100)}%</div>
              <div className="muted" style={{ fontSize: 11 }}>เป้าหมาย {target.attendance}%</div>
            </div>
            <div style={{ padding: 12, borderRadius: 12, background: 'color-mix(in oklab, var(--magenta) 8%, transparent)', border: '1px solid var(--line)' }}>
              <div className="dim" style={{ fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase' }}>GPA</div>
              <div className="num" style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{gpa.toFixed(2)}</div>
              <div className="muted" style={{ fontSize: 11 }}>เป้าหมาย {target.gpa.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance summary */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display:'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <h3>การเข้าเรียนรายสัปดาห์</h3>
          <div className="dim" style={{ fontSize: 11 }}>
            <span className="pill good" style={{ marginRight: 6 }}>เข้าเรียน</span>
            <span className="pill warn" style={{ marginRight: 6 }}>สาย</span>
            <span className="pill bad">ขาด</span>
          </div>
        </div>
        <div className="att-grid">
          <div></div>
          {Array.from({length: 16}, (_, i) => <div key={i} className="head">W{i + 1}</div>)}
          {SUBJECTS.map(sub => (
            <React.Fragment key={sub.id}>
              <div style={{ display:'flex', alignItems:'center', gap: 8, paddingRight: 8 }}>
                <span className="subj-dot" style={{ background: sub.color }}/>
                <div style={{ fontSize: 12, lineHeight: 1.1 }}>
                  <div>{sub.th.length > 22 ? sub.th.slice(0, 22) + "…" : sub.th}</div>
                  <div className="dim eng" style={{ fontSize: 10 }}>{sub.id}</div>
                </div>
              </div>
              {data[child.id][sub.id].attendance.map((st, w) => {
                const cls = st === "P" ? "present" : st === "L" ? "late" : st === "A" ? "absent" : "holiday";
                return <div key={w} className={"att-cell " + cls} style={{ cursor: 'default' }}>{st === "H" ? "·" : st}</div>;
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Teacher remarks */}
      <div className="sec-title"><h2>ข้อเสนอแนะจากอาจารย์</h2><small>เพื่อช่วยให้น้องพัฒนาต่อเนื่อง</small></div>
      <div className="grid-3">
        {rows.filter(r => r.r.remark).slice(0, 6).map(({ sub, r, grade: g }) => (
          <div key={sub.id} className="card">
            <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 10 }}>
              <span className="subj-dot" style={{ background: sub.color, width: 14, height: 14 }}/>
              <div style={{ lineHeight: 1.15 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{sub.th}</div>
                <div className="dim eng" style={{ fontSize: 11 }}>{sub.id} · อ. ผู้สอน</div>
              </div>
              <span className={"pill " + g.tone} style={{ marginLeft: 'auto' }}>{g.letter}</span>
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--fg-1)' }}>"{r.remark}"</div>
          </div>
        ))}
        {rows.filter(r => r.r.remark).length === 0 && (
          <div className="card muted" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 36 }}>
            ยังไม่มีข้อเสนอแนะจากอาจารย์ในขณะนี้
          </div>
        )}
      </div>
    </div>
  );
}

window.ParentDashboard = ParentDashboard;
