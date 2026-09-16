# LAHI Internship Journey — Free GitHub Pages Starter

This starter converts the supplied 40-page **LAHI Internship Toolkit** into a mobile-friendly, page-by-page web experience.

## What is included
- `index.html` — one responsive portal shell.
- `style.css` — mobile-first UI, cards, progress bar and light animation.
- `content.js` — all 40 source pages extracted from the supplied PDF. Each page keeps the original handbook text in a collapsible source section.
- `app.js` — page navigation, interactive forms, quizzes, badges, local progress saving and JSON export.
- `apps-script/Code.gs` — optional Google Sheets backend.
- `manifest.json` — basic PWA support.

## Important design decision
Do **not** create 40 separate HTML files. The better developer approach is:
1. one reusable page renderer;
2. 40 content records;
3. page-specific interactive components;
4. one data model that can later feed a dashboard.

This makes translation, content edits and future state/trade variants much easier.

## Free hosting
Use GitHub Pages. It can host this static site without a paid subscription.

### GitHub steps
1. Create a GitHub account if needed.
2. Create a new repository, e.g. `lahi-internship-portal`.
3. Upload the files/folders from this project.
4. Go to **Settings → Pages**.
5. Under Build and deployment choose **Deploy from a branch**.
6. Select `main` and `/ (root)`.
7. Save.
8. GitHub will provide the public Pages URL.

### Git command line
```bash
git clone https://github.com/YOUR-ORG/lahi-internship-portal.git
cd lahi-internship-portal
# copy the project files here
git add .
git commit -m "Initial LAHI internship portal"
git push origin main
```

## Student access
The portal is designed for:
- phone browser;
- QR code;
- one short URL;
- no app installation;
- no paid subscription.

Recommended QR flow:
**School/VT shares QR → student scans → portal opens → student enters profile → works page-by-page.**

## Data
The starter saves progress in the student's browser using `localStorage`. This means it works without a backend, but the data is device-specific.

For central program monitoring, connect the portal to Google Sheets using the supplied Apps Script. Google Sheets/Apps Script can be used at no subscription cost, subject to Google's current quotas and account policies.

For minors, avoid putting names, phone numbers, addresses, photos or other sensitive information in public GitHub files. Keep student responses in the private Sheet/backend.

## Recommended next development
1. Add LAHI branding and final UI.
2. Replace raw source text presentation with designed learning cards while retaining every source detail.
3. Add Hindi/Marathi content as separate language JSON files.
4. Add student ID login or school-issued code.
5. Add central Google Sheet submission.
6. Add VT/program dashboard.
7. Add optional audio narration and low-bandwidth mode.
8. Add consent/privacy wording reviewed by LAHI before collecting student data.
