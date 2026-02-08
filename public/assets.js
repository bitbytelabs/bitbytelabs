const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const yearTarget = document.querySelector("[data-year]");
const buyButtons = document.querySelectorAll("[data-buy]");
const inventoryNote = document.querySelector("[data-inventory-note]");

let imports = 0;

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

buyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    button.textContent = "Imported";
    imports += 1;
    if (inventoryNote) {
      inventoryNote.textContent = `${imports} asset pack${imports === 1 ? "" : "s"} imported.`;
    }
  });
});
