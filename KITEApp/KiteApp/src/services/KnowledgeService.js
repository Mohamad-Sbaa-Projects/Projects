import {knowledgeData} from "../data/knowledgeData.js";

// KnowledgeDetailScreen.js
export function findItemById(id) {
  for (const section of knowledgeData) {
      const found = section.items.find((i) => i.id === id);
      if (found) return found;
  }
  return null;
}

export function linkifyQuelle(text) {
  if (!text) return "";

  // existing <a> with Quelle
  text = text.replace(/(\s*\(?\s*Quelle\s*[:\-]?\s*)?<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>.*?<\/a>\)?/gi, (_, _prefix, href) =>
    `(<a class="source-link" href="${href}" target="_blank" rel="noopener noreferrer">Quelle</a>)`
  );

  // raw "Quelle: https://..."
  text = text.replace(/\(?\s*Quelle\s*[:\-]?\s*(https?:\/\/[^\s<\)]+|www\.[^\s<\)]+)\)?/gi, (_, url) => {
      const href = url.startsWith("http") ? url : "https://" + url;
      return `(<a class="source-link" href="${href}" target="_blank" rel="noopener noreferrer">Quelle</a>)`;
    }
  );
  return text;
}

export function getKnowledgeId(element) {
    return element.getAttribute("knowledge-id");
}

//KnowledgeScreen.js
export function handleSearch(element, query) {
  const q = query.toLowerCase().trim();
  const dropdownsEl = element.querySelector(".knowledge-dropdowns");
  const searchResultsEl = element.querySelector(".search-results");
  if (!dropdownsEl || !searchResultsEl) return;

  if (!q) {
    dropdownsEl.style.display = "";
    searchResultsEl.style.display = "none";
    searchResultsEl.innerHTML = "";
    return;
  }

  dropdownsEl.style.display = "none";
  searchResultsEl.innerHTML = "";
  searchResultsEl.style.display = "flex";
  searchResultsEl.style.flexDirection = "column";
  searchResultsEl.style.gap = "10px";

  const matches = [];
  knowledgeData.forEach((section) => {
    section.items.forEach((item) => {
      const text = `${item.title} ${item.preview} ${item.text}`.toLowerCase();
      if (text.includes(q)) matches.push(item);
    });
  });

  matches.forEach((item) => {
    const card = document.createElement("knowledge-card");
    card.setAttribute("data-id", item.id);
    card.setAttribute("data-title", item.title);
    card.setAttribute("data-preview", item.preview);
    searchResultsEl.appendChild(card);
  });
}
export function renderDropdowns(element) {
  const dropdowns = element.querySelector(".knowledge-dropdowns");
  if (!dropdowns) return;
  dropdowns.innerHTML = "";

  knowledgeData.forEach((section) => {
    const sectionEl = document.createElement("knowledge-section");
    sectionEl.setAttribute("data-title", section.title);

    section.items.forEach((item) => {
      const card = document.createElement("knowledge-card");
      card.setAttribute("data-id", item.id);
      card.setAttribute("data-title", item.title);
      card.setAttribute("data-preview", item.preview);
      sectionEl.appendChild(card);
    });

    dropdowns.appendChild(sectionEl);
  });
}
