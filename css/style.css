document.addEventListener("DOMContentLoaded", () => {
    const nameInput = document.getElementById("nameInput");
    const intervalInput = document.getElementById("intervalInput");
    const saveBtn = document.getElementById("saveBtn");

    // Indlæs eksisterende værdier
    nameInput.value = localStorage.getItem("userName") || "";
    intervalInput.value = localStorage.getItem("reminderInterval") || 30;

    // Gem nye værdier
    saveBtn.addEventListener("click", () => {
        const name = nameInput.value.trim();
        const interval = Number(intervalInput.value);

        if (name.length > 0) {
            localStorage.setItem("userName", name);
        }

        if (interval > 0) {
            localStorage.setItem("reminderInterval", interval);
        }

        alert("Indstillinger gemt");
    });
});
