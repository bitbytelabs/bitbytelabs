const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const yearTarget = document.querySelector("[data-year]");
const form = document.querySelector("[data-form]");
const formNote = document.querySelector("[data-form-note]");
const loginForm = document.querySelector("[data-login-form]");
const loginNote = document.querySelector("[data-login-note]");
const signupForm = document.querySelector("[data-signup-form]");
const signupNote = document.querySelector("[data-signup-note]");

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

if (form && formNote) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.reset();
    formNote.textContent = "Thanks! Our team will reach out within one business day.";
  });
}

if (loginForm && loginNote) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loginForm.reset();
    loginNote.textContent = "Login verified. Redirecting you to the client portal...";
  });
}

if (signupForm && signupNote) {
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    signupForm.reset();
    signupNote.textContent = "Account created. Check your inbox to complete setup.";
  });
}
