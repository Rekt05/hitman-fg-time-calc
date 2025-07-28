document.addEventListener("DOMContentLoaded", () => {
  const levelData = {
    "Trilogy": [
      "Paris", "Sapienza", "Marrakesh", "Bangkok", "Colorado", "Hokkaido",
      "Hawke's Bay", "Miami", "Santa Fortuna", "Mumbai", "Whittleton Creek",
      "Ambrose Island", "Isle of Sgàil", "New York", "Haven Island", "Dubai", 
      "Dartmoor", "Berlin", "Chongqing", "Mendoza", "Romania"
    ],
    "Season 1": [
      "Paris", "Sapienza", "Marrakesh", "Bangkok", "Colorado", "Hokkaido"
    ],
    "Season 2": [
      "Hawke's Bay", "Miami", "Santa Fortuna", "Mumbai", "Whittleton Creek",
      "Ambrose Island", "Isle of Sgàil", "New York", "Haven Island"
    ],
    "Season 3": [
       "Dubai","Dartmoor", "Berlin", "Chongqing", "Mendoza", "Romania"
    ],
    "Patient Zero": [
      "Source", "Author", "Vector", "Patient Zero (Hokkaido)"
    ],
    "Sarajevo Six": [
      "The Director", "The Enforcer", "The Extractor", "The Veteran",
      "The Mercenary", "The Controller"
    ]
  };

  const rowCountInput = document.getElementById("rowCount");
  const tableBody = document.getElementById("tableBody");

  function bindDynamicEvents() {
    const timeInputs = [...document.querySelectorAll('input[name^="time"]')];

    timeInputs.forEach((input, idx) => {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Tab" || e.key === "Enter") {
          e.preventDefault();
          let nextIndex;
          if (!e.shiftKey) {
            nextIndex = (idx + 1) % timeInputs.length;
          } else {
            nextIndex = (idx - 1 + timeInputs.length) % timeInputs.length;
          }
          timeInputs[nextIndex].focus();
        }
      });

      input.addEventListener("input", updateTimes);
    });
  }

  function generateRows(count) {
  const oldTimes = [];
  const oldLevels = [];

  for (let i = 1; i <= 100; i++) {
    const timeInput = document.getElementById(`t${i}`);
    const levelInput = document.getElementById(`ln${i}`);
    oldTimes[i] = timeInput ? timeInput.value : "";
    oldLevels[i] = levelInput ? levelInput.value : "";
  }

  tableBody.innerHTML = "";
  for (let i = 1; i <= count; i++) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="text" name="time${i}" id="t${i}" value="${oldTimes[i] || ""}" /></td>
      <td><input type="text" name="cumulative${i}" id="cumulative${i}" readonly /></td>
      <td><input type="text" name="level${i}" id="ln${i}" value="${oldLevels[i] || ""}" /></td>
    `;
    tableBody.appendChild(row);
  }

  bindDynamicEvents();
  updateTimes();
}


  const savedRowCount = parseInt(localStorage.getItem("rowCount"), 10);
  const initialCount = !isNaN(savedRowCount) ? savedRowCount : 40;
  rowCountInput.value = initialCount;
  generateRows(initialCount);

  rowCountInput.addEventListener("input", () => {
    const value = parseInt(rowCountInput.value, 10);
    if (value > 0 && value <= 100) {
      localStorage.setItem("rowCount", value);
      generateRows(value);
    }
  });

  const buttons = document.querySelectorAll(".left-panel button");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const levels = levelData[button.textContent];
      if (!levels) return;

      const currentCount = parseInt(localStorage.getItem("rowCount") || "40", 10);
      for (let i = 1; i <= currentCount; i++) {
        const levelInput = document.querySelector(`input[name="level${i}"]`);
        if (levelInput) levelInput.value = "";
      }

      levels.forEach((levelName, index) => {
        const levelInput = document.querySelector(`input[name="level${index + 1}"]`);
        if (levelInput) levelInput.value = levelName;
      });
    });
  });

  function parseCustomTime(str) {
    str = str.trim();

    if (str.includes(":")) {
      const parts = str.split(":");
      if (parts.length !== 2) return NaN;
      const min = parseInt(parts[0], 10);
      const sec = parseInt(parts[1], 10);
      if (isNaN(min) || isNaN(sec) || sec < 0 || sec >= 60 || min < 0) return NaN;
      return min * 60 + sec;
    } else if (/^\d+$/.test(str)) {
      if (str.length <= 2) {
        const sec = parseInt(str, 10);
        if (sec >= 60) return NaN;
        return sec;
      } else {
        const minPart = str.slice(0, -2);
        const secPart = str.slice(-2);
        const min = parseInt(minPart, 10);
        const sec = parseInt(secPart, 10);
        if (isNaN(min) || isNaN(sec) || sec < 0 || sec >= 60 || min < 0) return NaN;
        return min * 60 + sec;
      }
    }
    return NaN;
  }

  function formatTimeString(totalSeconds) {
    if (totalSeconds < 0) totalSeconds = 0;
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  function updateTimes() {
    let sumSeconds = 0;
    const timeInputs = [...document.querySelectorAll('input[name^="time"]')];

    timeInputs.forEach((input, index) => {
      const originalVal = input.value.trim();
      const seconds = parseCustomTime(originalVal);
      const cumInput = document.querySelector(`input[name="cumulative${index + 1}"]`);

      if (!isNaN(seconds)) {
        // m:ss if no ":" and length > 2 (aka = 3 in this use case)
        if (!originalVal.includes(":") && originalVal.length > 2) {
          input.value = formatTimeString(seconds);
        }

        sumSeconds += seconds;
        if (cumInput) {
          cumInput.value = formatTimeString(sumSeconds);
        }
      } else {
        if (cumInput) cumInput.value = "";
      }
    });
  }

  document.getElementById("btnClearAll").addEventListener("click", () => {
    const allInputs = document.querySelectorAll('input[type="text"]');
    allInputs.forEach(input => input.value = "");
    updateTimes();
  });

  //save as link
  document.getElementById("btnSaveLink").addEventListener("click", async () => {
    const times = [];
    const levels = [];

    const currentCount = parseInt(localStorage.getItem("rowCount") || "40", 10);
    for (let i = 1; i <= currentCount; i++) {
      const timeInput = document.getElementById(`t${i}`);
      const levelInput = document.getElementById(`ln${i}`);
      if (!timeInput || !levelInput) continue;

      times.push(encodeURIComponent(timeInput.value.trim()));
      levels.push(encodeURIComponent(levelInput.value.trim()));
    }

    function trimTrailingEmpty(arr) {
      let i = arr.length - 1;
      while (i >= 0 && (arr[i] === "" || arr[i] === undefined)) {
        arr.pop();
        i--;
      }
    }

    trimTrailingEmpty(times);
    trimTrailingEmpty(levels);

    const url = new URL(window.location.href.split('?')[0]);
    url.searchParams.set("times", times.join(","));
    url.searchParams.set("levels", levels.join(","));
    const fullLink = url.toString();

    try {
      await navigator.clipboard.writeText(fullLink);
      alert(fullLink+"has been copied to clipboard!");
    } catch (err) {
      prompt("Couldn't auto-copy. Please copy manually:", fullLink);
    }
  });

  const urlParams = new URLSearchParams(window.location.search);
  const times = urlParams.get("times");
  const levels = urlParams.get("levels");

  if (times && levels) {
  const timesArray = times.split(",").map(decodeURIComponent);
  const levelsArray = levels.split(",").map(decodeURIComponent);
  const requiredCount = Math.max(timesArray.length, levelsArray.length);

  const savedCount = parseInt(localStorage.getItem("rowCount") || "40", 10);
  if (requiredCount > savedCount) {
    localStorage.setItem("rowCount", requiredCount);
    rowCountInput.value = requiredCount;
    generateRows(requiredCount);
  }

  for (let i = 0; i < requiredCount; i++) {
    const t = timesArray[i] || "";
    const ln = levelsArray[i] || "";

    const timeInput = document.getElementById(`t${i + 1}`);
    const levelInput = document.getElementById(`ln${i + 1}`);
    if (timeInput) timeInput.value = t;
    if (levelInput) levelInput.value = ln;

    if (t) timeInput?.dispatchEvent(new Event("input"));
  }
}

});

//dark/light mode togglee
function toggleDarkMode() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

(function () {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
        document.body.classList.add('light-mode');
    }
})();
