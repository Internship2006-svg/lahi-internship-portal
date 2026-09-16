// Shared portal logic can be added here as the journey grows.
function getXP(){ return Number(localStorage.getItem("lahiXP") || 0); }
function addXP(points){ localStorage.setItem("lahiXP", String(getXP()+points)); }