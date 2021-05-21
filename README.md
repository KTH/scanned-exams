# Scanned exams

Application that downloads exams from the "Windream/AlcomREST tenta API" and uploads them into a Canvas course.

---

## Getting started

Pre-requirements

1. Install [ImageMagick](https://imagemagick.org/index.php) or [GraphicsMagick](http://www.graphicsmagick.org/) in your computer.
2. Install [mkcert](https://github.com/FiloSottile/mkcert) (a tool to generate self-signed SSH certificates easily)
3. Make sure you have a line like this in `/etc/hosts`:

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


Open two terminals. One for the app in the backend and one for the "TentaAPI mock"

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

In the "TentaAPI mock" terminal

1. Go to the `tentaapi-mock` directory.
2. Run `npm start`


🎉  **DONE!** Now you can [search for the course "XY0101" in Canvas](https://kth.test.instructure.com/accounts/1?search_term=AKT.cfcb7186-94f1-4ad1-812d-1e2fba7b36d3) and launch the app from there

---

## Project structure

Scanned exams is divided into 2 applications, each of them in one directory:

- `/backend`. An Express server containing the logic for the app
- `/frontend`. A React application with a small development server

This repository also contains two more projects:

- `/tentaapi-mock`. An Express server that simulates the "Tenta API". Contains information about a fake examination and instructions on how to have it in Canvas.
- `/pnummer-masker`. A project to test the "personnummer masking".

---
