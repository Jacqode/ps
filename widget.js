// ---------------------------------------------------------
// Plug & Pause – widget.js (ny UI-version)
// ---------------------------------------------------------

// Liste over aktiviteter (kan udvides)
const aktiviteter = [
  "Stræk nakken i 20 sek",
  "Tag 10 dybe vejrtrækninger",
  "Rejs dig og gå 30 sek",
  "Ryst skuldrene i 15 sek",
  "Se væk fra skærmen i 20 sek",
  "Drik et glas vand",
  "Lav 5 langsomme squats",
  "Stræk armene over hovedet",
  "Rul skuldrene 10 gange",
  "Gå udenfor i 1 minut"
];

// ---------------------------------------------------------
// Returnér en tilfældig aktivitet
// ---------------------------------------------------------
export function rulTerning() {
  const index = Math.floor(Math.random() * aktiviteter.length);
  return aktiviteter[index];
}

// ---------------------------------------------------------
// Hent companyId fra querystring
// ---------------------------------------------------------
export function getCompanyId() {
  const params
