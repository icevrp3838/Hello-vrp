/* ======================================================
   App shell — orchestrates login, role, sidebar, tweaks
====================================================== */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "density": "comfort",
  "riskScore": 50,
  "riskAttendance": 80,
  "targetScore": 75,
  "targetAttendance": 90,
  "targetGpa": 3.0,
  "showAurora": true
}/*EDITMODE-END*/;

function App() {
  const { SUBJECTS, STUDENTS, DATA: INITIAL_DATA, PARENT_LINK, COURSE_OFFERINGS: INITIAL_OFFERINGS } = window.VRP_DATA;

  // ---- Persistence layer (localStorage). Falls back to seed mock data. ----
  // When deployed with the Cloudflare D1 backend, swap loadStore/saveStore
  // for the API client in db.js (see backend/README).
  const STORE_KEY = "vrp.store.v1";
  const loadStore = (key, seed) => {
    try {
      const raw = localStorage.getItem(STORE_KEY + "." + key);
      return raw ? JSON.parse(raw) : seed;
    } catch (e) { return seed; }
  };
  const saveStore = (key, val) => {
    try { localStorage.setItem(STORE_KEY + "." + key, JSON.stringify(val)); } catch (e) {}
  };

  const [currentUser, setCurrentUser] = useState(null); // null = login screen
  const role = currentUser?.role || null;
  const [execView, setExecView] = useState("college"); // college | major | teachers
  const [subjectId, setSubjectId] = useState(SUBJECTS[0].id);
  const [data, setData] = useState(() => loadStore("data", INITIAL_DATA));
  const [offerings, setOfferings] = useState(() => loadStore("offerings", INITIAL_OFFERINGS));
  const [Toast, setToast] = useToast();
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Persist on change
  useEffect(() => { saveStore("data", data); }, [data]);
  useEffect(() => { saveStore("offerings", offerings); }, [offerings]);

  // Detect whether a real backend (Cloudflare D1) is reachable
  const [apiMode, setApiMode] = useState("local");
  useEffect(() => {
    if (window.VRPApi && window.VRPApi.probe) {
      window.VRPApi.probe().then(() => setApiMode(window.VRPApi.mode));
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tweaks.theme || "dark");
    document.documentElement.setAttribute("data-density", tweaks.density || "comfort");
  }, [tweaks.theme, tweaks.density]);

  const subject = SUBJECTS.find(s => s.id === subjectId) || SUBJECTS[0];
  const target = { score: tweaks.targetScore, attendance: tweaks.targetAttendance, gpa: tweaks.targetGpa };

  // Sidebar content depends on role
  const renderSidebar = () => {
    if (role === "teacher") {
      return (
        <>
          <div className="side-section">การจัดการรายวิชา</div>
          <div className="side-item active"><Icon.book className="ic"/> คลาสที่สอน <span className="badge">9</span></div>
          <div className="side-item"><Icon.users className="ic"/> รายชื่อนักศึกษา</div>
          <div className="side-item"><Icon.chart className="ic"/> รายงานสรุป</div>

          <div className="side-section">รายวิชาทั้งหมด</div>
          {SUBJECTS.map(s => (
            <div key={s.id} className={"subject-pill " + (s.id === subjectId ? "active" : "")} onClick={() => setSubjectId(s.id)}>
              <span className="dot" style={{ background: s.color }}/>
              <div style={{ minWidth: 0, lineHeight: 1.15 }}>
                <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.th}</div>
                <div className="dim eng" style={{ fontSize: 10 }}>{s.id}</div>
              </div>
            </div>
          ))}
        </>
      );
    }
    if (role === "parent") {
      const child = PARENT_LINK;
      return (
        <>
          <div className="side-section">บุตรหลานของท่าน</div>
          <div className="side-item active" style={{ alignItems: 'flex-start', padding: '12px' }}>
            <Avatar name={child.firstName + " " + child.lastName} seed={child.avatarSeed} size={40}/>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontWeight: 600 }}>{child.firstName}</div>
              <div className="dim" style={{ fontSize: 11 }}>{child.nickname} · {child.classroom}</div>
              <div className="dim eng" style={{ fontSize: 10 }}>{child.code}</div>
            </div>
          </div>
          <div className="side-section">เมนู</div>
          <div className="side-item active"><Icon.dash className="ic"/> ภาพรวม</div>
          <div className="side-item"><Icon.chart className="ic"/> ผลการเรียนรายวิชา</div>
          <div className="side-item"><Icon.check className="ic"/> การเข้าเรียน</div>
          <div className="side-item"><Icon.heart className="ic"/> ข้อเสนอแนะ</div>
          <div className="side-item"><Icon.bell className="ic"/> การแจ้งเตือน <span className="badge">3</span></div>

          <div style={{ marginTop: 24, padding: 14, borderRadius: 14, background: 'linear-gradient(135deg, color-mix(in oklab, var(--magenta) 18%, transparent), color-mix(in oklab, var(--cyan) 12%, transparent))', border: '1px solid var(--line)' }}>
            <div style={{ fontSize: 11, color: 'oklch(0.86 0.10 320)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 6 }}>เคล็ดลับ</div>
            <div style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--fg-1)' }}>
              ปรับเป้าหมายและธีมได้จาก Tweaks panel ด้านล่างขวา
            </div>
          </div>
        </>
      );
    }
    if (role === "academic") {
      const { PROGRAMS, TEACHERS } = window.VRP_DATA;
      const offeringsByMajor = {};
      offerings.forEach(o => { offeringsByMajor[o.majorId] = (offeringsByMajor[o.majorId] || 0) + 1; });
      return (
        <>
          <div className="side-section">เมนูงานวิชาการ</div>
          <div className="side-item active"><Icon.book className="ic"/> รายวิชาที่เปิดสอน <span className="badge">{offerings.length}</span></div>
          <div className="side-item"><Icon.users className="ic"/> อาจารย์ผู้สอน <span className="badge">{TEACHERS.length}</span></div>
          <div className="side-item"><Icon.cap className="ic"/> หลักสูตร</div>
          <div className="side-item"><Icon.chart className="ic"/> ภาระการสอน</div>

          {Object.values(PROGRAMS).map(level => (
            <React.Fragment key={level.id}>
              <div className="side-section" style={{ display:'flex', alignItems:'center', gap: 6 }}>
                <span style={{ display:'inline-block', width: 6, height: 6, borderRadius: 2, background: level.accent }}/>
                ระดับ {level.code}
              </div>
              {level.categories.map(c => c.majors.map(m => (
                <div key={m.id} className="subject-pill">
                  <span className="dot" style={{ background: c.color }}/>
                  <div style={{ minWidth: 0, lineHeight: 1.15, flex: 1 }}>
                    <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize: 12 }}>{m.name}</div>
                    <div className="dim" style={{ fontSize: 10 }}>{offeringsByMajor[m.id] || 0} รายวิชา</div>
                  </div>
                </div>
              )))}
            </React.Fragment>
          ))}

          <div style={{ marginTop: 18, padding: 14, borderRadius: 14, background: 'color-mix(in oklab, var(--amber) 14%, transparent)', border: '1px solid color-mix(in oklab, var(--amber) 25%, transparent)' }}>
            <div style={{ fontSize: 11, color: 'var(--amber)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 6, display:'flex', alignItems:'center', gap: 4 }}>
              <Icon.sparkle width={12} height={12}/> ภาคเรียน 1/2569
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--fg-1)' }}>
              ยังเหลือ 4 สัปดาห์ก่อนปิดภาคเรียน · เริ่มเตรียมข้อมูลสำหรับภาคเรียน 2/2569
            </div>
          </div>
        </>
      );
    }
    if (role === "executive") {
      const { PROGRAMS } = window.VRP_DATA;
      return (
        <>
          <div className="side-section">มุมมอง</div>
          <div className={"side-item " + (execView === "college" ? "active" : "")} onClick={() => setExecView("college")}>
            <Icon.dash className="ic"/> ภาพรวมวิทยาลัย
          </div>
          <div className={"side-item " + (execView === "teachers" ? "active" : "")} onClick={() => setExecView("teachers")}>
            <Icon.users className="ic"/> อาจารย์ผู้สอน <span className="badge">{window.VRP_DATA.TEACHERS.length}</span>
          </div>
          <div className={"side-item " + (execView === "major" ? "active" : "")} onClick={() => setExecView("major")}>
            <Icon.chart className="ic"/> เจาะรายสาขา <span className="badge">DBT</span>
          </div>
          <div className="side-item"><Icon.alert className="ic"/> กลุ่มเสี่ยง <span className="badge">!</span></div>

          {Object.values(PROGRAMS).map(level => (
            <React.Fragment key={level.id}>
              <div className="side-section" style={{ display:'flex', alignItems:'center', gap: 6 }}>
                <span style={{ display:'inline-block', width: 6, height: 6, borderRadius: 2, background: level.accent }}/>
                ระดับ {level.code}
              </div>
              {level.categories.map(c => (
                <React.Fragment key={c.id}>
                  <div style={{ padding: '6px 12px 2px', fontSize: 10.5, color: 'var(--fg-3)', letterSpacing: '.04em' }}>
                    {c.name}
                  </div>
                  {c.majors.map(m => (
                    <div key={m.id} className={"subject-pill " + (m.active && execView === "major" ? "active" : "")}
                         onClick={() => m.active && setExecView("major")}
                         style={{ opacity: m.active ? 1 : 0.7 }}>
                      <span className="dot" style={{ background: c.color }}/>
                      <div style={{ minWidth: 0, lineHeight: 1.15, flex: 1 }}>
                        <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize: 12 }}>{m.name}</div>
                        <div className="dim" style={{ fontSize: 10 }}>{m.students} คน · {m.classes} ห้อง</div>
                      </div>
                      {m.active && <span style={{ width: 6, height: 6, borderRadius: 50, background: 'var(--lime)', boxShadow: '0 0 6px var(--lime)' }}/>}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}

          <div style={{ marginTop: 18, padding: 14, borderRadius: 14, background: 'color-mix(in oklab, var(--bad) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--bad) 25%, transparent)' }}>
            <div style={{ fontSize: 11, color: 'var(--bad)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 6, display:'flex', alignItems:'center', gap: 4 }}>
              <Icon.alert width={12} height={12}/> Action needed
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--fg-1)' }}>
              มีนักศึกษากลุ่มเสี่ยงเพิ่มขึ้นในสัปดาห์นี้ ควรนัดประชุมอาจารย์ที่ปรึกษา
            </div>
          </div>
        </>
      );
    }
    return null;
  };

  const renderMain = () => {
    if (role === "teacher") return <TeacherDashboard data={data} setData={setData} subjectId={subjectId} setSubjectId={setSubjectId} toast={setToast}/>;
    if (role === "parent")  return <ParentDashboard data={data} child={PARENT_LINK} target={target}/>;
    if (role === "executive") return <ExecutiveDashboard
                                       data={data}
                                       view={execView}
                                       setView={setExecView}
                                       offerings={offerings}
                                       riskScore={tweaks.riskScore}
                                       riskAttendance={tweaks.riskAttendance}
                                       setRiskScore={(v) => setTweak("riskScore", v)}
                                       setRiskAttendance={(v) => setTweak("riskAttendance", v)}/>;
    if (role === "academic") return <AcademicDashboard offerings={offerings} setOfferings={setOfferings} toast={setToast}/>;
    return null;
  };

  if (!role) return (
    <>
      <div className="aurora"/>
      <div className="grain"/>
      <Login onLogin={setCurrentUser}/>
    </>
  );

  const roleMeta = {
    teacher:   { label: "อาจารย์",     icon: <Icon.edit width={14} height={14}/> },
    parent:    { label: "ผู้ปกครอง",   icon: <Icon.heart width={14} height={14}/> },
    executive: { label: "ผู้บริหาร",   icon: <Icon.chart width={14} height={14}/> },
    academic:  { label: "งานวิชาการ",  icon: <Icon.book width={14} height={14}/> },
  };
  const meName = currentUser.name;
  const meRoleLabel = currentUser.roleLabel;
  const meSubtitle = currentUser.subtitle;

  return (
    <>
      {tweaks.showAurora && <div className="aurora"/>}
      <div className="grain"/>
      <div className="app">
        <header className="topbar">
          <div style={{ display:'flex', alignItems: 'center', gap: 20 }}>
            <div className="brand">
              <div className="brand-mark"><span>V</span></div>
              <div className="brand-text">
                <b>VRP Progress</b>
                <small>วิทยาลัยเทคโนโลยีวีรพัฒน์</small>
              </div>
            </div>
            <div className="semester-pill"><span className="dot"/> ภาคต้น <span className="eng">2569</span> · สัปดาห์ที่ 12/16</div>
            <div className="semester-pill" title={apiMode === "api" ? "เชื่อมต่อฐานข้อมูล Cloudflare D1" : "โหมดออฟไลน์ · บันทึกในเครื่อง (localStorage)"}>
              <span className="dot" style={{ background: apiMode === "api" ? "var(--lime)" : "var(--amber)", boxShadow: apiMode === "api" ? "0 0 10px var(--lime)" : "0 0 10px var(--amber)" }}/>
              <span className="eng" style={{ fontSize: 11 }}>{apiMode === "api" ? "DB Connected" : "Local Mode"}</span>
            </div>
          </div>
          <div className="tb-right">
            <button className="btn ghost" style={{ padding: '7px 10px' }} title="แจ้งเตือน">
              <Icon.bell width={16} height={16}/>
              <span style={{ position: 'absolute', width: 7, height: 7, borderRadius: '50%', background: 'var(--bad)', marginLeft: -4, marginTop: -10, boxShadow: '0 0 6px var(--bad)' }}/>
            </button>
            <div style={{ display:'flex', alignItems:'center', gap: 10, paddingLeft: 14, borderLeft: '1px solid var(--line)' }}>
              <Avatar name={meName} seed={({teacher:1, parent:2, executive:3, academic:4})[role]} size={36}/>
              <div style={{ lineHeight: 1.15 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{meName}</div>
                <div className="dim" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span className="pill info" style={{ fontSize: 10, padding: '1px 7px' }}>{roleMeta[role].icon} {meRoleLabel}</span>
                </div>
              </div>
            </div>
            <button className="btn ghost" style={{ padding: '8px 12px', display:'flex', gap: 6, alignItems: 'center' }} onClick={() => { window.VRPApi && window.VRPApi.logout(); setCurrentUser(null); setExecView("college"); }} title="ออกจากระบบ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 3h5a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-5"/><path d="m10 17-5-5 5-5"/><path d="M5 12h12"/></svg>
              <span style={{ fontSize: 12 }}>ออกจากระบบ</span>
            </button>
          </div>
        </header>

        <aside className="sidebar">
          {renderSidebar()}
        </aside>

        <main className="main" key={role}>
          {renderMain()}
        </main>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="ลักษณะหน้าจอ">
          <TweakRadio label="โหมดสี"
            value={tweaks.theme}
            onChange={(v) => setTweak("theme", v)}
            options={[{label: "Dark", value: "dark"}, {label: "Light", value: "light"}]}/>
          <TweakRadio label="ความหนาแน่น"
            value={tweaks.density}
            onChange={(v) => setTweak("density", v)}
            options={[{label: "Comfort", value: "comfort"}, {label: "Compact", value: "compact"}]}/>
          <TweakToggle label="พื้นหลัง Aurora"
            value={tweaks.showAurora} onChange={(v) => setTweak("showAurora", v)}/>
        </TweakSection>

        <TweakSection label="เกณฑ์กลุ่มเสี่ยง (ผู้บริหาร)">
          <TweakSlider label="คะแนนขั้นต่ำ"
            min={30} max={80} step={1}
            value={tweaks.riskScore} onChange={(v) => setTweak("riskScore", v)}/>
          <TweakSlider label="เข้าเรียนขั้นต่ำ" unit="%"
            min={50} max={100} step={1}
            value={tweaks.riskAttendance} onChange={(v) => setTweak("riskAttendance", v)}/>
        </TweakSection>

        <TweakSection label="เป้าหมาย (ผู้ปกครอง)">
          <TweakSlider label="คะแนนเป้าหมาย"
            min={50} max={95} step={1}
            value={tweaks.targetScore} onChange={(v) => setTweak("targetScore", v)}/>
          <TweakSlider label="GPA เป้าหมาย"
            min={2} max={4} step={0.05}
            value={tweaks.targetGpa} onChange={(v) => setTweak("targetGpa", v)}/>
          <TweakSlider label="เข้าเรียนเป้าหมาย" unit="%"
            min={70} max={100} step={1}
            value={tweaks.targetAttendance} onChange={(v) => setTweak("targetAttendance", v)}/>
        </TweakSection>

        <TweakSection label="ฐานข้อมูล (Local)">
          <div style={{ fontSize: 11, color: 'rgba(41,38,27,.6)', lineHeight: 1.5, padding: '0 0 4px' }}>
            ข้อมูลถูกบันทึกอัตโนมัติในเครื่องนี้ · รีเฟรชแล้วไม่หาย
          </div>
          <TweakButton label="รีเซ็ตข้อมูลเป็นค่าเริ่มต้น" onClick={() => {
            try { Object.keys(localStorage).filter(k => k.startsWith("vrp.store.v1")).forEach(k => localStorage.removeItem(k)); } catch(e){}
            setData(window.VRP_DATA.DATA);
            setOfferings(window.VRP_DATA.COURSE_OFFERINGS);
            setToast("รีเซ็ตข้อมูลแล้ว");
          }}/>
        </TweakSection>
      </TweaksPanel>

      <Toast/>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
