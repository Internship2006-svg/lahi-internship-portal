/**
 * LAHI Internship Portal -> Google Sheets connector
 *
 * 1. Put this code in Extensions > Apps Script of the Google Sheet.
 * 2. Change SPREADSHEET_ID if this script is NOT bound to the sheet.
 * 3. Run setupSheets() once and approve permissions.
 * 4. Deploy > New deployment > Web app.
 *    Execute as: Me
 *    Who has access: Anyone
 * 5. Copy the /exec URL into config.js in the portal.
 */
const CONFIG = {
  SPREADSHEET_ID: '', // Leave blank if this Apps Script is bound to the target Google Sheet.
  STUDENT_SHEET: 'LAHI Portal Data',
  LOG_SHEET: 'LAHI Activity Log'
};

const STUDENT_HEADERS = [
  'Last Updated','Student ID','Student Name','School Name','Class','State','Trade / Job Role','Internship Organisation','Start Date','End Date',
  'Mission 1','Mission 2','Mission 3','Mission 4','XP','Badge Count','Badges Unlocked',
  'Explore - Workplace','Explore - Workplace Does','Explore - Products/Services','Explore - People','Explore - Tools','Explore - Interesting','Explore - Surprised','Explore - Learn Tools','Explore - Skills Noticed','Explore - Skills To Learn','Explore - Safety',
  'Goals','Goals - Trainer/Employer Feedback','Reflections Saved','Reflections JSON',
  'Learn Better - Summarising','Learn Better - Word Map','Learn Better - Drawing','Learn Better - Consistency','Learn Better - Champion',
  'Self Assessment JSON','Future Pathway JSON','Employer Feedback JSON','Raw Portal JSON'
];

const LOG_HEADERS = ['Timestamp','Event','Student ID','Student Name','Mission 1','Mission 2','Mission 3','Mission 4','XP','Badge Count','Badges','Details JSON'];

function getSS_(){ return CONFIG.SPREADSHEET_ID ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet(); }

function getOrCreateSheet_(name, headers){
  const ss=getSS_();
  let sh=ss.getSheetByName(name);
  if(!sh) sh=ss.insertSheet(name);
  if(sh.getLastRow()===0){ sh.getRange(1,1,1,headers.length).setValues([headers]); sh.setFrozenRows(1); }
  else if(sh.getLastColumn()<headers.length){ sh.getRange(1,1,1,headers.length).setValues([headers]); }
  return sh;
}

function setupSheets(){
  getOrCreateSheet_(CONFIG.STUDENT_SHEET, STUDENT_HEADERS);
  getOrCreateSheet_(CONFIG.LOG_SHEET, LOG_HEADERS);
}

function doGet(){
  return ContentService.createTextOutput(JSON.stringify({ok:true,service:'LAHI Internship Portal'})).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e){
  try{
    const raw=(e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    const data=JSON.parse(raw);
    const result=savePortalData_(data);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)})).setMimeType(ContentService.MimeType.JSON);
  }
}

function savePortalData_(data){
  setupSheets();
  const ss=getSS_();
  const studentSh=ss.getSheetByName(CONFIG.STUDENT_SHEET);
  const logSh=ss.getSheetByName(CONFIG.LOG_SHEET);
  const p=data.student||{};
  const progress=data.progress||{};
  const explore=data.explore||{};
  const goals=data.goals||{};
  const finalData=data.final||{};
  const badges=data.badges||{};
  const reflections=data.reflections||{};
  const studentId=String(p.studentId||'').trim();
  const studentName=String(p.studentName||'').trim();
  const key=studentId || (studentName+'|'+String(p.schoolName||'').trim());
  if(!key) throw new Error('Student ID or Student Name is required.');

  const reflectionKeys=Object.keys(reflections);
  const row=[
    new Date(),p.studentId||'',p.studentName||'',p.schoolName||'',p.studentClass||'',p.stateName||'',p.tradeName||'',p.organisationName||'',p.startDate||'',p.endDate||'',
    progress.mission1?'Complete':'',progress.mission2?'Complete':'',progress.mission3?'Complete':'',progress.mission4?'Complete':'',progress.xp||0,progress.badges||0,badgeNames_(badges).join(', '),
    explore.where||'',explore.does||'',explore.products||'',JSON.stringify(explore.people||[]),explore.tools||'',explore.interesting||'',explore.surprised||'',explore.learnTools||'',JSON.stringify(explore.skills||[]),explore.wantSkills||'',JSON.stringify(explore.safety||[]),
    JSON.stringify(goals),goals.discussion||'',reflectionKeys.length,JSON.stringify(reflections),
    badges.summarising?'Unlocked':'',badges.wordmap?'Unlocked':'',badges.drawing?'Unlocked':'',badges.consistency?'Unlocked':'',badges.learnbetter?'Unlocked':'',
    JSON.stringify(selfAssessment_(finalData)),JSON.stringify(future_(finalData)),JSON.stringify(employer_(finalData)),JSON.stringify(data)
  ];

  const values=studentSh.getDataRange().getValues();
  let targetRow=-1;
  for(let i=1;i<values.length;i++){
    const existingId=String(values[i][1]||'').trim();
    const existingName=String(values[i][2]||'').trim();
    const existingSchool=String(values[i][3]||'').trim();
    if((studentId && existingId===studentId) || (!studentId && existingName===studentName && existingSchool===String(p.schoolName||'').trim())){ targetRow=i+1; break; }
  }
  if(targetRow===-1){ targetRow=studentSh.getLastRow()+1; }
  studentSh.getRange(targetRow,1,1,row.length).setValues([row]);

  const logRow=[new Date(),data.event||'save',p.studentId||'',p.studentName||'',!!progress.mission1,!!progress.mission2,!!progress.mission3,!!progress.mission4,progress.xp||0,progress.badges||0,badgeNames_(badges).join(', '),JSON.stringify(data.extra||{})];
  logSh.appendRow(logRow);
  return {ok:true,row:targetRow,event:data.event||'save'};
}

function badgeNames_(b){
  const names=[];
  const map={prepare:'Prepare Badge',safety:'Safety First',explorer:'Workplace Explorer',goalsetter:'Goal Setter',summarising:'Summarising',wordmap:'Word Map',drawing:'Drawing',consistency:'Consistency',learnbetter:'Learn Better Champion Trophy'};
  Object.keys(map).forEach(k=>{if(b[k])names.push(map[k]);}); return names;
}
function selfAssessment_(d){ const o={}; for(let i=0;i<6;i++){o['skill'+i+'Before']=d['before'+i]||'';o['skill'+i+'After']=d['after'+i]||'';} o.other=d.other||'';o.hours=d.hours||'';o.safe=d.safe||''; return o; }
function future_(d){return {sameTrade:d.sameTrade||'',future:d.future||''};}
function employer_(d){const o={strength:d.strength||'',improve:d.improve||'',employerName:d.employerName||''};for(let i=0;i<6;i++)o['rating'+i]=d['employerRating'+i]||'';return o;}
