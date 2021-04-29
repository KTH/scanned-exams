# Scanned exams scripts

Run things outside of the app

1. **[Mask personnummer](#mask-personnummer)** Test the "personnummer masking" script stand-alone.
2. **[Create button](#create-button)** Create "LTI buttons" in Canvas

---

## <a id="mask-personnummer"></a> Mask personnummer

Test the functionality of `/backend/api/mask-file.js`.

1. Create two directories inside the `pnummer-masker` directory: `pnummer-masker/all/input` and `pnummer-masker/all/output`.

   ```
   cd pnummer-masker
   mkdir -p all/input
   mkdir -p all/output
   ```

2. Copy any PDF file into the `all/input` directory.
3. Run the file `pnummer-masker/index-all.js`

---

## Create button

- To create a button for one **course** run `node create-button/course`
- To create a button for one **subaccount** run `node create-button/account`
