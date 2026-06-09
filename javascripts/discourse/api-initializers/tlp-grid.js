import { apiInitializer } from "discourse/lib/api";

// Renders the cached image URLs (served by the discourse-tlp-grid-images plugin
// via the topic_list_item serializer) into each row's `.topic-image` block.
//
// This is a DOM decorator rather than a plugin-outlet connector, because the
// FKB Pro theme replaces the topic-list item markup with its own and exposes
// no outlet in that region. It re-runs on navigation and on list mutations
// (infinite scroll), and is idempotent.

export default apiInitializer("0.11.1", (api) => {
  const maxVisible = parseInt(settings.max_visible_images, 10) || 4;
  const minImages = parseInt(settings.min_images_for_grid, 10) || 2;
  const aspectRatio = settings.cell_aspect_ratio || "1 / 1";

  // Build a Map of topicId -> topic model from the current list.
  // The list model lives on the discovery topics controller. If your build
  // exposes it elsewhere, run `api.container.lookup("controller:discovery/topics")`
  // in the browser console to confirm the path.
  function topicsById() {
    const map = new Map();
    const keys = ["controller:discovery/topics", "controller:discovery.topics"];
    for (const key of keys) {
      const topics = api.container.lookup(key)?.model?.topics;
      if (topics) {
        topics.forEach((t) => map.set(t.id, t));
        break;
      }
    }
    return map;
  }

  function buildGrid(images) {
    const grid = document.createElement("div");
    grid.className = "tlp-grid";

    const visible = images.slice(0, maxVisible);
    const remaining = images.length - visible.length;

    visible.forEach((src, i) => {
      const cell = document.createElement("div");
      cell.className = "tlp-grid__cell";

      const img = document.createElement("img");
      img.src = src;
      img.loading = "lazy";
      img.alt = "";
      cell.appendChild(img);

      if (remaining > 0 && i === visible.length - 1) {
        const more = document.createElement("span");
        more.className = "tlp-grid__more";
        more.textContent = `+${remaining}`;
        cell.appendChild(more);
      }

      grid.appendChild(cell);
    });

    grid.style.setProperty("--tlp-cols", Math.min(visible.length, 2));
    grid.style.setProperty("--tlp-aspect", aspectRatio);
    return grid;
  }

  function decorate() {
    const topics = topicsById();
    if (!topics.size) {
      return;
    }

    document
      .querySelectorAll(".topic-list-item[data-topic-id]")
      .forEach((row) => {
        const target = row.querySelector(".topic-image");
        // Idempotent: skip if we've already injected (survives partial re-renders).
        if (!target || target.querySelector(".tlp-grid")) {
          return;
        }

        const id = parseInt(row.dataset.topicId, 10);
        const images = topics.get(id)?.tlp_grid_images;
        if (!images || images.length < minImages) {
          return;
        }

        target.replaceChildren(buildGrid(images));
      });
  }

  function scheduleDecorate() {
    requestAnimationFrame(decorate);
  }

  api.onPageChange(() => {
    scheduleDecorate();

    // Re-decorate when the list grows (infinite scroll) or re-renders.
    const body = document.querySelector(".topic-list-body");
    if (body && !body.dataset.tlpObserved) {
      body.dataset.tlpObserved = "1";
      new MutationObserver(scheduleDecorate).observe(body, {
        childList: true,
        subtree: true,
      });
    }
  });
});