/* ======================================================
   Executive dashboard — 3 views: college / teachers / major
====================================================== */

function ExecutiveDashboard({ data, view, setView, offerings, riskScore, riskAttendance, setRiskScore, setRiskAttendance }) {
  if (view === "teachers") return <ExecTeachersView data={data} offerings={offerings} setView={setView} />;
  if (view === "major") return <ExecMajorView data={data} offerings={offerings} riskScore={riskScore} riskAttendance={riskAttendance} setRiskScore={setRiskScore} setRiskAttendance={setRiskAttendance} setView={setView} />;
  return <ExecCollegeView riskScore={riskScore} riskAttendance={riskAttendance} setView={setView} offerings={offerings} />;
}

/* ---------- College overview ---------- */
function ExecCollegeView({ riskScore, riskAttendance, setView, offerings }) {
  const { PROGRAMS, COLLEGE_STATS } = window.VRP_DATA;

  const totalRisk = Object.values(PROGRAMS).reduce(
    (sum, p) => sum + p.categories.reduce((s, c) => s + c.majors.reduce((m, mj) => m + mj.risk, 0), 0), 0
  );
  const allMajors = Object.values(PROGRAMS).flatMap(p => p.categories.flatMap(c => c.majors));
  const avgScore = (allMajors.reduce((s, m) => s + m.avg * m.students, 0) / COLLEGE_STATS.students).toFixed(1);
  const avgAtt = (allMajors.reduce((s, m) => s + m.att * m.students, 0) / COLLEGE_STATS.students).toFixed(1);

  return (
    <div className="fade-in">
      {/* Hero */}
      <div className="hero-card" style={{ marginBottom: 18 }}>
        <div>
          <div className="eyebrow">ภาพรวมสถาบัน · ภาคต้น 2569</div>
          <h2>วิทยาลัยเทคโนโลยีวีรพัฒน์</h2>
          <p>ภาพรวมการเรียนการสอนทุกระดับ ทุกประเภทวิชา และทุกสาขาวิชา</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <b><AnimNum value={COLLEGE_STATS.students} /></b>
              <small>นักศึกษาทั้งหมด</small>
            </div>
            <div className="hero-stat">
              <b><AnimNum value={COLLEGE_STATS.majors} /></b>
              <small>สาขาวิชา</small>
            </div>
            <div className="hero-stat">
              <b style={{ color: 'var(--bad)' }}><AnimNum value={totalRisk} /></b>
              <small>กลุ่มเสี่ยง</small>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {Object.values(PROGRAMS).map(p => {
            const lvlStudents = p.categories.reduce((s, c) => s + c.majors.reduce((m, mj) => m + mj.students, 0), 0);
            const lvlMajors = p.categories.flatMap(c => c.majors).length;
            return (
              <div key={p.id} style={{ padding: 16, borderRadius: 14, background: 'color-mix(in oklab, var(--bg-0) 40%, transparent)', border: '1px solid var(--line)', textAlign: 'center' }}>
                <div className="num" style={{ fontSize: 30, fontWeight: 800, color: p.accent }}>{lvlStudents}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{p.code}</div>
                <div className="dim" style={{ fontSize: 10, marginTop: 2 }}>{lvlMajors} สาขา</div>
              </div>
            );
          })}
          <div style={{ padding: 12, borderRadius: 14, background: 'color-mix(in oklab, var(--bg-0) 40%, transparent)', border: '1px solid var(--line)', textAlign: 'center', gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div>
                <div className="num" style={{ fontSize: 20, fontWeight: 700 }}>{avgScore}</div>
                <div className="dim" style={{ fontSize: 10 }}>คะแนนเฉลี่ย</div>
              </div>
              <div>
                <div className="num" style={{ fontSize: 20, fontWeight: 700 }}>{avgAtt}%</div>
                <div className="dim" style={{ fontSize: 10 }}>เข้าเรียนเฉลี่ย</div>
              </div>
              <div>
                <div className="num" style={{ fontSize: 20, fontWeight: 700, color: 'var(--bad)' }}>{totalRisk}</div>
                <div className="dim" style={{ fontSize: 10 }}>กลุ่มเสี่ยง</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat strip */}
      <div className="stat-grid" style={{ marginBottom: 22 }}>
        <Stat label="นักศึกษาทั้งหมด" value={COLLEGE_STATS.students} suffix=" คน" accent="var(--magenta)" />
        <Stat label="สาขาวิชา" value={COLLEGE_STATS.majors} suffix=" สาขา" accent="var(--cyan)" />
        <Stat label="ห้องเรียน" value={COLLEGE_STATS.classes} suffix=" ห้อง" accent="var(--lime)" />
        <Stat label="กลุ่มเสี่ยง" value={totalRisk} suffix=" คน" accent="var(--red)"
          trend={{ dir: 'up', value: '+3 จากสัปดาห์ก่อน' }} />
      </div>

      {/* Level sections */}
      {Object.values(PROGRAMS).map(prog => (
        <div key={prog.id} style={{ marginBottom: 28 }}>
          <div className="sec-title">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: prog.accent, display: 'inline-block' }} />
              ระดับ {prog.code} — {prog.label}
            </h2>
            <small>
              {prog.categories.flatMap(c => c.majors).length} สาขาวิชา ·{' '}
              {prog.categories.flatMap(c => c.majors).reduce((s, m) => s + m.students, 0)} นักศึกษา
            </small>
          </div>

          {prog.categories.map(cat => (
            <div key={cat.id} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: cat.color, letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: cat.color, display: 'inline-block' }} />
                {cat.full}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(268px, 1fr))', gap: 12 }}>
                {cat.majors.map(m => (
                  <MajorCard key={m.id} major={m} color={cat.color} riskScore={riskScore} riskAttendance={riskAttendance}
                    onDrill={m.active ? () => setView("major") : null} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function MajorCard({ major: m, color, riskScore, riskAttendance, onDrill }) {
  const avgBad = m.avg < riskScore;
  const attBad = m.att < riskAttendance;
  return (
    <div className={"card " + (onDrill ? "glow" : "")}
      onClick={onDrill || undefined}
      style={{ cursor: onDrill ? 'pointer' : 'default', transition: '.2s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `color-mix(in oklab, ${color} 22%, transparent)`, display: 'grid', placeItems: 'center', border: `1px solid color-mix(in oklab, ${color} 35%, transparent)` }}>
            <Icon.cap width={18} height={18} style={{ color }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div>
            <div className="dim" style={{ fontSize: 10.5 }}>{m.short} · {m.classes} ห้อง</div>
          </div>
        </div>
        {m.active && (
          <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, background: 'color-mix(in oklab, var(--lime) 20%, transparent)', color: 'var(--lime)', border: '1px solid color-mix(in oklab, var(--lime) 35%, transparent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--lime)', boxShadow: '0 0 6px var(--lime)' }} />
            เปิดสอนอยู่
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div style={{ textAlign: 'center' }}>
          <div className="num" style={{ fontSize: 20, fontWeight: 700 }}>{m.students}</div>
          <div className="dim" style={{ fontSize: 10 }}>นักศึกษา</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="num" style={{ fontSize: 20, fontWeight: 700, color: avgBad ? 'var(--bad)' : 'inherit' }}>{m.avg}</div>
          <div className="dim" style={{ fontSize: 10 }}>คะแนนเฉลี่ย</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="num" style={{ fontSize: 20, fontWeight: 700, color: attBad ? 'var(--bad)' : 'inherit' }}>{m.att}%</div>
          <div className="dim" style={{ fontSize: 10 }}>เข้าเรียน</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <HBar value={m.avg} color={avgBad ? 'linear-gradient(90deg, var(--bad), oklch(0.60 0.20 30))' : `linear-gradient(90deg, ${color}, oklch(0.75 0.18 220))`} />
        </div>
        {m.risk > 0 && (
          <span className="pill bad" style={{ flexShrink: 0 }}>
            <Icon.alert width={10} height={10} /> {m.risk} เสี่ยง
          </span>
        )}
        {onDrill && (
          <Icon.arrow width={14} height={14} style={{ color: 'var(--fg-3)', flexShrink: 0 }} />
        )}
      </div>
    </div>
  );
}

/* ---------- Teachers view ---------- */
function ExecTeachersView({ data, offerings, setView }) {
  const { TEACHERS } = window.VRP_DATA;
  const [query, setQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const filtered = TEACHERS.filter(t =>
    !query ||
    t.name.includes(query) ||
    t.spec.toLowerCase().includes(query.toLowerCase()) ||
    t.email.includes(query)
  );

  if (selectedTeacher) {
    return <TeacherProfile teacher={selectedTeacher} data={data} offerings={offerings} onBack={() => setSelectedTeacher(null)} />;
  }

  const totalCredits = TEACHERS.reduce((sum, t) => sum + offerings.filter(o => o.teacherId === t.id).reduce((s, o) => s + o.credits, 0), 0);

  return (
    <div className="fade-in">
      <div className="hero-card" style={{ marginBottom: 18 }}>
        <div>
          <div className="eyebrow">บุคลากร · ทีมอาจารย์ผู้สอน</div>
          <h2>อาจารย์ผู้สอน</h2>
          <p>รายชื่ออาจารย์ประจำวิทยาลัย พร้อมข้อมูลภาระการสอนและสถิติ</p>
          <div className="hero-stats">
            <div className="hero-stat"><b><AnimNum value={TEACHERS.length} /></b><small>อาจารย์ทั้งหมด</small></div>
            <div className="hero-stat"><b><AnimNum value={offerings.length} /></b><small>รายวิชาที่สอน</small></div>
            <div className="hero-stat"><b><AnimNum value={totalCredits} /></b><small>หน่วยกิตรวม</small></div>
          </div>
        </div>
        <div style={{ display: 'grid', placeItems: 'center' }}>
          <Donut value={TEACHERS.length / 16} label={TEACHERS.length + ""} sub="อาจารย์" size={150} thickness={14} />
        </div>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
        <Icon.search width={16} height={16} style={{ color: 'var(--fg-3)', flexShrink: 0 }} />
        <input className="input"
          style={{ border: 0, background: 'transparent', padding: 0, flex: 1, outline: 'none' }}
          placeholder="ค้นหาชื่ออาจารย์ / ความเชี่ยวชาญ / อีเมล"
          value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      {/* Teacher grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
        {filtered.map(t => {
          const myOfferings = offerings.filter(o => o.teacherId === t.id);
          const credits = myOfferings.reduce((s, o) => s + o.credits, 0);
          const students = myOfferings.reduce((s, o) => s + o.students, 0);
          const loadWarn = credits > 18 || (credits > 0 && credits < 12);
          const loadPct = Math.min(100, (credits / 18) * 100);
          return (
            <div key={t.id} className="card" style={{ cursor: 'pointer', transition: '.18s' }}
              onClick={() => setSelectedTeacher(t)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <Avatar name={t.name} seed={t.avatar} size={48} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                  <div className="dim eng" style={{ fontSize: 11 }}>{t.email}</div>
                  <span className="pill info" style={{ fontSize: 10, marginTop: 4, display: 'inline-flex' }}>{t.spec}</span>
                </div>
                <Icon.arrow width={14} height={14} style={{ color: 'var(--fg-3)', flexShrink: 0 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                {[
                  { v: myOfferings.length, l: 'รายวิชา' },
                  { v: credits, l: 'หน่วยกิต', bad: loadWarn },
                  { v: students, l: 'นักศึกษา' },
                ].map(({ v, l, bad }) => (
                  <div key={l} style={{ textAlign: 'center', padding: '8px 6px', borderRadius: 10, background: 'color-mix(in oklab, var(--bg-0) 40%, transparent)' }}>
                    <div className="num" style={{ fontWeight: 700, color: bad ? 'var(--warn)' : 'inherit' }}>{v}</div>
                    <div className="dim" style={{ fontSize: 10 }}>{l}</div>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--fg-3)', marginBottom: 5 }}>
                  <span>ภาระการสอน</span>
                  <span style={{ color: loadWarn ? (credits > 18 ? 'var(--bad)' : 'var(--warn)') : 'var(--good)' }}>
                    {credits > 18 ? 'เกินเกณฑ์' : credits < 12 ? 'ต่ำกว่าเกณฑ์' : 'ปกติ'}
                  </span>
                </div>
                <div className="bar">
                  <i style={{ width: loadPct + '%', background: loadWarn ? (credits > 18 ? 'var(--bad)' : 'var(--warn)') : 'var(--grad-hero)' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TeacherProfile({ teacher: t, data, offerings, onBack }) {
  const { SUBJECTS, STUDENTS } = window.VRP_DATA;
  const myOfferings = offerings.filter(o => o.teacherId === t.id);
  const credits = myOfferings.reduce((s, o) => s + o.credits, 0);
  const students = myOfferings.reduce((s, o) => s + o.students, 0);
  const loadColor = credits > 18 ? 'var(--bad)' : credits < 12 && credits > 0 ? 'var(--warn)' : 'var(--good)';
  const loadLabel = credits > 18 ? '⚠ เกินเกณฑ์ (>18 นก.)' : credits < 12 && credits > 0 ? '⚠ ต่ำกว่าเกณฑ์ (<12 นก.)' : '✓ ภาระการสอนปกติ';

  // For DBT teachers: show actual student data
  const isDbtTeacher = myOfferings.some(o => o.majorId === "hvd-dbt");
  const dbtSubjects = isDbtTeacher ? SUBJECTS.filter(sub => myOfferings.some(o => o.majorId === "hvd-dbt" && o.name === sub.th)) : [];
  const avgScore = isDbtTeacher && dbtSubjects.length > 0
    ? (STUDENTS.reduce((sum, s) => sum + dbtSubjects.reduce((a, sub) => a + totalScore(data[s.id][sub.id].scores), 0) / dbtSubjects.length, 0) / STUDENTS.length).toFixed(1)
    : null;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button className="btn ghost" onClick={onBack} style={{ padding: '8px 12px', display: 'flex', gap: 6, alignItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></svg>
          ย้อนกลับ
        </button>
        <div className="dim" style={{ fontSize: 12 }}>อาจารย์ผู้สอน / {t.name}</div>
      </div>

      <div className="hero-card" style={{ marginBottom: 18 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16 }}>
            <Avatar name={t.name} seed={t.avatar} size={64} />
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>โปรไฟล์อาจารย์</div>
              <h2 style={{ fontSize: 24, marginBottom: 4 }}>{t.name}</h2>
              <div className="muted" style={{ fontSize: 13 }}>
                <span className="eng">{t.id}</span> · <span className="eng">{t.email}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <span className="pill info">{t.spec}</span>
              </div>
            </div>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><b><AnimNum value={myOfferings.length} /></b><small>รายวิชาที่สอน</small></div>
            <div className="hero-stat"><b style={{ color: loadColor }}><AnimNum value={credits} /></b><small>หน่วยกิตรวม</small></div>
            <div className="hero-stat"><b><AnimNum value={students} /></b><small>นักศึกษาในความดูแล</small></div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <Donut value={Math.min(1, credits / 18)} label={credits + ""} sub="/ 18 นก." size={140} thickness={14}
            color={credits > 18 ? 'var(--bad)' : credits < 12 && credits > 0 ? 'var(--warn)' : 'url(#donutGrad)'} />
          <div style={{ fontSize: 11, color: loadColor, textAlign: 'center' }}>{loadLabel}</div>
        </div>
      </div>

      {/* Subject table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>รายวิชาที่สอนทั้งหมด</h3>
            <div className="muted" style={{ fontSize: 12 }}>{myOfferings.length} รายการ</div>
          </div>
          {avgScore && (
            <div style={{ textAlign: 'right' }}>
              <div className="num" style={{ fontSize: 22, fontWeight: 700, color: 'var(--magenta)' }}>{avgScore}</div>
              <div className="dim" style={{ fontSize: 11 }}>คะแนนเฉลี่ยนักศึกษา</div>
            </div>
          )}
        </div>
        {myOfferings.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--fg-3)' }}>
            <Icon.book width={32} height={32} style={{ opacity: .4, display: 'block', margin: '0 auto 10px' }} />
            ยังไม่มีรายวิชาที่สอนในภาคเรียนนี้
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>รหัสวิชา</th>
                <th>ชื่อวิชา</th>
                <th>สาขา · ระดับ</th>
                <th>ตารางเรียน</th>
                <th>ห้อง</th>
                <th style={{ textAlign: 'right' }}>นศ.</th>
              </tr>
            </thead>
            <tbody>
              {myOfferings.map(o => (
                <tr key={o.id}>
                  <td className="eng mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{o.code}</td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{o.name}</div>
                    <div className="dim" style={{ fontSize: 11 }}>{o.credits} นก. · ปี {o.year} กลุ่ม {o.group}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="subj-dot" style={{ background: o.majorColor }} />
                      <div>
                        <div style={{ fontSize: 12 }}>{o.majorName}</div>
                        <div className="dim" style={{ fontSize: 10.5 }}>{o.levelCode}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12 }}>{o.schedule}</td>
                  <td className="eng" style={{ fontSize: 12 }}>{o.room}</td>
                  <td className="num" style={{ textAlign: 'right' }}>{o.students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ---------- Major drill-down (hvd-dbt) ---------- */
function ExecMajorView({ data, offerings, riskScore, riskAttendance, setRiskScore, setRiskAttendance, setView }) {
  const { SUBJECTS, STUDENTS } = window.VRP_DATA;
  const [sortBy, setSortBy] = useState("total");

  const studentStats = useMemo(() => {
    return STUDENTS.map(s => {
      const rows = SUBJECTS.map(sub => {
        const r = data[s.id][sub.id];
        const total = totalScore(r.scores);
        const att = attendanceRate(r.attendance);
        return { sub, total, att, grade: grade(total) };
      });
      const avgScore = rows.reduce((a, r) => a + r.total, 0) / rows.length;
      const avgAtt = rows.reduce((a, r) => a + r.att, 0) / rows.length;
      const gpa = rows.reduce((a, r) => a + r.grade.gpa * r.sub.credits, 0) / rows.reduce((a, r) => a + r.sub.credits, 0);
      const isRisk = avgScore < riskScore || (avgAtt * 100) < riskAttendance;
      return { ...s, avgScore, avgAtt, gpa, isRisk, rows };
    });
  }, [data, riskScore, riskAttendance]);

  const riskStudents = studentStats.filter(s => s.isRisk);
  const topStudents = studentStats.filter(s => !s.isRisk).sort((a, b) => b.gpa - a.gpa).slice(0, 5);

  const subjectStats = useMemo(() => SUBJECTS.map(sub => {
    const scores = STUDENTS.map(s => totalScore(data[s.id][sub.id].scores));
    const atts = STUDENTS.map(s => attendanceRate(data[s.id][sub.id].attendance));
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const avgAtt = atts.reduce((a, b) => a + b, 0) / atts.length;
    return { sub, avg, avgAtt };
  }), [data]);

  const sorted = [...studentStats].sort((a, b) => {
    if (sortBy === "total") return b.avgScore - a.avgScore;
    if (sortBy === "att") return b.avgAtt - a.avgAtt;
    return a.firstName.localeCompare(b.firstName, 'th');
  });

  const classAvgScore = (studentStats.reduce((s, st) => s + st.avgScore, 0) / studentStats.length).toFixed(1);
  const classAvgAtt = (studentStats.reduce((s, st) => s + st.avgAtt * 100, 0) / studentStats.length).toFixed(1);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button className="btn ghost" onClick={() => setView("college")} style={{ padding: '8px 12px', display: 'flex', gap: 6, alignItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></svg>
          ย้อนกลับ
        </button>
        <div className="dim" style={{ fontSize: 12 }}>ภาพรวมวิทยาลัย / ปวส. เทคโนโลยีธุรกิจดิจิทัล</div>
      </div>

      {/* Hero */}
      <div className="hero-card" style={{ marginBottom: 18 }}>
        <div>
          <div className="eyebrow">ปวส. · เทคโนโลยีธุรกิจดิจิทัล (DBT)</div>
          <h2>สาขาวิชา DBT · ชั้นปีที่ 2</h2>
          <p>ข้อมูลเชิงลึกรายนักศึกษา {STUDENTS.length} คน ครอบคลุม {SUBJECTS.length} รายวิชา</p>
          <div className="hero-stats">
            <div className="hero-stat"><b><AnimNum value={STUDENTS.length} /></b><small>นักศึกษา</small></div>
            <div className="hero-stat"><b><AnimNum value={Number(classAvgScore)} decimals={1} /></b><small>คะแนนเฉลี่ย</small></div>
            <div className="hero-stat"><b style={{ color: 'var(--bad)' }}><AnimNum value={riskStudents.length} /></b><small>กลุ่มเสี่ยง</small></div>
          </div>
        </div>
        <div style={{ display: 'grid', placeItems: 'center' }}>
          <Donut
            value={studentStats.length > 0 ? 1 - riskStudents.length / studentStats.length : 1}
            label={Math.round((1 - riskStudents.length / studentStats.length) * 100) + "%"}
            sub="ผ่านเกณฑ์"
            size={160} thickness={16} />
        </div>
      </div>

      {/* Risk threshold controls */}
      <div className="card" style={{ padding: 18, marginBottom: 14, display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 20, alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-3)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            <span>เกณฑ์คะแนนกลุ่มเสี่ยง</span>
            <span className="num" style={{ color: 'var(--magenta)' }}>{'<'} {riskScore}</span>
          </div>
          <input type="range" min={30} max={80} step={1} value={riskScore}
            onChange={e => setRiskScore(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'oklch(0.72 0.25 340)', cursor: 'pointer' }} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-3)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            <span>เกณฑ์เข้าเรียน</span>
            <span className="num" style={{ color: 'var(--cyan)' }}>{'<'} {riskAttendance}%</span>
          </div>
          <input type="range" min={50} max={100} step={1} value={riskAttendance}
            onChange={e => setRiskAttendance(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'oklch(0.80 0.16 200)', cursor: 'pointer' }} />
        </div>
        <div style={{ textAlign: 'center', padding: '8px 16px', borderRadius: 14, background: 'color-mix(in oklab, var(--bad) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--bad) 30%, transparent)' }}>
          <div className="num" style={{ fontSize: 28, fontWeight: 800, color: 'var(--bad)' }}>{riskStudents.length}</div>
          <div className="dim" style={{ fontSize: 11 }}>เสี่ยง</div>
        </div>
      </div>

      {/* Risk + Top grids */}
      <div className="grid-2" style={{ marginBottom: 18 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ color: 'var(--bad)' }}>นักศึกษากลุ่มเสี่ยง</h3>
              <div className="dim" style={{ fontSize: 11 }}>ต้องการความช่วยเหลือ</div>
            </div>
            <span className="pill bad">{riskStudents.length} คน</span>
          </div>
          <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {riskStudents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--fg-3)' }}>
                <Icon.check width={28} height={28} style={{ display: 'block', margin: '0 auto 8px', color: 'var(--good)', opacity: .8 }} />
                ไม่มีนักศึกษากลุ่มเสี่ยงในขณะนี้
              </div>
            ) : riskStudents.map(s => {
              const scoreFlag = s.avgScore < riskScore;
              const attFlag = (s.avgAtt * 100) < riskAttendance;
              return (
                <div key={s.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                  <Avatar name={s.firstName + " " + s.lastName} seed={s.avatarSeed} size={34} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13 }}>{s.fullName} <span className="dim">({s.nickname})</span></div>
                    <div style={{ display: 'flex', gap: 5, marginTop: 3, flexWrap: 'wrap' }}>
                      {scoreFlag && <span className="pill bad" style={{ fontSize: 10 }}>คะแนนต่ำ {s.avgScore.toFixed(0)}</span>}
                      {attFlag && <span className="pill warn" style={{ fontSize: 10 }}>ขาดบ่อย {Math.round(s.avgAtt * 100)}%</span>}
                    </div>
                  </div>
                  <div className="num" style={{ fontSize: 18, fontWeight: 700, color: 'var(--bad)' }}>{s.avgScore.toFixed(0)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ color: 'var(--good)' }}>นักศึกษาดีเด่น</h3>
              <div className="dim" style={{ fontSize: 11 }}>ผลการเรียนดีเยี่ยม</div>
            </div>
            <span className="pill good">{topStudents.length} คน</span>
          </div>
          <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topStudents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--fg-3)' }}>ยังไม่มีข้อมูล</div>
            ) : topStudents.map((s, i) => (
              <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '22px auto 1fr auto', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                <div className="num" style={{ fontSize: 12, color: i === 0 ? 'var(--amber)' : 'var(--fg-3)', fontWeight: 700, textAlign: 'center' }}>
                  {i === 0 ? '★' : i + 1}
                </div>
                <Avatar name={s.firstName + " " + s.lastName} seed={s.avatarSeed} size={34} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13 }}>{s.fullName} <span className="dim">({s.nickname})</span></div>
                  <div className="dim" style={{ fontSize: 11 }}>GPA {s.gpa.toFixed(2)} · เข้าเรียน {Math.round(s.avgAtt * 100)}%</div>
                </div>
                <span className="pill good" style={{ fontSize: 10 }}>{s.avgScore.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subject performance */}
      <div className="sec-title">
        <h2>ผลการเรียนรายวิชา</h2>
        <small>คะแนนเฉลี่ยและอัตราการเข้าเรียนทั้งชั้น</small>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>รายวิชา</th>
              <th style={{ textAlign: 'right' }}>คะแนนเฉลี่ย</th>
              <th style={{ minWidth: 130 }}>แถบคะแนน</th>
              <th style={{ textAlign: 'right' }}>เข้าเรียน</th>
              <th>เกรด</th>
            </tr>
          </thead>
          <tbody>
            {subjectStats.map(({ sub, avg, avgAtt }) => {
              const g = grade(avg);
              const attPct = avgAtt * 100;
              return (
                <tr key={sub.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="subj-dot" style={{ background: sub.color }} />
                      <div>
                        <div style={{ fontSize: 13 }}>{sub.th}</div>
                        <div className="dim eng" style={{ fontSize: 11 }}>{sub.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="num" style={{ textAlign: 'right', fontWeight: 700 }}>{avg.toFixed(1)}</td>
                  <td><HBar value={avg} color={`linear-gradient(90deg, ${sub.color}, oklch(0.75 0.18 220))`} /></td>
                  <td className="num" style={{ textAlign: 'right', color: attPct < riskAttendance ? 'var(--bad)' : 'inherit' }}>{attPct.toFixed(1)}%</td>
                  <td><span className={"pill " + g.tone}>{g.letter}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Full student list */}
      <div className="sec-title">
        <h2>รายชื่อนักศึกษาทั้งหมด</h2>
        <div className="segment">
          <button className={sortBy === "total" ? "active" : ""} onClick={() => setSortBy("total")}>คะแนน</button>
          <button className={sortBy === "att" ? "active" : ""} onClick={() => setSortBy("att")}>เข้าเรียน</button>
          <button className={sortBy === "name" ? "active" : ""} onClick={() => setSortBy("name")}>ชื่อ</button>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 50 }}>#</th>
              <th>นักศึกษา</th>
              <th style={{ textAlign: 'right' }}>คะแนนเฉลี่ย</th>
              <th style={{ textAlign: 'right' }}>เข้าเรียน</th>
              <th style={{ textAlign: 'right' }}>GPA</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => (
              <tr key={s.id}>
                <td className="num dim">{i + 1}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={s.firstName + " " + s.lastName} seed={s.avatarSeed} />
                    <div>
                      <div style={{ fontSize: 13 }}>{s.fullName} <span className="dim">({s.nickname})</span></div>
                      <div className="dim eng" style={{ fontSize: 11 }}>{s.code} · {s.classroom}</div>
                    </div>
                  </div>
                </td>
                <td className="num" style={{ textAlign: 'right', fontWeight: 700, color: s.avgScore < riskScore ? 'var(--bad)' : 'inherit' }}>
                  {s.avgScore.toFixed(1)}
                </td>
                <td className="num" style={{ textAlign: 'right', color: (s.avgAtt * 100) < riskAttendance ? 'var(--bad)' : 'inherit' }}>
                  {Math.round(s.avgAtt * 100)}%
                </td>
                <td className="num" style={{ textAlign: 'right' }}>{s.gpa.toFixed(2)}</td>
                <td>
                  {s.isRisk
                    ? <span className="pill bad"><Icon.alert width={10} height={10} /> เสี่ยง</span>
                    : <span className="pill good">ปกติ</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

window.ExecutiveDashboard = ExecutiveDashboard;
