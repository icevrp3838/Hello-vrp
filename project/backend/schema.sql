-- ============================================================
-- VRP Progress — Cloudflare D1 (SQLite) schema
-- Run:  wrangler d1 execute vrp-progress --file=backend/schema.sql
-- ============================================================

PRAGMA foreign_keys = ON;

-- ---------- Users & auth ----------
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,          -- store a salted hash, never plaintext
  role          TEXT NOT NULL CHECK (role IN ('teacher','parent','executive','academic')),
  display_name  TEXT NOT NULL,
  email         TEXT,
  -- role links: teacher -> teachers.id, parent -> students.id (child)
  linked_id     TEXT,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ---------- Academic structure ----------
CREATE TABLE IF NOT EXISTS levels (         -- ปวช. / ปวส.
  id    TEXT PRIMARY KEY,                   -- 'voc' | 'hvd'
  code  TEXT NOT NULL,                      -- 'ปวช.' | 'ปวส.'
  label TEXT NOT NULL,
  years INTEGER NOT NULL                    -- 3 for voc, 2 for hvd
);

CREATE TABLE IF NOT EXISTS categories (     -- ประเภทวิชา
  id       TEXT PRIMARY KEY,
  level_id TEXT NOT NULL REFERENCES levels(id),
  name     TEXT NOT NULL,
  color    TEXT
);

CREATE TABLE IF NOT EXISTS majors (         -- สาขาวิชา
  id          TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id),
  name        TEXT NOT NULL,
  short       TEXT
);

CREATE TABLE IF NOT EXISTS teachers (
  id    TEXT PRIMARY KEY,
  name  TEXT NOT NULL,
  spec  TEXT,
  email TEXT,
  avatar INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS students (
  id        TEXT PRIMARY KEY,
  code      TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  nickname  TEXT,
  major_id  TEXT REFERENCES majors(id),
  classroom TEXT,
  year      INTEGER,
  avatar    INTEGER DEFAULT 1
);

-- ---------- Curriculum catalog ----------
CREATE TABLE IF NOT EXISTS courses (        -- หลักสูตรกลาง
  code     TEXT PRIMARY KEY,               -- e.g. 30204-2001
  name     TEXT NOT NULL,
  credits  INTEGER NOT NULL DEFAULT 3,
  major_id TEXT REFERENCES majors(id)
);

-- ---------- Course offerings (per semester) ----------
CREATE TABLE IF NOT EXISTS offerings (
  id          TEXT PRIMARY KEY,
  semester    TEXT NOT NULL,               -- '1/2569'
  course_code TEXT REFERENCES courses(code),
  name        TEXT NOT NULL,               -- denormalized (allows ad-hoc courses)
  credits     INTEGER NOT NULL DEFAULT 3,
  major_id    TEXT NOT NULL REFERENCES majors(id),
  teacher_id  TEXT NOT NULL REFERENCES teachers(id),
  year        INTEGER NOT NULL,
  student_grp TEXT,
  schedule    TEXT,                        -- 'จ. 08:30-11:30'
  room        TEXT,
  capacity    INTEGER DEFAULT 30,
  created_at  TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_off_sem   ON offerings(semester);
CREATE INDEX IF NOT EXISTS idx_off_major ON offerings(major_id);
CREATE INDEX IF NOT EXISTS idx_off_teach ON offerings(teacher_id);

-- ---------- Enrollment + grades ----------
CREATE TABLE IF NOT EXISTS enrollments (
  id          TEXT PRIMARY KEY,
  offering_id TEXT NOT NULL REFERENCES offerings(id) ON DELETE CASCADE,
  student_id  TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  -- scores out of 30 / 30 / 40
  collected   REAL DEFAULT 0,
  midterm     REAL DEFAULT 0,
  final       REAL DEFAULT 0,
  remark      TEXT DEFAULT '',
  updated_at  TEXT DEFAULT (datetime('now')),
  UNIQUE (offering_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_enr_off ON enrollments(offering_id);
CREATE INDEX IF NOT EXISTS idx_enr_stu ON enrollments(student_id);

-- ---------- Attendance (one row per week) ----------
CREATE TABLE IF NOT EXISTS attendance (
  id            TEXT PRIMARY KEY,
  enrollment_id TEXT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  week          INTEGER NOT NULL,          -- 1..16
  status        TEXT NOT NULL CHECK (status IN ('P','L','A','H')), -- present/late/absent/holiday
  UNIQUE (enrollment_id, week)
);
CREATE INDEX IF NOT EXISTS idx_att_enr ON attendance(enrollment_id);
