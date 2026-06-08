// backend/seed.mjs
// Generates seed.sql from the same structure the frontend uses, plus demo users.
// Run:  node backend/seed.mjs > backend/seed.sql
//       wrangler d1 execute vrp-progress --file=backend/seed.sql
//
// Demo logins it creates (change passwords in production!):
//   teacher/teacher123  parent/parent123  executive/executive123  academic/academic123
//
// NOTE: password hashing here uses Node's crypto to match the PBKDF2 scheme
// in functions/api/_lib.js (SHA-256, 100k iterations, salt:hash hex).

import crypto from "node:crypto";

function hash(password) {
  const salt = crypto.randomBytes(16);
  const bits = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
  return salt.toString("hex") + ":" + bits.toString("hex");
}
const esc = (s) => String(s).replace(/'/g, "''");
const lines = [];
const ins = (sql) => lines.push(sql);

// ---- levels ----
ins(`INSERT INTO levels (id,code,label,years) VALUES
  ('voc','ปวช.','ประกาศนียบัตรวิชาชีพ (ปวช.)',3),
  ('hvd','ปวส.','ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)',2);`);

// ---- categories + majors ----
const STRUCT = {
  voc: [
    ["voc-biz","ประเภทวิชาบริหารธุรกิจ","oklch(0.72 0.22 340)",[["voc-acc","การบัญชี","ACC"],["voc-mkt","การตลาด","MKT"]]],
    ["voc-it","ประเภทวิชาอุตสาหกรรมดิจิทัลและเทคโนโลยีสารสนเทศ","oklch(0.72 0.20 270)",[["voc-dbt","เทคโนโลยีธุรกิจดิจิทัล","DBT"]]],
    ["voc-tour","ประเภทวิชาอุตสาหกรรมการท่องเที่ยว","oklch(0.78 0.18 200)",[["voc-hot","การโรงแรม","HOT"]]],
    ["voc-ind","ประเภทวิชาอุตสาหกรรม","oklch(0.78 0.18 70)",[["voc-aut","ช่างยนต์","AUT"]]],
  ],
  hvd: [
    ["hvd-biz","ประเภทวิชาบริหารธุรกิจ","oklch(0.72 0.22 340)",[["hvd-acc","การบัญชี","ACC"],["hvd-rmg","การจัดการธุรกิจค้าปลีก","RMG"],["hvd-log","การจัดการโลจิสติกส์","LOG"],["hvd-mkt","การตลาด","MKT"]]],
    ["hvd-it","ประเภทวิชาอุตสาหกรรมดิจิทัลและเทคโนโลยีสารสนเทศ","oklch(0.72 0.20 270)",[["hvd-dbt","เทคโนโลยีธุรกิจดิจิทัล","DBT"]]],
    ["hvd-ind","ประเภทวิชาอุตสาหกรรม","oklch(0.78 0.18 70)",[["hvd-mec","เทคนิคยานยนต์ (เทคนิคเครื่องกล)","MEC"]]],
    ["hvd-tour","ประเภทวิชาอุตสาหกรรมการท่องเที่ยว","oklch(0.78 0.18 200)",[["hvd-tra","การท่องเที่ยว","TRA"]]],
  ],
};
for (const [levelId, cats] of Object.entries(STRUCT)) {
  for (const [cid, cname, color, majors] of cats) {
    ins(`INSERT INTO categories (id,level_id,name,color) VALUES ('${cid}','${levelId}','${esc(cname)}','${color}');`);
    for (const [mid, mname, short] of majors) {
      ins(`INSERT INTO majors (id,category_id,name,short) VALUES ('${mid}','${cid}','${esc(mname)}','${short}');`);
    }
  }
}

// ---- teachers ----
const TEACHERS = [
  ["T01","อ. สิริชัย วงศ์รัตนา","DBT","sirichai@vrp.ac.th"],
  ["T02","อ. วรพล อินทรกุล","DBT","worapol@vrp.ac.th"],
  ["T03","อ. ปรียา ศรีสุข","ACC","preeya@vrp.ac.th"],
  ["T04","อ. กฤษฎา แสงทอง","MEC","krisada@vrp.ac.th"],
  ["T05","อ. นภัสสร พรหมจรรย์","LOG","napatsorn@vrp.ac.th"],
  ["T06","อ. จิราภา สุวรรณชาติ","HOT","jirapha@vrp.ac.th"],
];
for (const [id,name,spec,email] of TEACHERS)
  ins(`INSERT INTO teachers (id,name,spec,email) VALUES ('${id}','${esc(name)}','${spec}','${email}');`);

// ---- demo users ----
const USERS = [
  ["U-teacher","teacher","teacher","อ. สิริชัย วงศ์รัตนา","T01"],
  ["U-parent","parent","parent","ผู้ปกครอง น.ส.พลอย",null],
  ["U-exec","executive","executive","ดร. วิทวัส สูญยี่ขันธ์",null],
  ["U-acad","academic","academic","นางสาว ปริญญา ขจรกิตติ",null],
];
for (const [id,username,role,name,link] of USERS) {
  const pw = hash(username + "123");
  ins(`INSERT INTO users (id,username,password_hash,role,display_name,linked_id) VALUES ('${id}','${username}','${pw}','${role}','${esc(name)}',${link ? `'${link}'` : "NULL"});`);
}

console.log(lines.join("\n"));
