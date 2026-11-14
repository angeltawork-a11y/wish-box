/** Server-only staff seed. Not served as a static/public JSON. */
export type SeedEmployee = { name: string; title: string };
export type SeedDepartment = { name: string; employees: SeedEmployee[] };

export const STAFF_SEED: { departments: SeedDepartment[] } = {
  "departments": [
    {
      "name": "Руководство",
      "employees": [
        {
          "name": "Ляпитова Ольга",
          "title": "CEO"
        }
      ]
    },
    {
      "name": "Админ",
      "employees": [
        {
          "name": "Бугаева Ангелина",
          "title": "админ-рук."
        },
        {
          "name": "Лучко",
          "title": "Администратор по таблицам и документообороту"
        },
        {
          "name": "Ковалева Людмила",
          "title": "Администратор по документообороту"
        },
        {
          "name": "Ирина",
          "title": "админ лаборатории"
        }
      ]
    },
    {
      "name": "IT",
      "employees": [
        {
          "name": "Смагин",
          "title": "IT специалист"
        },
        {
          "name": "Любовь Теренина",
          "title": "IT специалист"
        },
        {
          "name": "Смагин (проект)",
          "title": "IT специалист"
        }
      ]
    },
    {
      "name": "HR",
      "employees": [
        {
          "name": "Прошина Александра (рекрутер)",
          "title": "рекрутер"
        }
      ]
    },
    {
      "name": "Продажи",
      "employees": [
        {
          "name": "Никита",
          "title": "РОП"
        },
        {
          "name": "Давидович Евгений",
          "title": "МОП"
        },
        {
          "name": "Лепеха Илья",
          "title": "МОП"
        },
        {
          "name": "Яна",
          "title": "МОП"
        },
        {
          "name": "София",
          "title": "МОП"
        },
        {
          "name": "Внутренние игры",
          "title": "МОП"
        },
        {
          "name": "Контроль качества (ОКК)",
          "title": "контроль качества"
        }
      ]
    },
    {
      "name": "Маркетинг",
      "employees": [
        {
          "name": "Ляпитова Полина",
          "title": "Руководитель отдела маркетинга"
        },
        {
          "name": "Юлия Кускова",
          "title": "маркетолог соц сети"
        },
        {
          "name": "Прошина Александра (копирайтер)",
          "title": "копирайтер"
        }
      ]
    },
    {
      "name": "Производство",
      "employees": [
        {
          "name": "Ляпитова Дарья",
          "title": "рук. произв."
        },
        {
          "name": "Ангелина Лягина",
          "title": "старший куратор"
        },
        {
          "name": "Ирина Белобородова",
          "title": "куратор"
        },
        {
          "name": "Медведева Евгения",
          "title": "куратор"
        },
        {
          "name": "Черный Александр",
          "title": "наставник"
        },
        {
          "name": "Шмелев Иван",
          "title": "наставник"
        },
        {
          "name": "Харитонова Татьяна",
          "title": "наставник"
        },
        {
          "name": "Копилец Виктор",
          "title": "наставник"
        }
      ]
    }
  ]
} as const;
