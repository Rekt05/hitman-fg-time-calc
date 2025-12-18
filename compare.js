document.addEventListener("DOMContentLoaded", () => {
  const levelData = {
    Trilogy: [
      "Paris",
      "Sapienza",
      "Marrakesh",
      "Bangkok",
      "Colorado",
      "Hokkaido",
      "Hawke's Bay",
      "Miami",
      "Santa Fortuna",
      "Mumbai",
      "Whittleton Creek",
      "Ambrose Island",
      "Isle of Sgàil",
      "New York",
      "Haven Island",
      "Dubai",
      "Dartmoor",
      "Berlin",
      "Chongqing",
      "Mendoza",
      "Romania",
    ],
    "Season 1": [
      "Paris",
      "Sapienza",
      "Marrakesh",
      "Bangkok",
      "Colorado",
      "Hokkaido",
    ],
    "Season 2": [
      "Hawke's Bay",
      "Miami",
      "Santa Fortuna",
      "Mumbai",
      "Whittleton Creek",
      "Ambrose Island",
      "Isle of Sgàil",
      "New York",
      "Haven Island",
    ],
    "Season 3": [
      "Dubai",
      "Dartmoor",
      "Berlin",
      "Chongqing",
      "Mendoza",
      "Romania",
    ],
    "Patient Zero": ["Source", "Author", "Vector", "Patient Zero (Hokkaido)"], //i get why prettier formats it like this but its still funny
    "Sarajevo Six": [
      "The Director",
      "The Enforcer",
      "The Extractor",
      "The Veteran",
      "The Mercenary",
      "The Controller",
    ],
  };

  const rowCountInput = document.getElementById("rowCount");
  const yourTable = document.getElementById("yourTable");
  const comBody = document.getElementById("comBody");
  const delBody = document.getElementById("delBody");
  const yourLinkBox = document.getElementById("yourLink");
  const comLinkBox = document.getElementById("comLink");

  [yourLinkBox, comLinkBox].forEach((box) => {
    box.addEventListener("click", function () {
      this.select();
    });
  });

  function parseCustomTime(str) {
    str = str ? str.trim() : "";
    if (!str) return NaN;
    if (str.includes(":")) {
      const parts = str.split(":");
      const min = parseInt(parts[0], 10);
      const sec = parseInt(parts[1], 10);
      return isNaN(min) || isNaN(sec) ? NaN : min * 60 + sec;
    } else if (/^\d+$/.test(str)) {
      if (str.length <= 2) return parseInt(str, 10);
      const min = parseInt(str.slice(0, -2), 10);
      const sec = parseInt(str.slice(-2), 10);
      return min * 60 + sec;
    }
    return NaN;
  }

  function formatTimeString(totalSeconds) {
    const isNegative = totalSeconds < 0;
    const absSeconds = Math.round(Math.abs(totalSeconds));
    const min = Math.floor(absSeconds / 60);
    const sec = absSeconds % 60;
    const timeStr = `${min}:${sec.toString().padStart(2, "0")}`;
    return isNegative ? `-${timeStr}` : timeStr;
  }

  function updateTimes() {
    let yourTotal = 0,
      comTotal = 0,
      deltaSum = 0,
      hasActiveDelta = false;
    const count = parseInt(rowCountInput.value, 10);

    for (let i = 1; i <= count; i++) {
      const yTimeInput = document.getElementById(`yt${i}`);
      const cTimeInput = document.getElementById(`ct${i}`);
      const yCumInput = document.getElementById(`yc${i}`);
      const cCumInput = document.getElementById(`cc${i}`);
      const dInput = document.getElementById(`dt${i}`);

      const ySec = parseCustomTime(yTimeInput.value);
      const cSec = parseCustomTime(cTimeInput.value);

      if (!isNaN(ySec)) {
        if (!yTimeInput.value.includes(":") && yTimeInput.value.length > 2)
          yTimeInput.value = formatTimeString(ySec);
        yourTotal += ySec;
        yCumInput.value = formatTimeString(yourTotal);
      } else {
        yCumInput.value = "";
      }

      if (!isNaN(cSec)) {
        if (!cTimeInput.value.includes(":") && cTimeInput.value.length > 2)
          cTimeInput.value = formatTimeString(cSec);
        comTotal += cSec;
        cCumInput.value = formatTimeString(comTotal);
      } else {
        cCumInput.value = "";
      }

      if (!isNaN(ySec) && !isNaN(cSec)) {
        const diff = ySec - cSec;
        deltaSum += diff;
        hasActiveDelta = true;
        dInput.value = (diff > 0 ? "+" : "") + formatTimeString(diff);
        dInput.style.color =
          diff < 0 ? "#50fa7b" : diff > 0 ? "#ff5555" : "#e8e6e3";
      } else {
        dInput.value = "";
      }
    }

    const resInput = document.getElementById("delResult");
    if (hasActiveDelta) {
      resInput.value = (deltaSum > 0 ? "+" : "") + formatTimeString(deltaSum);
      resInput.style.color =
        deltaSum < 0 ? "#50fa7b" : deltaSum > 0 ? "#ff5555" : "#e8e6e3";
    } else {
      resInput.value = "";
    }
  }

  function generateRows(count) {
    yourTable.innerHTML = "";
    comBody.innerHTML = "";
    delBody.innerHTML = "";
    for (let i = 1; i <= count; i++) {
      yourTable.innerHTML += `<tr><td><input type="text" id="yt${i}" /></td><td><input type="text" id="yc${i}" readonly /></td><td><input type="text" id="yln${i}" /></td></tr>`;
      comBody.innerHTML += `<tr><td><input type="text" id="ct${i}" /></td><td><input type="text" id="cc${i}" readonly /></td><td><input type="text" id="cln${i}" /></td></tr>`;
      delBody.innerHTML += `<tr><td><input type="text" id="dt${i}" readonly style="font-weight:bold" /></td></tr>`;
    }
    bindDynamicEvents();
  }

  function bindDynamicEvents() {
    const count = parseInt(rowCountInput.value, 10);
    const colOrder = [];
    for (let i = 1; i <= count; i++)
      colOrder.push(document.getElementById(`yt${i}`));
    for (let i = 1; i <= count; i++)
      colOrder.push(document.getElementById(`yln${i}`));
    for (let i = 1; i <= count; i++)
      colOrder.push(document.getElementById(`ct${i}`));
    for (let i = 1; i <= count; i++)
      colOrder.push(document.getElementById(`cln${i}`));

    colOrder.forEach((input, idx) => {
      if (!input) return;
      input.addEventListener("keydown", (e) => {
        if (e.key === "Tab" || e.key === "Enter") {
          e.preventDefault();
          const next = e.shiftKey
            ? (idx - 1 + colOrder.length) % colOrder.length
            : (idx + 1) % colOrder.length;
          colOrder[next].focus();
        }
      });
      if (input.id.startsWith("yt") || input.id.startsWith("ct")) {
        input.addEventListener("input", updateTimes);
      }
    });
  }

  function loadSide(prefix, tKey, lKey, params) {
    const t = params.get(tKey)?.split(",").map(decodeURIComponent) || [];
    const l = params.get(lKey)?.split(",").map(decodeURIComponent) || [];
    const r = Math.max(t.length, l.length);
    if (r > parseInt(rowCountInput.value, 10)) {
      rowCountInput.value = r;
      generateRows(r);
    }
    for (let i = 0; i < r; i++) {
      const tf = document.getElementById(`${prefix}t${i + 1}`);
      const lf = document.getElementById(`${prefix}ln${i + 1}`);
      if (tf) tf.value = t[i] || "";
      if (lf) lf.value = l[i] || "";
    }
  }

  function handleSolderImport(params, activeSection) {
    const prefix = activeSection === "your" ? "y" : "c";
    let maxIdx = 0;
    for (let [key] of params.entries()) {
      if (key.startsWith("t")) {
        const idx = parseInt(key.substring(1));
        if (!isNaN(idx)) maxIdx = Math.max(maxIdx, idx);
      }
    }
    if (maxIdx > parseInt(rowCountInput.value, 10)) {
      rowCountInput.value = maxIdx;
      generateRows(maxIdx);
    }
    for (let i = 1; i <= maxIdx; i++) {
      const timeVal = params.get(`t${i}`);
      const levelVal = params.get(`c${i}`);
      if (timeVal)
        document.getElementById(`${prefix}t${i}`).value =
          decodeURIComponent(timeVal);
      if (levelVal)
        document.getElementById(`${prefix}ln${i}`).value =
          decodeURIComponent(levelVal);
    }
  }

  function importFromLink(urlStr, activeSection) {
    try {
      const url = new URL(urlStr);
      const params = url.searchParams;

      if (params.has("yt") || params.has("ct")) {
        loadSide("y", "yt", "yl", params);
        loadSide("c", "ct", "cl", params);
        yourLinkBox.value = "";
        comLinkBox.value = "";
        yourLinkBox.placeholder = "Full Comparison Loaded";
        comLinkBox.placeholder = "Full Comparison Loaded";
      } else if (params.has("t1")) {
        handleSolderImport(params, activeSection);
        const targetBox = activeSection === "your" ? yourLinkBox : comLinkBox;
        targetBox.value = "";
        targetBox.placeholder = "Solder Splits Loaded";
      } else if (params.has("times")) {
        loadSide(
          activeSection === "your" ? "y" : "c",
          "times",
          "levels",
          params
        );
        const targetBox = activeSection === "your" ? yourLinkBox : comLinkBox;
        targetBox.value = "";
        targetBox.placeholder = "Splits Successfully Loaded";
      }
      updateTimes();
    } catch (e) {
      console.warn("Invalid URL");
    }
  }

  const initialParams = new URLSearchParams(window.location.search);
  const initialCount = parseInt(localStorage.getItem("rowCount")) || 21;

  let requiredRows = initialCount;
  if (initialParams.has("yt") || initialParams.has("ct")) {
    requiredRows = Math.max(
      initialCount,
      initialParams.get("yt")?.split(",").length || 0,
      initialParams.get("ct")?.split(",").length || 0
    );
  } else if (initialParams.has("t1")) {
    let maxL = 0;
    for (let [key] of initialParams.entries())
      if (key.startsWith("t"))
        maxL = Math.max(maxL, parseInt(key.substring(1)));
    requiredRows = Math.max(initialCount, maxL);
  }

  rowCountInput.value = requiredRows;
  generateRows(requiredRows);

  if (initialParams.has("yt") || initialParams.has("ct")) {
    loadSide("y", "yt", "yl", initialParams);
    loadSide("c", "ct", "cl", initialParams);
  } else if (initialParams.has("t1")) {
    handleSolderImport(initialParams, "your");
  }
  updateTimes();

  document.getElementById("btnSaveLink").addEventListener("click", async () => {
    const count = parseInt(rowCountInput.value, 10);
    const yT = [],
      yL = [],
      cT = [],
      cL = [];
    for (let i = 1; i <= count; i++) {
      yT.push(
        encodeURIComponent(document.getElementById(`yt${i}`).value.trim())
      );
      yL.push(
        encodeURIComponent(document.getElementById(`yln${i}`).value.trim())
      );
      cT.push(
        encodeURIComponent(document.getElementById(`ct${i}`).value.trim())
      );
      cL.push(
        encodeURIComponent(document.getElementById(`cln${i}`).value.trim())
      );
    }
    const trim = (arr) => {
      while (arr.length && !arr[arr.length - 1]) arr.pop();
      return arr;
    };
    const url = new URL(window.location.href.split("?")[0]);
    url.searchParams.set("yt", trim(yT).join(","));
    url.searchParams.set("yl", trim(yL).join(","));
    url.searchParams.set("ct", trim(cT).join(","));
    url.searchParams.set("cl", trim(cL).join(","));
    const fullLink = url.toString();
    navigator.clipboard.writeText(fullLink);
    alert(`${fullLink}\n\ncopied to clipboard`);
  });

  rowCountInput.addEventListener("input", () => {
    const val = parseInt(rowCountInput.value, 10);
    if (val > 0 && val <= 100) {
      localStorage.setItem("rowCount", val);
      generateRows(val);
      updateTimes();
    }
  });

  yourLinkBox.addEventListener("input", (e) =>
    importFromLink(e.target.value, "your")
  );
  comLinkBox.addEventListener("input", (e) =>
    importFromLink(e.target.value, "com")
  );

  document.querySelectorAll(".left-panel button").forEach((btn) => {
    if (levelData[btn.textContent]) {
      btn.addEventListener("click", () => {
        const levels = levelData[btn.textContent];
        document
          .querySelectorAll('input[id^="yln"], input[id^="cln"]')
          .forEach((input) => (input.value = ""));
        if (levels.length > rowCountInput.value) {
          rowCountInput.value = levels.length;
          generateRows(levels.length);
        }
        levels.forEach((name, i) => {
          document.getElementById(`yln${i + 1}`).value = name;
          document.getElementById(`cln${i + 1}`).value = name;
        });
        updateTimes();
      });
    }
  });

  document.getElementById("btnClearTimes").addEventListener("click", () => {
    document
      .querySelectorAll('input[id^="yt"], input[id^="ct"]')
      .forEach((i) => (i.value = ""));
    updateTimes();
  });

  document.getElementById("btnClearAll").addEventListener("click", () => {
    document.querySelectorAll('input[type="text"]').forEach((i) => {
      i.value = "";
      if (i.id.startsWith("dt") || i.id === "delResult")
        i.style.color = "#e8e6e3";
    });
    yourLinkBox.placeholder = "Paste Your Splits Link - Both this site and solderq site links are supported";
    comLinkBox.placeholder = "Paste Comparison Splits Link- Both this site and solderq site links are supported";
    updateTimes();
  });
});
