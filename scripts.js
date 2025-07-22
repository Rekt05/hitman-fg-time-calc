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

  const buttons = document.querySelectorAll(".left-panel button");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const levels = levelData[button.textContent];
      if (!levels) return;

      for (let i = 1; i <= 40; i++) {
        const levelInput = document.querySelector(`input[name="level${i}"]`);
        if (levelInput) levelInput.value = "";
      }

      levels.forEach((levelName, index) => {
        const levelInput = document.querySelector(`input[name="level${index + 1}"]`);
        if (levelInput) levelInput.value = levelName;
      });
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
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
  });
});

document.getElementById("btnClearAll").addEventListener("click", () => {
  const allInputs = document.querySelectorAll('input[type="text"]');
  allInputs.forEach(input => input.value = "");
});


document.addEventListener("DOMContentLoaded", () => {
  const timeInputs = [...document.querySelectorAll('input[name^="time"]')];

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
        if (originalVal === "") {
          if (cumInput) cumInput.value = "";
        } else {
          if (cumInput) cumInput.value = "";
        }
      }
    });
  }

  timeInputs.forEach(input => {
    input.addEventListener("input", updateTimes);
  });

  updateTimes();
});

//save as link
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnSaveLink").addEventListener("click", async () => {
  const times = [];
  const levels = [];

  for (let i = 1; i <= 40; i++) {
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
    alert("Link copied to clipboard!");
  } catch (err) {
    prompt("Couldn't auto-copy. Please copy manually:", fullLink);
  }
});
});

window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const times = urlParams.get("times");
    const levels = urlParams.get("levels");

    if (times && levels) {
        const timesArray = times.split(",");
        const levelsArray = levels.split(",");

        for (let i = 0; i < 40; i++) {
            const t = decodeURIComponent(timesArray[i] || "");
            const ln = decodeURIComponent(levelsArray[i] || "");
            document.getElementById(`t${i + 1}`).value = t;
            document.getElementById(`ln${i + 1}`).value = ln;

            //trigger ct calc
            if (t) {
                document.getElementById(`t${i + 1}`).dispatchEvent(new Event("input"));
            }
        }
    }
});




