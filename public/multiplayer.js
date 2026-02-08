const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const yearTarget = document.querySelector("[data-year]");
const serverStatus = document.querySelector("[data-server-status]");
const playerList = document.querySelector("[data-player-list]");
const reconnectButton = document.querySelector("#reconnect");

let eventSource;

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const updatePlayerList = (players) => {
  if (!playerList) return;
  playerList.innerHTML = "";
  if (players.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No players online.";
    playerList.appendChild(li);
    return;
  }
  players.forEach((player) => {
    const li = document.createElement("li");
    li.textContent = `${player.name} (${player.id})`;
    playerList.appendChild(li);
  });
};

const connectEvents = () => {
  if (eventSource) {
    eventSource.close();
  }
  eventSource = new EventSource("/events");

  eventSource.addEventListener("open", () => {
    if (serverStatus) {
      serverStatus.textContent = "Connected";
    }
  });

  eventSource.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    if (payload.type === "players") {
      updatePlayerList(payload.players);
    }
  });

  eventSource.addEventListener("error", () => {
    if (serverStatus) {
      serverStatus.textContent = "Disconnected";
    }
  });
};

if (reconnectButton) {
  reconnectButton.addEventListener("click", () => {
    connectEvents();
  });
}

connectEvents();
