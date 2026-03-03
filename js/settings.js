const nameInput = document.getElementById("nameInput");
const intervalInput = document.getElementById("intervalInput");
const saveBtn = document.getElementById("saveBtn");

nameInput.value = localStorage.getItem("userName") || "";
intervalInput.value = localStorage.getItem("pp_interval_min") || 40;

saveBtn.addEventListener("click", () => {
  localStorage.setItem("userName", nameInput.value.trim());
  localStorage.setItem("pp_interval_min", intervalInput.value);
  window.location.href = "widget.html";
});
