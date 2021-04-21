# Tenta API mock

Fake "Tenta API" server with a fake examination

## Getting started

```sh
npm install
npm start
```

## Usage with Canvas and with the Scanned Exams app

- In the `sis-import-files` directory you can find csv files to generate the "examination room" in Canvas.

## About the fake data

This application simulates the "Tenta API" (https://tentaapi.ug.kth.se/api/v2.0) but with a fake examination. These are the data for that specific fake examination:

- Ladok UID: cfcb7186-94f1-4ad1-812d-1e2fba7b36d3
- Courses: XY0101
- Exam code: ZZZ1
- Exam date: 2100-01-01

In the `mocks/files` directory you can find one PDF file for each student that has written this exam.
