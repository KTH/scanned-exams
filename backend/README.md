# Scanned exams - backend

## Getting started (short version)

1. Copy the `.env.in` to `.env`
1. Open the newly created `.env` and add the relevant environmental variables
1. Create a directory called `certs`.

## Create ssl certificates

### Mac

1. Install [mkcert](https://github.com/FiloSottile/mkcert)
1. Run

   ```sh
   mkcert -key-file ./certs/key.pem -cert-file ./certs/cert.pem localdev.kth.se localhost
   ```

### Linux

1. Run

   ```sh
   sudo apt-get install openssl
   cd certs
   openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 365 -out cert.pem
   ```

````

## All environments

1. Run

 ```sh
 npm install
 npm run dev
````

1. Now you can go to https://localdev.kth.se/scanned-exams

---

## Concepts

### Tenta API

This application makes requests to the Windream API to fetch scanned exams, and then imports them into Canvas as submissions.
