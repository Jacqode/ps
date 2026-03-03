document.addEventListener("DOMContentLoaded", () => {
    const nameInput = document.getElementById("nameInput");
    const intervalInput = document.getElementById("intervalInput");
    const saveBtn = document.getElementById("saveBtn");

    nameInput.value = localStorage.getItem("userName") || "";
    intervalInput.value = localStorage.getItem("reminderInterval") || 30;

    saveBtn.addEventListener("click", () => {
        localStorage.setItem("userName", nameInput.value.trim());
        localStorage.setItem("reminderInterval", intervalInput.value);
        alert("Indstillinger gemt");
    });
});
