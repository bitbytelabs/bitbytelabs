const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const yearTarget = document.querySelector("[data-year]");
const loginForm = document.querySelector("[data-login-form]");
const loginNote = document.querySelector("[data-login-note]");
const registerForm = document.querySelector("[data-register-form]");
const registerNote = document.querySelector("[data-register-note]");
const profileName = document.querySelector("[data-profile-name]");
const profileNote = document.querySelector("[data-profile-note]");

const PLAYER_KEY = "roblox-universe-player";

const loadProfile = () => {
  const stored = localStorage.getItem(PLAYER_KEY);
  if (!stored) return;
  const playerProfile = JSON.parse(stored);
  if (profileName) {
    profileName.textContent = playerProfile.name || "Guest";
  }
};

const saveProfile = (name) => {
  localStorage.setItem(PLAYER_KEY, JSON.stringify({ name }));
  if (profileName) {
    profileName.textContent = name;
  }
  if (profileNote) {
    profileNote.textContent = "Profile updated and saved locally.";
  }
};

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

if (loginForm && loginNote) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const name = formData.get("loginName");
    saveProfile(name);
    loginNote.textContent = `Logged in as ${name}.`;
  });
}

if (registerForm && registerNote) {
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const name = formData.get("registerName");
    saveProfile(name);
    registerNote.textContent = `Account created for ${name}.`;
  });
}

loadProfile();
