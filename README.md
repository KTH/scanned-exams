# Scanned exams

Application that downloads exams from the "tenta API" and uploads them into a Canvas course.

---

## Project structure

Scanned exams is divided into 2 applications, each of them in one directory:

- `/backend`. An Express server containing the logic for the app
- `/frontend`. A React application with a small development server

This repository also contains two more projects:

- `/tentaapi-mock`. An Express server that simulates the "Tenta API". Contains information about a fake examination and instructions on how to have it in Canvas.
- `/pnummer-masker`. A project to test the "personnummer masking".

---

## Getting started


Pre-requirements

1. Install ImageMagick or GraphicsMagick in your computer.
2. Install [mkcert](https://github.com/FiloSottile/mkcert) (a tool to generate self-signed SSH certificates easily)
3. Add the following file into the `/etc/hosts` file:

    ```
    127.0.0.1   localdev.kth.se
    ```

---

Frontend:

1. Go to the `frontend` directory
2. Run

    ```sh
    npm install
    npm run build
    ```

---

Open two terminals. One for the app in the backend and one for the "TentaAPI mock"

In the "backend" terminal:

1. Go to the `backend` directory.
2. Copy the `.env.in` to `.env`
3. Open the newly created `.env` and add the relevant environmental variables
4. Create a directory called `certs`.
5. Run

   ```sh
   mkcert -key-file ./certs/key.pem -cert-file ./certs/cert.pem localdev.kth.se localhost
   ```

6. Run

   ```sh
   npm install
   npm start
   ```

In the "TentaAPI mock" terminal

1. Go to the `tentaapi-mock` directory.
2. Run `npm start`

Go to https://canvas.kth.se/courses/30328 and launch the app from there
