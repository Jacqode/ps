document.addEventListener("DOMContentLoaded", () => {
  const ideaBtn = document.getElementById("ideaBtn");
  const doneBtn = document.getElementById("doneBtn");
  const currentIdea = document.getElementById("currentIdea");
  const microFeedback = document.getElementById("microFeedback");

  const ideas = [
    "Stræk armene over hovedet i 20 sekunder.",
    "Rul skuldrene 10 gange bagud.",
    "Rejs dig op og tag 10 langsomme vejrtrækninger.",
    "Lav 15 sekunders let sidebøjninger.",
    "Gå på stedet i 30 sekunder."
  ];

  ideaBtn.addEventListener("click", () => {
    const idea = ideas[Math.floor(Math.random() * ideas.length)];
    currentIdea.textContent = idea;
  });

  doneBtn.addEventListener("click", () => {
    microFeedback.style.display = "block";

    setTimeout(() => {
      microFeedback.style.display = "none";
    }, 9000); // 9 sekunder
  });
});
