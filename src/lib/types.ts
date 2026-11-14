export type Department = {
  id: number;
  name: string;
};

export type Employee = {
  id: number;
  department_id: number;
  name: string;
  title: string;
  department_name?: string;
};

export type Wish = {
  id: number;
  employee_id: number | null;
  employee_name: string;
  employee_title: string;
  department_name: string;
  wish_text: string;
  created_at: string;
};

export type StaffTree = {
  id: number;
  name: string;
  employees: Array<{
    id: number;
    name: string;
    title: string;
  }>;
};
