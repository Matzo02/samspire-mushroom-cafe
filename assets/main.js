(function () {
  const TAG_LABELS = { veg: "Veg", vegan: "Vegan", jain: "Jain", chef: "Chef's pick", new: "New" };
  const rupee = (n) => "₹" + n.toLocaleString("en-IN");
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const tagsHtml = (tags) =>
    tags.filter((t) => t !== "veg").map((t) => `<span class="tag tag--${t}">${TAG_LABELS[t]}</span>`).join("");

  // Menu tabs
  const tabsEl = document.getElementById("menu-tabs");
  const listEl = document.getElementById("menu-list");

  function renderCategory(id) {
    const cat = window.MENU.find((c) => c.id === id);
    listEl.innerHTML = cat.items
      .map(
        (it, i) => `
        <article class="item" style="animation-delay:${i * 40}ms">
          <h3>${esc(it.name)} ${tagsHtml(it.tags)}</h3>
          <span class="item__price">${rupee(it.price)}</span>
          <p>${esc(it.desc)}</p>
        </article>`
      )
      .join("");
    tabsEl.querySelectorAll(".tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.id === id)));
  }

  tabsEl.innerHTML = window.MENU.map(
    (c) => `<button class="tab" role="tab" data-id="${c.id}" aria-selected="false">${esc(c.label)}</button>`
  ).join("");
  tabsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab");
    if (btn) renderCategory(btn.dataset.id);
  });
  renderCategory(window.MENU[0].id);

  // Signature cards: every "chef" item across the menu
  const signatures = window.MENU.flatMap((c) => c.items).filter((it) => it.tags.includes("chef"));
  document.getElementById("signature-cards").innerHTML = signatures
    .map(
      (it) => `
      <article class="card">
        <svg class="card__icon" viewBox="0 0 64 64" aria-hidden="true"><use href="#mushroom" /></svg>
        <h3>${esc(it.name)}</h3>
        <p>${esc(it.desc)}</p>
        <span class="card__price">${rupee(it.price)}</span>
      </article>`
    )
    .join("");

  // Mobile nav
  const toggle = document.querySelector(".nav__toggle");
  const links = document.getElementById("nav-links");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    links.classList.toggle("is-open", open);
  });
  links.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      toggle.setAttribute("aria-expanded", "false");
      links.classList.remove("is-open");
    }
  });

  // Nav border on scroll
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
