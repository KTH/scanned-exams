# Scanned exams

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

Pre-requirements

1. Install [mkcert](https://github.com/FiloSottile/mkcert) (a tool to generate self-signed SSH certificates easily)
2. Make sure you have a line like this in `/etc/hosts`:

    ```
    127.0.0.1   localdev.kth.se
    ```

Frontend:

1. Go to the `frontend` directory

   ```sh
   cd frontend
   ```

2. Install the dependencies and build the HTML/CSS/JS code

    ```sh
    npm install
    npm run build
    ```

In the "backend" terminal:

1. Go to the `backend` directory.

   ```sh
   cd backend
   ```

2. Copy the `.env.in` to `.env`

   ```sh
   cp .env.in .env
   ```

3. Open the newly created `.env` and add the relevant environmental variables (everything that starts with `CANVAS_`)
4. Create a directory called `certs`.

   ```sh
   mkdir certs
   ```

5. Run

   ```sh
   mkcert -key-file ./certs/key.pem -cert-file ./certs/cert.pem localdev.kth.se localhost
   ```

6. Install the dependencies and run the app in development mode

   ```sh
   npm install
   npm start
   ```

---

## Project structure

Scanned exams is divided into 2 applications, each of them in one directory:

- `/backend`. An Express server containing the logic for the app
- `/frontend`. A React application with a small development server

This repository also contains two more projects:

- `/tentaapi-mock`. An Express server that simulates the "Tenta API". Contains information about a fake examination and instructions on how to have it in Canvas.
- `/pnummer-masker`. A project to test the "personnummer masking".

---
