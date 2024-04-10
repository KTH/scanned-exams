# KTH Import exams aka Scanned exams

Application that downloads exams from the "Windream/AlcomREST tenta API" and uploads them into a Canvas course.

---

## Vocabulary

These are common words and phrases that should be used in the app for UX consistency.

- KTH Import Exams? -- name of app (don't use: scanned exams?)
- Exam room -- The Canvas course where the app is installed and run. An exam room is one-to-one mapped to an aktivitetstillfälle in Ladok. (_don't_ use Course since that means something entirely different in Ladok. Don't use courseroom either, since that is something different.)
- Exam -- bla bla
- Teacher? --
- Student? --
- Missing student? --
- Windream? -- external system exams are imported from (don't use: tenta api?)
- Ladok? --
- Canvas? --
- Speed Grader? --

## Getting started

Pre-requirements:

- Route `localdev.kth.se` to `127.0.0.1` (usually in the `etc/hosts` file)

  ```
  127.0.0.1   localdev.kth.se
  ```

1. Install npm packages

   ```sh
   npm install
   ```

2. Setup env vars

   ```sh
   cp backend/.env.in backend/.env
   ```

3. Run `npm run dev`

---

## Project structure

Scanned exams is divided into 2 applications, each of them in one directory:

- `/backend`. An Express server containing the logic for the app
- `/frontend`. A React application with a small development server
