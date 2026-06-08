/* ======================================================
   Mock data: 9 subjects, ~28 students, scores & attendance
====================================================== */

const SUBJECTS = [
  { id: "CN101", th: "ระบบเครือข่ายคอมพิวเตอร์เบื้องต้น", en: "Computer Networks",       color: "oklch(0.72 0.22 340)", credits: 3 },
  { id: "GD110", th: "องค์ประกอบศิลป์สำหรับงานกราฟิก",     en: "Graphic Composition",    color: "oklch(0.78 0.18 30)",  credits: 3 },
  { id: "WD120", th: "การสร้างเว็บไซต์",                     en: "Web Development",        color: "oklch(0.75 0.20 220)", credits: 3 },
  { id: "OS130", th: "ระบบปฏิบัติการและบำรุงรักษาคอมพิวเตอร์", en: "OS & Maintenance",        color: "oklch(0.70 0.22 295)", credits: 3 },
  { id: "AI201", th: "การประยุกต์ AI ในงานธุรกิจ",            en: "AI for Business",        color: "oklch(0.80 0.18 130)", credits: 3 },
  { id: "CL202", th: "การประมวลผลแบบคลาวด์",                  en: "Cloud Computing",        color: "oklch(0.75 0.18 200)", credits: 3 },
  { id: "IO210", th: "อินเทอร์เน็ตเพื่อสรรพสิ่ง (IoT)",        en: "Internet of Things",     color: "oklch(0.78 0.18 70)",  credits: 3 },
  { id: "LD150", th: "ภาวะผู้นำและการทำงานเป็นทีม",          en: "Leadership & Teamwork",  color: "oklch(0.74 0.18 175)", credits: 2 },
  { id: "OO220", th: "วิเคราะห์และออกแบบระบบเชิงวัตถุ",       en: "OO Analysis & Design",   color: "oklch(0.70 0.22 25)",  credits: 3 },
];

const FIRST_NAMES = ["ธนภัทร","ภูริ","ปุณณภพ","ชนกานต์","ศิรประภา","อัญชิสา","วรพล","ณัฐภัทร","กัญญาณัฐ","พิมพ์ลภัส","ภัทรพล","ธีรเดช","กฤตภาส","ปวีณ์ธิดา","นภัสสร","ภัทรพร","กิตติพศ","พีรวัส","ฐิติพันธ์","ศุภากร","ธีรนุช","จิราภา","ปริยาภัทร","พงศ์พัฒน์","กฤษฎา","วรรณพร","นันทิชา","อรณิชา"];
const LAST_NAMES  = ["ศรีสุข","วงศ์ใหญ่","แสงทอง","เพชรรัตน์","อินทรกุล","มณีรัตน์","สุวรรณชาติ","พรหมจรรย์","คำดี","โชติช่วง","วิเศษศักดิ์","อัศวกุล","บุญเรือง","มุสิกพันธุ์","พุฒิพงศ์","สีหราช","สิงหเสนี","ตันเจริญ","แก้วประเสริฐ","ขจรกิตติ"];
const NICKS = ["บีม","แพรว","พลอย","ฟ้า","มิ้ง","ต้าร์","นิว","พีท","มาย","แตงโม","ก้อง","อิงค์","ปุ๊ก","มิว","แบงค์","โอม","กาย","ปอนด์","หมิว","น็อต"];

function seeded(seed){ let s = seed; return () => { s = (s*9301+49297) % 233280; return s/233280; }; }
const rng = seeded(424242);

function makeStudent(i){
  const fn = FIRST_NAMES[Math.floor(rng()*FIRST_NAMES.length)];
  const ln = LAST_NAMES[Math.floor(rng()*LAST_NAMES.length)];
  const nk = NICKS[Math.floor(rng()*NICKS.length)];
  return {
    id: "67" + String(1001 + i),
    code: "67-" + String(1001 + i),
    firstName: fn,
    lastName: ln,
    nickname: nk,
    fullName: fn + " " + ln,
    avatarSeed: (i % 6) + 1,
    classroom: "ปวส.2/" + (i % 2 === 0 ? "1" : "2"),
    program: "เทคโนโลยีธุรกิจดิจิทัล",
  };
}
const STUDENTS = Array.from({length: 28}, (_,i) => makeStudent(i));

// 16 weeks of attendance; status: P (present), L (late), A (absent), H (holiday)
function makeAttendance(seed, baseRate){
  const r = seeded(seed);
  return Array.from({length: 16}, (_,w) => {
    if (w === 7) return "H";
    const x = r();
    if (x < baseRate) return "P";
    if (x < baseRate + 0.08) return "L";
    return "A";
  });
}

function makeScores(seed, ability){
  const r = seeded(seed);
  // out of 30/30/40, ability 0..1
  const noise = () => (r() - 0.5) * 0.2;
  const collected = Math.max(0, Math.min(30, Math.round((ability + noise()) * 30)));
  const midterm   = Math.max(0, Math.min(30, Math.round((ability + noise()) * 30)));
  const final     = Math.max(0, Math.min(40, Math.round((ability + noise()) * 40)));
  return { collected, midterm, final };
}

// Sample remarks (Thai)
const REMARK_POOL = [
  "ส่งงานครบและตรงเวลา ทำงานเป็นทีมได้ดี",
  "มีพัฒนาการต่อเนื่อง แนะนำให้ทบทวนเรื่อง subnetting เพิ่มเติม",
  "ทักษะการนำเสนอดีมาก แต่ควรเพิ่มความละเอียดในเอกสาร",
  "ขาดเรียนบ่อยในช่วง 3 สัปดาห์ที่ผ่านมา ควรติดตามอย่างใกล้ชิด",
  "ผลงาน Final Project มีความคิดสร้างสรรค์โดดเด่น",
  "เริ่มเข้าใจ concept มากขึ้น ให้ฝึกทำโจทย์เพิ่ม",
  "ทำคะแนน midterm ต่ำกว่าเป้า แนะนำให้นัดติว",
  "ตั้งใจเรียน มีความรับผิดชอบในบทบาทหัวหน้ากลุ่ม",
];

// Build dataset: scores[studentId][subjectId] = { scores, attendance, remark }
const DATA = (() => {
  const map = {};
  STUDENTS.forEach((s, si) => {
    const ability = 0.45 + (((si*7) % 9) / 18) + (rng() - 0.5) * 0.15;
    map[s.id] = {};
    SUBJECTS.forEach((sub, ki) => {
      const a = Math.max(0.25, Math.min(0.98, ability + (rng() - 0.5) * 0.18));
      const attRate = Math.max(0.45, Math.min(0.98, a + 0.05));
      map[s.id][sub.id] = {
        scores: makeScores(si*100 + ki + 1, a),
        attendance: makeAttendance(si*100 + ki*7 + 13, attRate),
        remark: rng() > 0.5 ? REMARK_POOL[Math.floor(rng() * REMARK_POOL.length)] : "",
      };
    });
  });
  return map;
})();

const PARENT_LINK = STUDENTS[3]; // child for parent demo

/* ======================================================
   College structure — categories & majors (ปวช. + ปวส.)
====================================================== */
const PROGRAMS = {
  voc: {
    id: "voc", code: "ปวช.", label: "ประกาศนียบัตรวิชาชีพ (ปวช.)",
    accent: "oklch(0.78 0.18 30)",
    categories: [
      {
        id: "voc-biz", name: "บริหารธุรกิจ", full: "ประเภทวิชาบริหารธุรกิจ", color: "oklch(0.72 0.22 340)",
        majors: [
          { id: "voc-acc",  name: "การบัญชี",  short: "ACC",  students: 64,  classes: 3, avg: 78.4, att: 92, risk: 4 },
          { id: "voc-mkt",  name: "การตลาด",  short: "MKT",  students: 48,  classes: 2, avg: 74.2, att: 88, risk: 6 },
        ],
      },
      {
        id: "voc-it", name: "อุตสาหกรรมดิจิทัลและเทคโนโลยีสารสนเทศ", full: "ประเภทวิชาอุตสาหกรรมดิจิทัลและเทคโนโลยีสารสนเทศ", color: "oklch(0.72 0.20 270)",
        majors: [
          { id: "voc-dbt", name: "เทคโนโลยีธุรกิจดิจิทัล", short: "DBT", students: 72, classes: 3, avg: 76.8, att: 89, risk: 8 },
        ],
      },
      {
        id: "voc-tour", name: "อุตสาหกรรมการท่องเที่ยว", full: "ประเภทวิชาอุตสาหกรรมการท่องเที่ยว", color: "oklch(0.78 0.18 200)",
        majors: [
          { id: "voc-hot", name: "การโรงแรม", short: "HOT", students: 36, classes: 2, avg: 80.1, att: 94, risk: 2 },
        ],
      },
      {
        id: "voc-ind", name: "อุตสาหกรรม", full: "ประเภทวิชาอุตสาหกรรม", color: "oklch(0.78 0.18 70)",
        majors: [
          { id: "voc-aut", name: "ช่างยนต์", short: "AUT", students: 58, classes: 2, avg: 72.5, att: 85, risk: 9 },
        ],
      },
    ],
  },
  hvd: {
    id: "hvd", code: "ปวส.", label: "ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)",
    accent: "oklch(0.72 0.25 340)",
    categories: [
      {
        id: "hvd-biz", name: "บริหารธุรกิจ", full: "ประเภทวิชาบริหารธุรกิจ", color: "oklch(0.72 0.22 340)",
        majors: [
          { id: "hvd-acc",  name: "การบัญชี",                short: "ACC", students: 42, classes: 2, avg: 81.2, att: 93, risk: 2 },
          { id: "hvd-rmg",  name: "การจัดการธุรกิจค้าปลีก", short: "RMG", students: 28, classes: 1, avg: 75.6, att: 87, risk: 4 },
          { id: "hvd-log",  name: "การจัดการโลจิสติกส์",     short: "LOG", students: 52, classes: 2, avg: 79.3, att: 91, risk: 3 },
          { id: "hvd-mkt",  name: "การตลาด",                short: "MKT", students: 30, classes: 1, avg: 77.4, att: 88, risk: 4 },
        ],
      },
      {
        id: "hvd-it", name: "อุตสาหกรรมดิจิทัลและเทคโนโลยีสารสนเทศ", full: "ประเภทวิชาอุตสาหกรรมดิจิทัลและเทคโนโลยีสารสนเทศ", color: "oklch(0.72 0.20 270)",
        majors: [
          { id: "hvd-dbt", name: "เทคโนโลยีธุรกิจดิจิทัล", short: "DBT", students: 56, classes: 2, avg: 78.6, att: 90, risk: 6, active: true },
        ],
      },
      {
        id: "hvd-ind", name: "อุตสาหกรรม", full: "ประเภทวิชาอุตสาหกรรม", color: "oklch(0.78 0.18 70)",
        majors: [
          { id: "hvd-mec", name: "เทคนิคยานยนต์ (เทคนิคเครื่องกล)", short: "MEC", students: 46, classes: 2, avg: 74.1, att: 86, risk: 7 },
        ],
      },
      {
        id: "hvd-tour", name: "อุตสาหกรรมการท่องเที่ยว", full: "ประเภทวิชาอุตสาหกรรมการท่องเที่ยว", color: "oklch(0.78 0.18 200)",
        majors: [
          { id: "hvd-tra", name: "การท่องเที่ยว", short: "TRA", students: 24, classes: 1, avg: 82.5, att: 95, risk: 1 },
        ],
      },
    ],
  },
};

const COLLEGE_STATS = (() => {
  const t = { students: 0, majors: 0, classes: 0, categories: 0, risk: 0 };
  Object.values(PROGRAMS).forEach(p => p.categories.forEach(c => {
    t.categories++;
    c.majors.forEach(m => { t.students += m.students; t.classes += m.classes; t.majors++; t.risk += m.risk; });
  }));
  return t;
})();

/* ======================================================
   Academic affairs — teachers & course offerings
====================================================== */

const TEACHERS = [
  { id: "T01", name: "อ. สิริชัย วงศ์รัตนา",  spec: "DBT", email: "sirichai@vrp.ac.th",  avatar: 1 },
  { id: "T02", name: "อ. วรพล อินทรกุล",      spec: "DBT", email: "worapol@vrp.ac.th",  avatar: 2 },
  { id: "T03", name: "อ. ปรียา ศรีสุข",        spec: "ACC", email: "preeya@vrp.ac.th",   avatar: 3 },
  { id: "T04", name: "อ. กฤษฎา แสงทอง",        spec: "MEC", email: "krisada@vrp.ac.th",  avatar: 4 },
  { id: "T05", name: "อ. นภัสสร พรหมจรรย์",  spec: "LOG", email: "napatsorn@vrp.ac.th", avatar: 5 },
  { id: "T06", name: "อ. จิราภา สุวรรณชาติ",  spec: "HOT", email: "jirapha@vrp.ac.th",  avatar: 6 },
  { id: "T07", name: "อ. ภูริ เพชรรัตน์",     spec: "MKT", email: "puri@vrp.ac.th",     avatar: 1 },
  { id: "T08", name: "อ. ธีรเดช มณีรัตน์",     spec: "AUT", email: "teeradet@vrp.ac.th", avatar: 2 },
  { id: "T09", name: "อ. ปวีณ์ธิดา วงศ์ใหญ่",  spec: "RMG", email: "paveethida@vrp.ac.th", avatar: 3 },
  { id: "T10", name: "อ. พงศ์พัฒน์ คำดี",      spec: "TRA", email: "pongpat@vrp.ac.th",  avatar: 4 },
  { id: "T11", name: "อ. ศุภากร โชติช่วง",     spec: "DBT", email: "supakorn@vrp.ac.th", avatar: 5 },
  { id: "T12", name: "อ. กิตติพศ บุญเรือง",   spec: "ACC", email: "kittipot@vrp.ac.th", avatar: 6 },
];

const SEMESTERS = ["1/2568", "2/2568", "1/2569", "2/2569"];
const CURRENT_SEMESTER = "1/2569";

// Subject catalog templates per major (a small curriculum DB)
const CATALOG = {
  // ปวช.
  "voc-acc": [
    { code: "20201-1001", name: "การบัญชีเบื้องต้น",           credits: 3 },
    { code: "20201-2001", name: "การบัญชีบริษัทจำกัด",         credits: 3 },
    { code: "20201-2002", name: "การบัญชีภาษีอากร",            credits: 3 },
    { code: "20201-2004", name: "การใช้คอมพิวเตอร์ในงานบัญชี", credits: 3 },
  ],
  "voc-mkt": [
    { code: "20202-1001", name: "หลักการตลาด",                credits: 3 },
    { code: "20202-2002", name: "การโฆษณาและการประชาสัมพันธ์", credits: 3 },
    { code: "20202-2005", name: "การตลาดดิจิทัล",             credits: 3 },
  ],
  "voc-dbt": [
    { code: "20204-1001", name: "เทคโนโลยีดิจิทัลเบื้องต้น",    credits: 3 },
    { code: "20204-2001", name: "การสร้างเว็บไซต์",             credits: 3 },
    { code: "20204-2003", name: "ระบบเครือข่ายคอมพิวเตอร์",   credits: 3 },
    { code: "20204-2008", name: "การออกแบบกราฟิกดิจิทัล",      credits: 3 },
  ],
  "voc-hot": [
    { code: "20701-1001", name: "งานแม่บ้านโรงแรม",           credits: 3 },
    { code: "20701-2002", name: "บริการอาหารและเครื่องดื่ม",   credits: 3 },
    { code: "20701-2003", name: "ภาษาอังกฤษเพื่อการโรงแรม",   credits: 3 },
  ],
  "voc-aut": [
    { code: "20101-2001", name: "งานเครื่องยนต์เล็ก",          credits: 3 },
    { code: "20101-2002", name: "งานไฟฟ้ารถยนต์",              credits: 3 },
    { code: "20101-2007", name: "งานเครื่องล่างรถยนต์",        credits: 3 },
  ],
  // ปวส.
  "hvd-acc": [
    { code: "30201-2001", name: "การบัญชีชั้นสูง 1",            credits: 3 },
    { code: "30201-2003", name: "การสอบบัญชี",                  credits: 3 },
    { code: "30201-2010", name: "ระบบสารสนเทศทางการบัญชี",     credits: 3 },
  ],
  "hvd-rmg": [
    { code: "30214-2001", name: "การจัดการธุรกิจค้าปลีก",       credits: 3 },
    { code: "30214-2003", name: "การจัดการคลังสินค้าค้าปลีก",   credits: 3 },
  ],
  "hvd-log": [
    { code: "30215-2001", name: "การจัดการโลจิสติกส์และซัพพลายเชน", credits: 3 },
    { code: "30215-2004", name: "การจัดการคลังสินค้าและการกระจายสินค้า", credits: 3 },
    { code: "30215-2006", name: "การขนส่งระหว่างประเทศ",      credits: 3 },
  ],
  "hvd-mkt": [
    { code: "30202-2001", name: "การวิจัยตลาด",                credits: 3 },
    { code: "30202-2008", name: "การตลาดออนไลน์ขั้นสูง",       credits: 3 },
  ],
  "hvd-dbt": [
    { code: "30204-2001", name: "ระบบเครือข่ายคอมพิวเตอร์เบื้องต้น",  credits: 3 },
    { code: "30204-2002", name: "องค์ประกอบศิลป์สำหรับงานกราฟิก",      credits: 3 },
    { code: "30204-2003", name: "การสร้างเว็บไซต์",                     credits: 3 },
    { code: "30204-2004", name: "ระบบปฏิบัติการและบำรุงรักษาคอมพิวเตอร์", credits: 3 },
    { code: "30204-2005", name: "การประยุกต์ AI ในงานธุรกิจ",           credits: 3 },
    { code: "30204-2006", name: "การประมวลผลแบบคลาวด์",                 credits: 3 },
    { code: "30204-2007", name: "อินเทอร์เน็ตเพื่อสรรพสิ่ง (IoT)",        credits: 3 },
    { code: "30204-2008", name: "ภาวะผู้นำและการทำงานเป็นทีม",          credits: 2 },
    { code: "30204-2009", name: "วิเคราะห์และออกแบบระบบเชิงวัตถุ",       credits: 3 },
  ],
  "hvd-mec": [
    { code: "30101-2001", name: "เครื่องยนต์สันดาปภายใน",      credits: 3 },
    { code: "30101-2003", name: "ระบบควบคุมเครื่องยนต์อิเล็กทรอนิกส์", credits: 3 },
    { code: "30101-2007", name: "ยานยนต์ไฟฟ้า",               credits: 3 },
  ],
  "hvd-tra": [
    { code: "30702-2001", name: "การจัดการธุรกิจนำเที่ยว",     credits: 3 },
    { code: "30702-2004", name: "ภาษาอังกฤษเพื่อมัคคุเทศก์",   credits: 3 },
  ],
};

// Seed offerings for current semester — each row is one assignment
let __nextOfferingId = 1;
const makeOffering = (majorId, courseIdx, teacherId, year, group, semester = CURRENT_SEMESTER) => {
  const course = CATALOG[majorId][courseIdx];
  const major = Object.values(PROGRAMS).flatMap(p => p.categories.flatMap(c => c.majors.map(m => ({...m, level: p.id, color: c.color, levelCode: p.code, catName: c.name})))).find(m => m.id === majorId);
  return {
    id: "OF" + String(__nextOfferingId++).padStart(4, "0"),
    semester,
    level: majorId.startsWith("voc-") ? "voc" : "hvd",
    majorId, majorName: major.name, levelCode: major.levelCode, catName: major.catName, majorColor: major.color,
    code: course.code, name: course.name, credits: course.credits,
    teacherId, year, group,
    schedule: ["จ. 08:30-11:30","อ. 12:30-15:30","พ. 09:30-12:30","พฤ. 13:30-15:30","ศ. 08:30-10:30","ส. 09:30-12:30","อา. 10:30-13:30"][__nextOfferingId % 7],
    room: ["IT-301","ACC-201","LAB-2","M-105","TR-101","MKT-301","HVD-401","AUT-W2","HOT-K1"][__nextOfferingId % 9],
    students: 22 + (__nextOfferingId * 3) % 18,
  };
};

const COURSE_OFFERINGS = [
  // ปวส. DBT (the active cohort — all 9 subjects)
  ...Array.from({length: 9}, (_, i) => makeOffering("hvd-dbt", i, ["T01","T02","T11","T01","T02","T11","T01","T11","T02"][i], 2, i % 2 === 0 ? "1" : "2")),
  // ปวช. DBT
  makeOffering("voc-dbt", 0, "T11", 1, "1"),
  makeOffering("voc-dbt", 1, "T01", 2, "1"),
  makeOffering("voc-dbt", 2, "T02", 2, "2"),
  makeOffering("voc-dbt", 3, "T11", 3, "1"),
  // ปวช. ACC
  makeOffering("voc-acc", 0, "T03", 1, "1"),
  makeOffering("voc-acc", 1, "T12", 2, "1"),
  makeOffering("voc-acc", 2, "T03", 3, "1"),
  // ปวช. MKT
  makeOffering("voc-mkt", 0, "T07", 1, "1"),
  makeOffering("voc-mkt", 2, "T07", 2, "1"),
  // ปวช. HOT
  makeOffering("voc-hot", 0, "T06", 1, "1"),
  makeOffering("voc-hot", 1, "T06", 2, "1"),
  // ปวช. AUT
  makeOffering("voc-aut", 0, "T08", 1, "1"),
  makeOffering("voc-aut", 1, "T08", 2, "1"),
  // ปวส. ACC
  makeOffering("hvd-acc", 0, "T12", 1, "1"),
  makeOffering("hvd-acc", 2, "T03", 2, "1"),
  // ปวส. RMG
  makeOffering("hvd-rmg", 0, "T09", 1, "1"),
  // ปวส. LOG
  makeOffering("hvd-log", 0, "T05", 1, "1"),
  makeOffering("hvd-log", 1, "T05", 2, "1"),
  // ปวส. MKT
  makeOffering("hvd-mkt", 0, "T07", 2, "1"),
  // ปวส. MEC
  makeOffering("hvd-mec", 0, "T04", 1, "1"),
  makeOffering("hvd-mec", 2, "T04", 2, "1"),
  // ปวส. TRA
  makeOffering("hvd-tra", 0, "T10", 2, "1"),
];

window.VRP_DATA = { SUBJECTS, STUDENTS, DATA, PARENT_LINK, PROGRAMS, COLLEGE_STATS, TEACHERS, SEMESTERS, CURRENT_SEMESTER, CATALOG, COURSE_OFFERINGS };
