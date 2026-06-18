import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("0.11.1", (api) => {
  // Toon de volledige naam in antwoorden in plaats van de gebruikersnaam.
  // Werkt via DOM-manipulatie na render, onafhankelijk van Discourse-versie.
  api.decorateCooked(
    (cooked, helper) => {
      const post = helper?.getModel?.();
      if (!post) return;

      const fullName = post.get ? post.get("name") : post.name;
      const username = post.get ? post.get("username") : post.username;
      if (!fullName || fullName === username) return;

      // .names staat boven de cooked content, in hetzelfde .topic-body blok
      const topicBody = cooked.closest(".topic-body");
      if (!topicBody) return;

      const namesEl = topicBody.querySelector(".names");
      // Idempotent: sla over als al verwerkt
      if (!namesEl || namesEl.dataset.hsFullName) return;
      namesEl.dataset.hsFullName = "1";

      const usernameEl = namesEl.querySelector(".username");
      if (!usernameEl) return;

      const existingLink = usernameEl.querySelector("a");
      const fullNameSpan = document.createElement("span");
      fullNameSpan.className = "full-name first";

      if (existingLink) {
        const nameLink = document.createElement("a");
        nameLink.href = existingLink.href;
        nameLink.textContent = fullName;
        fullNameSpan.appendChild(nameLink);
      } else {
        fullNameSpan.textContent = fullName;
      }

      namesEl.classList.add("has-full-name");
      namesEl.insertBefore(fullNameSpan, namesEl.firstChild);
      usernameEl.style.display = "none";
    },
    { id: "hakelstube-full-name", onlyStream: true }
  );
});
