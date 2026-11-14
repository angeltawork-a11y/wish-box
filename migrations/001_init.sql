CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS employees_department_id_idx ON employees(department_id);
CREATE INDEX IF NOT EXISTS employees_name_idx ON employees(LOWER(name));

CREATE TABLE IF NOT EXISTS wishes (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  employee_name TEXT NOT NULL,
  employee_title TEXT NOT NULL DEFAULT '',
  department_name TEXT NOT NULL DEFAULT '',
  wish_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS wishes_employee_id_idx ON wishes(employee_id);
CREATE INDEX IF NOT EXISTS wishes_created_at_idx ON wishes(created_at DESC);
