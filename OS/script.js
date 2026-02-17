const bootScreen = document.getElementById("boot-screen");
const os = document.getElementById("os");
const topTime = document.getElementById("top-time");
const activitiesBtn = document.getElementById("activities-btn");
const overview = document.getElementById("overview");
const workspace = document.getElementById("workspace");
const dock = document.querySelector(".dock");

const terminalLog = document.getElementById("terminal-log");
const terminalInput = document.getElementById("terminal-input");
const notesInput = document.getElementById("notes-input");
const accentPicker = document.getElementById("accent-picker");
const compactToggle = document.getElementById("compact-toggle");
const filesGrid = document.getElementById("files-grid");
const filePreview = document.getElementById("file-preview");

const windows = [...document.querySelectorAll("[data-window]")];
let zIndex = 20;

const mockFiles = [
  { name: "README.md", content: "Welcome to Bit OS. Use dock apps to open tools." },
  { name: "notes.txt", content: "Notes are autosaved in localStorage." },
  { name: "system.log", content: "[ok] boot complete\n[ok] ui service started" },
  { name: "todo.md", content: "- make app launcher\n- polish terminal\n- ship ✅" },
];

function raiseWindow(win) {
  zIndex += 1;
  win.style.zIndex = String(zIndex);
}

function openWindow(id) {
  const target = document.getElementById(id);
  if (!target) return;
  target.classList.remove("hidden");
  raiseWindow(target);
  overview.classList.add("hidden");
}

function closeWindow(id) {
  const target = document.getElementById(id);
  if (!target) return;
  target.classList.add("hidden");
}

function setClock() {
  topTime.textContent = new Date().toLocaleString([], {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function output(line = "") {
  terminalLog.textContent += `${line}\n`;
  terminalLog.scrollTop = terminalLog.scrollHeight;
}

function wireFiles() {
  mockFiles.forEach((file) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "file";
    button.textContent = `📄 ${file.name}`;
    button.addEventListener("click", () => {
      filePreview.textContent = file.content;
    });
    filesGrid.appendChild(button);
  });
}

function wireTerminal() {
  output("Bit OS terminal ready. Type help");

  const commands = {
    help: () => output("help | ls | neofetch | date | open <app> | clear"),
    ls: () => output(mockFiles.map((f) => f.name).join("  ")),
    neofetch: () => {
      output("Bit OS 1.1");
      output("Shell: bitsh");
      output("Kernel: web-6.1.0-bit");
    },
    date: () => output(new Date().toString()),
    clear: () => {
      terminalLog.textContent = "";
    },
  };

  terminalInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;

    const value = terminalInput.value.trim();
    output(`bit@bit-os:~$ ${value}`);

    if (!value) {
      terminalInput.value = "";
      return;
    }

    if (value.startsWith("open ")) {
      const appName = value.slice(5).toLowerCase();
      if (["files", "terminal", "notes", "settings"].includes(appName)) {
        openWindow(appName);
      } else {
        output(`Unknown app: ${appName}`);
      }
      terminalInput.value = "";
      return;
    }

    const run = commands[value.toLowerCase()];
    if (run) run();
    else output(`Command not found: ${value}`);

    terminalInput.value = "";
  });
}

function wireWindowButtons() {
  document.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => openWindow(btn.dataset.open));
  });

  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeWindow(btn.dataset.close));
  });

  windows.forEach((win) => {
    win.addEventListener("pointerdown", () => raiseWindow(win));
  });
}

function wireDragging() {
  document.querySelectorAll("[data-drag-handle]").forEach((handle) => {
    handle.addEventListener("pointerdown", (event) => {
      const win = handle.closest(".window");
      if (!win) return;
      raiseWindow(win);

      const rect = win.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;

      const move = (moveEvent) => {
        const workspaceRect = workspace.getBoundingClientRect();
        const left = Math.min(
          Math.max(moveEvent.clientX - workspaceRect.left - offsetX, 0),
          workspaceRect.width - win.offsetWidth,
        );
        const top = Math.min(
          Math.max(moveEvent.clientY - workspaceRect.top - offsetY, 0),
          workspaceRect.height - win.offsetHeight,
        );
        win.style.left = `${left}px`;
        win.style.top = `${top}px`;
      };

      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
  });
}

function wireSettings() {
  const savedNotes = localStorage.getItem("bit-os-notes");
  if (savedNotes) notesInput.value = savedNotes;

  notesInput.addEventListener("input", () => {
    localStorage.setItem("bit-os-notes", notesInput.value);
  });

  const savedAccent = localStorage.getItem("bit-os-accent");
  if (savedAccent) {
    accentPicker.value = savedAccent;
    document.documentElement.style.setProperty("--accent", savedAccent);
  }

  accentPicker.addEventListener("input", () => {
    const color = accentPicker.value;
    document.documentElement.style.setProperty("--accent", color);
    localStorage.setItem("bit-os-accent", color);
  });

  const isCompact = localStorage.getItem("bit-os-compact-dock") === "true";
  compactToggle.checked = isCompact;
  dock.classList.toggle("compact", isCompact);

  compactToggle.addEventListener("change", () => {
    dock.classList.toggle("compact", compactToggle.checked);
    localStorage.setItem("bit-os-compact-dock", String(compactToggle.checked));
  });
}

activitiesBtn.addEventListener("click", () => {
  overview.classList.toggle("hidden");
});

setClock();
setInterval(setClock, 1000);
wireWindowButtons();
wireDragging();
wireFiles();
wireTerminal();
wireSettings();

setTimeout(() => {
  bootScreen.classList.add("hidden");
  os.classList.remove("hidden");
  openWindow("terminal");
}, 1200);
