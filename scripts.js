let msMode = false;

document.addEventListener("DOMContentLoaded", () => {
  msMode = localStorage.getItem("msMode") === "true";
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
      <td><input type="text" name="time${i}" id="t${i}" value="${oldTimes[i] || ""}" data-mapname="${oldLevels[i] || ""}" /></td>
      <td><input type="text" name="cumulative${i}" id="cumulative${i}" readonly /></td>
      <td><input type="text" name="level${i}" id="ln${i}" value="${oldLevels[i] || ""}" /></td>
    `;
    tableBody.appendChild(row);
  }

  bindDynamicEvents();
  updateTimes();

  for (let i = 1; i <= count; i++) {
  const timeInput = document.getElementById(`t${i}`);
  const levelInput = document.getElementById(`ln${i}`);
  if (timeInput && levelInput) {
    timeInput.dataset.mapname = levelInput.value.trim();
  }
}
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

      let currentCount = parseInt(localStorage.getItem("rowCount") || "40", 10);

      if (levels.length > currentCount) {
        currentCount = levels.length;
        localStorage.setItem("rowCount", currentCount);
        rowCountInput.value = currentCount;
      }
      generateRows(currentCount);

      for (let i = 1; i <= currentCount; i++) {
        const levelInput = document.querySelector(`input[name="level${i}"]`);
        if (levelInput) levelInput.value = "";
      }

      levels.forEach((levelName, index) => {
        const levelInput = document.querySelector(`input[name="level${index + 1}"]`);
        if (levelInput) levelInput.value = levelName;
      });

      for (let i = 1; i <= currentCount; i++) {
      const timeInput = document.getElementById(`t${i}`);
      const levelInput = document.getElementById(`ln${i}`);
      if (timeInput && levelInput) {
        timeInput.dataset.mapname = levelInput.value.trim();
      }}
    });
  });

  function parseCustomTime(str) {
  str = str.trim();

  if (msMode) {
    if (/^\d{6}$/.test(str)) {
      const m = parseInt(str, 10);
      //ms formula thanks solder
      const resultSeconds = Math.round((210000 - m) * (3 / 400) * 1000) / 1000;
      return resultSeconds;
    }
    return NaN;
  }

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
        if (!msMode && !originalVal.includes(":") && originalVal.length > 2) {
          input.value = formatTimeString(seconds);
        }

        sumSeconds += seconds;
        if (cumInput) {
        if (msMode) {
          const minutes = Math.floor(sumSeconds / 60);
          const secs = (sumSeconds % 60).toFixed(3).padStart(6, "0");
          cumInput.value = `${minutes}:${secs}`;
        } else {
          cumInput.value = formatTimeString(sumSeconds);
        }
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

  document.getElementById("btnClearTimes").addEventListener("click", () => {
  const currentCount = parseInt(localStorage.getItem("rowCount") || "40", 10);
    for (let i = 1; i <= currentCount; i++) {
      const timeInput = document.getElementById(`t${i}`);
      timeInput.value = "";
    }
  updateTimes();
  });

function isSixDigitCode(s) {
  return /^\d{6}$/.test(s);
}

function secondsToSixDigitCode(seconds) {
  const m = Math.round(210000 - seconds * (400 / 3));
  return String(m).padStart(6, "0").slice(-6);
}

function parseDisplaySeconds(val) {
  if (val.includes(":")) {
    const [minPart, secPart] = val.split(":");
    const minutes = parseInt(minPart, 10);
    const secs = parseFloat(secPart);
    if (isNaN(minutes) || isNaN(secs)) return NaN;
    return minutes * 60 + secs;
  }
  const f = parseFloat(val);
  return isNaN(f) ? NaN : f;
}

//Save as link
document.getElementById("btnSaveLink").addEventListener("click", async () => {
  const times = [];
  const levels = [];

  const currentCount = parseInt(localStorage.getItem("rowCount") || "40", 10);
  for (let i = 1; i <= currentCount; i++) {
    const timeInput = document.getElementById(`t${i}`);
    const levelInput = document.getElementById(`ln${i}`);
    if (!timeInput || !levelInput) continue;

    const rawVal = timeInput.value.trim();

    if (msMode) {
      if (isSixDigitCode(rawVal)) {
        times.push(encodeURIComponent(rawVal));
      } else {
        const secs = parseDisplaySeconds(rawVal);
        if (!isNaN(secs)) {
          const mCode = secondsToSixDigitCode(secs);
          times.push(encodeURIComponent(mCode));
        } else {
          times.push("");
        }
      }
    } else {
      times.push(encodeURIComponent(rawVal));
    }

    levels.push(encodeURIComponent(levelInput.value.trim()));
  }

  function trimTrailingEmpty(arr) {
    while (arr.length && (arr[arr.length - 1] === "" || arr[arr.length - 1] === undefined)) {
      arr.pop();
    }
  }

  trimTrailingEmpty(times);
  trimTrailingEmpty(levels);

  const url = new URL(window.location.href.split("?")[0]);
  url.searchParams.set("times", times.join(","));
  url.searchParams.set("levels", levels.join(","));
  const fullLink = url.toString();

  try {
    await navigator.clipboard.writeText(fullLink);
    alert(fullLink + " has been copied to clipboard!");
  } catch (err) {
    prompt("Couldn't auto-copy. Please copy manually:", fullLink);
  }
});

const urlParams = new URLSearchParams(window.location.search);
const timesParam = urlParams.get("times");
const levelsParam = urlParams.get("levels");

if (timesParam) {
  const timesArray = timesParam.split(",").map(decodeURIComponent);
  
  const allTimesValidMs = timesArray.filter(t => t.trim() !== "").every(t => /^\d{6}$/.test(t.trim()));
  
  if (allTimesValidMs) {
    msMode = true;
    localStorage.setItem("msMode", "true");

    const fastInputToggle = document.getElementById("fastInputToggle");
    if (fastInputToggle) {
      fastInputToggle.checked = false;
      fastInputToggle.disabled = true;
    }

    alert("Detected MS mode times in URL, MS mode has been automatically enabled.");
  } else {
    if (localStorage.getItem("msMode") === "true") {
      msMode = false;
      localStorage.setItem("msMode", "false");

      const fastInputToggle = document.getElementById("fastInputToggle");
      if (fastInputToggle) {
        fastInputToggle.disabled = false;
      }

      alert("Detected Non MS mode times in URL, MS mode has been automatically disabled.");
    }
  }
}

if (timesParam && levelsParam) {
  const timesArray = timesParam.split(",").map(decodeURIComponent);
  const levelsArray = levelsParam.split(",").map(decodeURIComponent);
  const requiredCount = Math.max(timesArray.length, levelsArray.length);

  const savedCount = parseInt(localStorage.getItem("rowCount") || "40", 10);
  if (requiredCount > savedCount) {
    localStorage.setItem("rowCount", requiredCount);
    rowCountInput.value = requiredCount;
    generateRows(requiredCount);
  }

  for (let i = 0; i < requiredCount; i++) {
    const t = (timesArray[i] || "").trim();
    const ln = levelsArray[i] || "";

    const timeInput = document.getElementById(`t${i + 1}`);
    const levelInput = document.getElementById(`ln${i + 1}`);
    if (levelInput) levelInput.value = ln;

    if (!timeInput) continue;

    if (msMode) {
      if (isSixDigitCode(t)) {
        timeInput.value = t;
      } else {
        const secs = parseDisplaySeconds(t);
        if (!isNaN(secs)) {
          timeInput.value = secondsToSixDigitCode(secs);
        } else {
          timeInput.value = "";
        }
      }
    } else {
      timeInput.value = t;
    }

    if (timeInput.value) timeInput.dispatchEvent(new Event("input"));
  }

  for (let i = 1; i <= requiredCount; i++) {
    const timeInput = document.getElementById(`t${i}`);
    const levelInput = document.getElementById(`ln${i}`);
    if (timeInput && levelInput) {
      timeInput.dataset.mapname = levelInput.value.trim();
    }
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

//fast inputting toggle
document.addEventListener("DOMContentLoaded", function () {
  const fastInputToggle = document.getElementById("fastInputToggle");
  const savedFastInput = localStorage.getItem("fastSplits") === "true";
  fastInputToggle.checked = savedFastInput;

  fastInputToggle.addEventListener("change", function () {
    localStorage.setItem("fastSplits", fastInputToggle.checked);
  });
});

const mapTimeExpectations = {
  "Paris": 2, "Sapienza": 2, "Marrakesh": 2, "Bangkok": 2, "Colorado": 2, "Hokkaido": 2,
  "Hawke's Bay": 3, "Miami": 2, "Santa Fortuna": 3, "Mumbai": 3, "Whittleton Creek": 3,
  "Ambrose Island": 2, "Isle of Sgàil": 2, "New York": 3, "Haven Island": 2, "Dubai": 2,
  "Dartmoor": 2, "Berlin": 2, "Chongqing": 2, "Mendoza": 2, "Romania": 3
};

document.addEventListener("keyup", function (e) {
  const fastInputToggle = document.getElementById("fastInputToggle");
  if (!fastInputToggle || !fastInputToggle.checked) return;
  if (e.target.tagName !== "INPUT" || e.target.type !== "text") return;

  const currentInput = e.target;
  const mapName = currentInput.dataset.mapname;
  const expectedDigits = mapTimeExpectations[mapName];

  if (!expectedDigits) return;

  const digitsOnly = currentInput.value.replace(/\D/g, "");
  if (digitsOnly.length === expectedDigits) {
    const allInputs = [...document.querySelectorAll('input[name^="time"]')];
    const currentIndex = allInputs.indexOf(currentInput);
    if (currentIndex !== -1 && currentIndex + 1 < allInputs.length) {
      allInputs[currentIndex + 1].focus();
    }
  }
});

function toggleMSMode() {
  msMode = !msMode;
  localStorage.setItem("msMode", msMode);
  const alertMsg = msMode ? "on" : "off";
  alert(`Millisecond mode has now been turned ${alertMsg}, THIS IS A BETA VERSION OF MS MODE: currently this only works correctly when you insert a 5 star time under 5 minutes, just insert the score into the time column ex. 206107, resets are also not properly accounted for, if you save a link with ex. 12 it will convert it automatically to its exact score counterpart, but if you insert ex. 13 there is no exact score counterpart so it will add incorrect variance`);
   const fastInputToggle = document.getElementById("fastInputToggle");

  if (fastInputToggle) {
    if (msMode) {
      fastInputToggle.checked = false;
      fastInputToggle.disabled = true;
    } else {
      fastInputToggle.disabled = false;
    }
  }
  updateTimes();
}

const modal = document.getElementById("fastSplitModal");
const grid = document.getElementById("expectationGrid");
const btnConfigureFastSplit = document.getElementById("btnConfigureFastSplit");
const btnSave = document.getElementById("saveExpectations");
const btnClose = document.getElementById("closeModal");

const storedExpectations = JSON.parse(localStorage.getItem("mapTimeExpectations"));
if (storedExpectations) {
  Object.assign(mapTimeExpectations, storedExpectations);
}

function openFastSplitConfig() {
  grid.innerHTML = "";

  const entries = Object.entries(mapTimeExpectations);

  const col1 = entries.slice(0, 6);
  const col2 = entries.slice(6, 15);
  const col3 = entries.slice(15, 21);

  const groups = [col1, col2, col3];

  groups.forEach(group => {
    const colDiv = document.createElement("div");
    colDiv.className = "expectation-column";

    group.forEach(([map, digits]) => {
      const div = document.createElement("div");
      div.className = "expectation-item";
      div.innerHTML = `
        <span>${map}</span>
        <input type="number" min="1" max="3" value="${digits}" data-map="${map}">
        `;
      colDiv.appendChild(div);
    });

    grid.appendChild(colDiv);
  });

  modal.style.display = "block";
}

function closeFastSplitConfig() {
  modal.style.display = "none";
}

btnConfigureFastSplit.addEventListener("click", openFastSplitConfig);
btnClose.addEventListener("click", closeFastSplitConfig);

btnSave.addEventListener("click", () => {
  const inputs = grid.querySelectorAll("input");
  inputs.forEach(input => {
    const map = input.dataset.map;
    const val = parseInt(input.value, 10);
    if (!isNaN(val)) {
      mapTimeExpectations[map] = val;
    }
  });
  localStorage.setItem("mapTimeExpectations", JSON.stringify(mapTimeExpectations));
  closeFastSplitConfig();
  alert("Fast splitting configured successfully!");
});

window.addEventListener("click", (e) => {
  if (e.target === modal) closeFastSplitConfig();
});

document.getElementById("resetFastSplit").addEventListener("click", () => {
  const defaultValues = {
    "Paris": 2, "Sapienza": 2, "Marrakesh": 2, "Bangkok": 2, "Colorado": 2, "Hokkaido": 2,
    "Hawke's Bay": 3, "Miami": 2, "Santa Fortuna": 3, "Mumbai": 3, "Whittleton Creek": 3,
    "Ambrose Island": 2, "Isle of Sgàil": 2, "New York": 3, "Haven Island": 2, "Dubai": 2,
    "Dartmoor": 2, "Berlin": 2, "Chongqing": 2, "Mendoza": 2, "Romania": 3
  };

  Object.keys(defaultValues).forEach(level => {
    mapTimeExpectations[level] = defaultValues[level];
    const input = document.querySelector(`#fastSplitModal input[data-map="${level}"]`);
    if (input) input.value = defaultValues[level];
  });
});
