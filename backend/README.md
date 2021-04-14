# Scanned exams - backend

## Getting started (short version)

1. Install ImageMagick or GraphicsMagick in your computer.
1. Copy the `.env.in` to `.env`
1. Open the newly created `.env` and add the relevant environmental variables
1. Create a directory called `certs`.
1. Install [mkcert](https://github.com/FiloSottile/mkcert)
1. Run

   ```sh
   mkcert -key-file ./certs/key.pem -cert-file ./certs/cert.pem localdev.kth.se localhost
   ```

1. Run

   ```sh
   npm install
   npm start
   ```

1. Now you can go to https://localdev.kth.se/scanned-exams

## Getting started (with explanations)

1. Install ImageMagick or GraphicsMagick to use the **mask personal number** feature
1. Setup the required environmental variables as explained in `.env.in`
1. Generate a SSH certificate for `https://localhost` and `https://localdev.kth.se`

   The name of the generated files should be `certs/key.pem` (for the key) and `certs/cert.pem` (for the certificate)
