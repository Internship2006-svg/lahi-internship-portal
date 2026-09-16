const KEY="lahi-internship-progress-v1";
let state=JSON.parse(localStorage.getItem(KEY)||'{"page":1,"done":[],"data":{}});

const $=s=>document.querySelector(s);
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1600)}
function page(){return PAGES[state.page-1]}
function get(k,d=""){return state.data[k]??d}
function set(k,v){state.data[k]=v;save();}

function input(k,label,type="text",placeholder=""){
  return `<div class="field"><label>${label}</label><input data-key="${k}" type="${type}" value="${esc(get(k))}" placeholder="${placeholder}"></div>`;
}
function textarea(k,label){
  return `<div class="field"><label>${label}</label><textarea data-key="${k}">${esc(get(k))}</textarea></div>`;
}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}

function renderNav(){
  const groups=[
    ["Start","1-5"],["Before your internship","6-10"],["Journey & goals","11-15"],
    ["Daily reflections","16-34"],["Learn Better","35-36"],["Finish & future","37-40"]
  ];
  $("#nav").innerHTML=groups.map(([name,range])=>{
    const [a,b]=range.split("-").map(Number);
    return `<div class="navGroup"><h4>${name}</h4>`+
      PAGES.slice(a-1,b).map(p=>`<button class="navItem ${state.page===p.pdfPage?"active":""} ${state.done.includes(p.pdfPage)?"done":""}" onclick="go(${p.pdfPage})">Page ${p.pdfPage}</button>`).join("")+
      `</div>`;
  }).join("");
}
function go(n){state.page=n;save();render();window.scrollTo({top:0,behavior:"smooth"});}

function render(){
  const p=page(), pct=Math.round((state.done.length/40)*100);
  $("#progressText").textContent=pct+"%";$("#progressBar").style.width=pct+"%";
  $("#studentName").textContent=get("name","Student");$("#studentTrade").textContent=get("trade","Your trade");
  $("#breadcrumbs").textContent=`Internship Journey / Page ${p.pdfPage} of 40`;
  $("#hero").innerHTML=`<div class="eyebrow">Page ${p.pdfPage}</div><h1>${titleFor(p)}</h1><p>${introFor(p)}</p>`;
  $("#activity").innerHTML=activityFor(p);
  $("#sourceText").textContent=p.sourceText;
  $("#prevBtn").disabled=p.pdfPage===1;$("#nextBtn").textContent=p.pdfPage===40?"Finish":"Next →";
  renderNav();bindFields();
}
function titleFor(p){
  const t=p.type;
  const titles={profile:"Your Internship Profile",safety:"Child Protection & Safety",welcome:"Welcome to Your Internship Journey",
  journey:"The Map to Your Internship Journey",map:"Your Internship Roadmap",before:"Before You Start",during:"For a Successful Internship",
  consent:"Internship Consent & Confirmation",safety_comic:"Stay Safe at Your Internship",skills_after:"Employability Skills & After Internship",
  step2:"Internship Journey Begins",observations:"Initial Observations",observations2:"What Did You Notice?",
  goal:"Set Your Internship Goals",reflection_intro:"Your Daily Reflections",reflection:"Daily Reflection",reflection_example:"Example: A Good Daily Reflection",
  reflection_quiz:"Challenge Time",reflection_badge:"Collect Your Badge",reflection_example2:"Example: Word Map & Goal Check-In",
  reflection_example3:"Example: Learning Through Drawings",trophy:"Learn Better Champion Trophy",method_intro:"The Secret Learning Method",
  learn_better:"The Learn Better Method",completion:"What Have You Learnt?",self_assessment:"Look How Far You’ve Come",future:"Finding Your Path After the Internship",employer:"Employer Feedback"};
  return titles[t]||"Internship Journey";
}
function introFor(p){
  const map={profile:"Start by entering the details that personalise your learning journey.",
  safety:"Your safety is the priority. Learn your rights, emergency numbers and who you can contact.",
  welcome:"An internship is a chance to work at a real workplace for a short time, try out a job and build skills.",
  observations:"Use your first few days to carefully observe the workplace before you start setting goals.",
  goal:"Turn what you observed into 3–4 clear learning goals and smaller sub-goals.",
  reflection:"Reflect every day: what happened, what you learned and why it matters.",
  learn_better:"You have been using the Learn Better Method: goals, planning, meaningful reflection and progress checks.",
  self_assessment:"Rate your employability skills before and after the internship and notice your progress.",
  future:"After the internship, explore higher education, skilling, jobs and apprenticeships.",
  employer:"The employer records feedback on workplace skills and areas for improvement."};
  return map[p.type]||"Work through this page step by step. Your progress is saved on this device.";
}

function activityFor(p){
  const t=p.type;
  if(t==="profile") return `<div class="card"><h2>My Internship Details</h2><div class="grid">
    ${input("name","Name")}${input("address","Address")}${input("school","School")}${input("standard","Standard")}${input("trade","Trade")}${input("employer","Employer Name")}${input("location","Internship Location")}${input("start","Start Date","date")}${input("end","End Date","date")}</div></div>`;
  if(t==="safety"||t==="safety_comic") return `<div class="card"><h2>Safety checkpoint</h2><div class="checklist">
    ${["I know where the first aid kit is.","I know the safety rules at my workplace.","I know which tools or equipment need to be handled carefully.","I know where the fire exit is.","I know who to go to if something feels unsafe.","I will not share personal information, passwords or photos with strangers.","I will report anything unsafe to my supervisor or teacher.","I will wear the right safety equipment."].map((x,i)=>`<label><input type="checkbox" data-key="safety${p.pdfPage}_${i}" ${get("safety"+p.pdfPage+"_"+i,false)?"checked":""}>${x}</label>`).join("")}</div><div class="success"><b>Important numbers:</b> 112 Emergency · 100 Police · 101 Fire · 108 Ambulance · 1098 Child Helpline</div></div>`;
  if(t==="consent") return `<div class="card"><h2>Consent & confirmation</h2><p>The handbook says the employer should provide a safe and supportive learning environment, guide trade-related work, monitor attendance and learning, inform the school before extending hours, and follow applicable child protection and workplace safety laws.</p><div class="grid">${input("consentStudent","Student Name")}${input("consentSchool","School Name")}${input("consentRole","Trade/Job Role")}${input("consentOrg","Internship Organisation")}</div><div class="checklist"><label><input type="checkbox" data-key="studentConsent" ${get("studentConsent",false)?"checked":""}> I agree to follow workplace rules, safety guidelines and employer/school instructions.</label><label><input type="checkbox" data-key="parentConsent" ${get("parentConsent",false)?"checked":""}> Parent/Guardian consent received.</label><label><input type="checkbox" data-key="employerConsent" ${get("employerConsent",false)?"checked":""}> Employer confirmation received.</label></div><div class="success">The source handbook states that the internship cannot start without signed Consent Form, Child Protection Policy & Safety Guidelines.</div></div>`;
  if(t==="observations") return `<div class="card"><h2>What skills did you notice?</h2><div class="checklist">${["Managing time properly","Working well with others in a team","Problem solving","Keeping the space neat and tidy","Handling customer complaints","Speaking confidently and clearly","Being open to feedback","Knowing proper tools/programs to use","Taking initiative","Listening with attention","Behaving politely with everyone","Being attentive and alert"].map((x,i)=>`<label><input type="checkbox" data-key="obsSkill${i}" ${get("obsSkill"+i,false)?"checked":""}>${x}</label>`).join("")}</div>${textarea("otherSkills","Other skills I noticed")}</div>`;
  if(t==="observations2") return `<div class="card"><h2>Capture what you saw</h2>${textarea("tools","What tools or machines are being used?")}${textarea("interesting","What are some things you found interesting?")}${textarea("surprised","Did anything surprise you?")}${textarea("useful","Anything useful you would like to learn?")}</div>`;
  if(t==="goal") return `<div class="card"><h2>Goal #${p.pdfPage===14?1:2}</h2><div class="grid">${textarea("goal"+p.pdfPage,"What specific skill do you want to learn?")}${textarea("why"+p.pdfPage,"Why is this important to you?")}</div>${[1,2,3,4].map(i=>textarea("goal"+p.pdfPage+"_sub"+i,"Sub-goal "+i)).join("")}${textarea("progress"+p.pdfPage,"How will you know you’re making progress?")}</div>`;
  if(["reflection","reflection_intro"].includes(t)) return `<div class="card"><h2>Today's reflection</h2>${input("todayDate"+p.pdfPage,"Date","date")}${textarea("goalRef"+p.pdfPage,"Goal")}${textarea("subgoalRef"+p.pdfPage,"Sub-goal")}${textarea("newKnowledge"+p.pdfPage,"Record your new knowledge")}${textarea("organise"+p.pdfPage,"Organise new knowledge: short summary, drawing or word map")}${textarea("connect"+p.pdfPage,"Connect old & new knowledge: what does this remind you of?")}<div class="checklist"><label><input type="checkbox" data-key="taskDone${p.pdfPage}" ${get("taskDone"+p.pdfPage,false)?"checked":""}> Did you finish your assigned task for today?</label></div></div>`;
  if(t==="reflection_quiz") return quizFor(p.pdfPage);
  if(t==="reflection_badge") return `<div class="card" style="text-align:center"><div class="badge">🏅</div><h2>Badge checkpoint</h2><p>Complete the learning activity on this page, then mark your badge as collected.</p><label><input type="checkbox" data-key="badge${p.pdfPage}" ${get("badge"+p.pdfPage,false)?"checked":""}> Collect badge</label></div>`;
  if(t==="trophy") return `<div class="card" style="text-align:center"><div class="badge">🏆</div><h2>You are a Learn Better Champion!</h2><p>Collecting all 4 badges = Champion Trophy.</p><label><input type="checkbox" data-key="trophy" ${get("trophy",false)?"checked":""}> Tick to collect your trophy</label></div>`;
  if(t==="self_assessment") return `<div class="card"><h2>Employability Skills</h2><p>Rate yourself honestly. This is not a test; it is a way to see your progress.</p>${["Communication Skills","Problem Solving","Active Listening","Taking Initiative","Teamwork","Time Management"].map((s,i)=>`<div class="grid"><div class="field"><label>${s} — before</label><select data-key="before${i}">${opts()}</select></div><div class="field"><label>${s} — after</label><select data-key="after${i}">${opts()}</select></div></div>`).join("")}${textarea("otherLearnedSkills","Other skills you learnt")}${input("hoursCompleted","No. of hours completed","number")}</div>`;
  if(t==="future") return `<div class="card"><h2>Think about your future</h2><p>The source lists higher education, skilling and jobs, and paid apprenticeship as possible paths.</p><div class="checklist"><label><input type="radio" name="sameTrade" data-key="sameTrade" value="Yes"> Yes — continue studying or working in the same trade</label><label><input type="radio" name="sameTrade" data-key="sameTrade" value="No"> No — explore another trade/career</label></div>${textarea("futureCareer","If No, which trade or career would you like to explore?")}</div>`;
  if(t==="employer") return `<div class="card"><h2>Employer Feedback</h2>${input("employerStudent","Student Name")}${["Attendance & Punctuality","Professional Behaviour","Learning Ability","Communication","Technical Skills","Problem Solving"].map((s,i)=>`<div class="field"><label>${s}</label><select data-key="employerSkill${i}"><option value="">Select rating</option><option>Needs support</option><option>Developing</option><option>Good</option><option>Strong</option></select></div>`).join("")}${textarea("employerStrength","One strength of the student")}${textarea("employerImprovement","One area for improvement")}${input("employerName","Employer Name")}</div>`;
  if(t==="learn_better") return `<div class="card"><h2>Four steps of the Learn Better Method</h2><div class="grid"><div class="card">1️⃣ <b>Setting goals</b><p>Choose skills you want to learn.</p></div><div class="card">2️⃣ <b>Making a plan</b><p>Break goals into smaller sub-goals.</p></div><div class="card">3️⃣ <b>Daily meaningful reflection</b><p>Record, organise and connect learning.</p></div><div class="card">4️⃣ <b>Checking progress</b><p>Use reflections and goal check-ins.</p></div></div></div>`;
  return `<div class="card"><h2>Read, try and move forward</h2><p>Use the original handbook content below as your reference. When you finish this checkpoint, click “Mark page complete” and continue.</p><button class="primaryBtn" onclick="markDone(${p.pdfPage})">✓ Mark page complete</button></div>`;
}
function opts(){return `<option value="">Select</option><option>Did not know this</option><option>Know this a little</option><option>Know this well</option>`}
function quizFor(n){
  const qs={19:[["A good summary is:",["Long & detailed","Short & in your own words"],1],["After summarising, you should:",["Get feedback from your mentor","Forget about it and move on"],0]],
  20:[["Word maps help organise:",["processes","stories"],0],["Word maps show how things are:",["different","connected"],1]],
  30:[["A drawing needs to look perfect to be useful.",["True","False"],1],["You should label each part of the drawing.",["True","False"],0],["Drawings can help understand new tools.",["True","False"],0]],
  33:[["You cannot teach what you learned to your friend. What does this mean?",["You need to ask your mentor for help","It was not important"],1],["How should you start your daily reflections?",["Focus on important & new knowledge","Write whatever catches your attention"],0]]}[n]||[];
  return `<div class="card"><h2>Challenge Time</h2>${qs.map((q,qi)=>`<div class="quiz" data-q="${qi}"><b>Q${qi+1}. ${q[0]}</b>${q[1].map((o,oi)=>`<div class="quizOption" data-correct="${oi===q[2]}" onclick="answer(this)">${o}</div>`).join("")}</div>`).join("")}<div id="quizResult"></div></div>`;
}
function answer(el){el.parentElement.querySelectorAll(".quizOption").forEach(x=>x.classList.remove("correct","wrong"));el.classList.add(el.dataset.correct==="true"?"correct":"wrong");}
function bindFields(){
  document.querySelectorAll("[data-key]").forEach(el=>{
    el.onchange=()=>{let v=el.type==="checkbox"?el.checked:el.value;set(el.dataset.key,v);updateHeader()};
    el.oninput=()=>{if(el.tagName==="TEXTAREA"||el.tagName==="INPUT"){set(el.dataset.key,el.value);updateHeader()}};
  });
}
function updateHeader(){ $("#studentName").textContent=get("name","Student");$("#studentTrade").textContent=get("trade","Your trade"); }
function markDone(n){if(!state.done.includes(n))state.done.push(n);save();toast("Page completed ✓");renderNav();render();}
$("#nextBtn").onclick=()=>{markDone(state.page);if(state.page<40)go(state.page+1)};
$("#prevBtn").onclick=()=>{if(state.page>1)go(state.page-1)};
$("#saveBtn").onclick=()=>{save();toast("Saved on this device ✓")};
$("#menuBtn").onclick=()=>$("#sidebar").classList.toggle("open");
$("#exportBtn").onclick=()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="my-internship-progress.json";a.click();
};
render();
