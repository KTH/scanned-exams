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

## Data flow

[Tightly coupled to the code, will probably be outdated](https://sequencediagram.org/index.html#initialData=C4S2BsFMAIEkFsAOB7ATsakAeBDeBnaAEx2BwDNwA3oyAKEgDthUBPfRHAYxEYHNoABgB0AZgZZOjEgCMogJCJoAGQAnfAaHDhoIaAGsqdRsmAxkAN0ipoAMVTJmTIgC5oABVSROnhCnTDgfCw6OwdTaQBaAD4AIW49J2cAcQBRABVoAHouZABXVHxIfEznECJM7Dx8IxMzS2s4rgTpV3AQfGAAQS0U3AIAwjpG5qJogBFSHBkcfFc+SGAU5lQQItD4AEVcyG2ACgBKOgmyafxo4cSAbQBvchAoWCIAGjuoAGFPUkgiY8gnnPyhUeTw6uVozCeJFM+GEsIAvgBdIbxJzRADqvCIn3gzjaHQAylwcIxGN9elVdgCCpBgdBwDgiMg9I9DhjpNjziiWtBLgAdRi3e405780Hg4DOa5lF4gArAAByeD+9I6ivgkDh-Nhwk1jCRF0iUTexPMM1x7WA+OAYKYltyMng7XwIAc+FgjGNjFN+AOdE93s5TUS0CJXpm0Hw9sd+GdruRQcNoUc3JuXE+ph+Xye-J0IsYEbI1vw2fzYttku1usRNVM0AsVls9mTLhy8HgDkyOEQIGEACtqknwqNYlyXG4APL4jLZPLU4qlcogJBoYARACO2220H5N2lIfT31+1YNw+OUzNOkYhXQrhu-KpQLzr2FJefH0gX1+JY6pFyswARIgTi8Hw-78tWTgSFIshQAA1O49hcEU+A4PoVDQPGIyBiMrhLn4wAAO5oAkqDCD+6DDHw9i5NIvgrr6J7YcGeErkRqAkcIiCIchWw7JASwsKwDGjuMkynHMCw2LKHRuMB-DrLxeyHGepxMdy1wAPplM4ACMABMohPJWUHEjBkCKAAqog4DIAydakpgfSYaiI4Ji40C5NZtlEOOpLkvAwlueimLYs4jIEYwNkMv5vpsliH7wGp7mVPA0DXDkybAE80DPmqfwFjaEKOXgR7OYaKlmp5UKQFahWLMsQn7K4OZpOOYzjtAABqOCoOQVDWJ5iDVag4ZlsmOhoYwAD8ZXDv6lVedFfS+pBjFRBVsweUNXxWr++DjuQAlsO6imQAcrg-kWuHLug3wVKg9ioAw0gmdIUxQBE0D4gAFsgBEFntIRNkO0SDsGnS5MA322iARIZp0iCIAMwRg4mwPBnR6A2DZBHI0DYQuaj7mtu2jCdt2fYDujhonq4qTTg+RQlGUmQseg66bvQa0bdd+EbnxwjzJahZ-gpnMHPyRxiTMoPU+51yiiLm3-mUUCZGxeggf+JbACYODgLpgiCCWXHIFRyHOAAnMb-JsxmzgABw24wIB8MYnguM7ViPYb4F0K9ZmKJ1VggOQrAAEpFLk4CBAH72QJ9sBu2g3zFQQ+PNkldPpFkjPzizdsc3x92PdUa20zoN3AKdAASplQAUgsLCkD1oG6jCnYFWHrdLm1C0dqw+v+3toP+dbWCryce-+ym97LBMpvygoPHmY0SlKzx3HKeVPCqCpKrql1-s4w+t6gAA+rvu98YGMJW-JIs9RBx3ICdwFX0Dtp4Gcg65OHQGMFISh0gpFzrOQo+dFxVyLtsWaWdK74VrvXKwMJPCFGruLQ45dRy8xXKdYQaCFinRsGgTGwAu4uR5sQSAUBTAAFliRCUZiyJ+T8gA)
