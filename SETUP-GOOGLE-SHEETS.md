# LAHI Portal – Google Sheets connection

The GitHub Pages portal cannot write directly to an `.xlsx` file on a computer. The recommended setup is Google Sheets + Apps Script Web App.

## 1. Prepare the sheet
Open the Google Sheet that will store student data. If you have an Excel `.xlsx`, upload it to Google Drive and open it with Google Sheets first.

## 2. Apps Script
Go to **Extensions → Apps Script**, replace the existing Code.gs with the included `Code.gs`, then save.

If the Apps Script is bound to that Google Sheet, leave `SPREADSHEET_ID` blank. Otherwise put the Google Sheet ID in `CONFIG.SPREADSHEET_ID`.

Run `setupSheets()` once. It creates/updates:
- `Student Progress` – one current row per student
- `Activity Log` – every mission/section/reflection/badge event

## 3. Deploy
Deploy → New deployment → Web app. Execute as **Me**. Set access to **Anyone**. Copy the URL ending in `/exec`.

## 4. Connect the portal
Open `config.js` and replace:
`PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`
with the `/exec` URL. Commit `config.js` to GitHub Pages.

## 5. What gets captured
Student profile, Mission 1 completion, Explore responses, four goals + sub-goals, daily reflections, badge unlocks, self-assessment, future pathway and employer feedback.

The portal saves locally first. If the internet is unavailable, the student can continue; the Google Sheet sync runs when a save/completion action occurs and the local data remains in the browser.
