# TLP Grid Display

Companion **theme component** for the
[`discourse-tlp-grid-images`](https://github.com/nocactus/discourse-tlp-grid-images)
plugin.

The plugin caches up to N image URLs from each topic's first post and serves
them to the topic list. This component renders those URLs as a grid with a
`+N` overlay inside each row's existing `.topic-image` block — without forking
the FKB Pro theme.

## Status

**Working in production** on club.haekelfans.de. The grid renders in the topic
list with a 2×N layout and a `+N` overlay, fills FKB Pro's full-bleed image
box, and matches the single-image rendering.

## Requires

- The `discourse-tlp-grid-images` plugin installed and `tlp_grid_enabled` = true.
- Topics whose first post has at least `min_images_for_grid` images. Older
  topics created before the plugin was enabled have no cached images until
  re-baked or re-posted.

## Install

This is a theme **component**, not a plugin — install it through the admin UI,
not `app.yml`:

**Admin → Customize → Themes → Install → From a git repository**, then add it as
a component to FKB Pro (**Include component on these themes → FKB Pro theme**).

Because it's git-installed, the in-admin CSS editor is read-only. To change
code: edit in the repo, commit, push, then click **Check for updates** in the
admin. Settings (below) can be changed live in the admin without a push.

## How it works

- Reads `topic.tlp_grid_images` from the current list model (looked up via
  `controller:discovery/topics` → `model.topics`).
- For each `.topic-list-item[data-topic-id]` in the DOM, replaces the contents
  of `.topic-image` with a grid. Idempotent (skips rows that already have a
  `.tlp-grid`), and re-runs on navigation (`onPageChange`) and on list mutations
  (a `MutationObserver` on `.topic-list-body`) so infinite scroll is covered.
- Topics with fewer than `min_images_for_grid` images are left untouched, so
  FKB Pro's normal single thumbnail still shows there.

This is a DOM decorator rather than a plugin-outlet connector, because FKB Pro
replaces the topic-list item markup with its own (`tli-*` classes) and exposes
no plugin outlet in that region.

## FKB Pro integration notes (discovered)

Useful context so this doesn't need re-investigating:

- The row is core: `<tr class="topic-list-item" data-topic-id="…">` →
  `<td class="main-link topic-list-data">`. **`data-topic-id` is the hook**
  that maps a DOM row to its topic model.
- Inside the cell, FKB renders custom markup: `tli-top-section`,
  `tli-middle-section`, and `.topic-image` (where the single thumbnail lives).
- FKB's `.topic-image` is **full-bleed**: `width: calc(100% + 2em)` with
  `margin: .25em -1em 0 -1em` and `overflow: hidden`. That's why the grid uses
  `width: 100%` (fills the box, stays aligned) and `--tlp-radius: 0` (the box
  already clips), instead of a fixed max-width.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `max_visible_images` | `4` | Images shown before the rest collapse into `+N`. |
| `min_images_for_grid` | `2` | Minimum images required to render a grid. |
| `cell_aspect_ratio` | `1 / 1` | Cell shape. Square keeps tiles; landscape (`4 / 3`, `3 / 2`, `16 / 9`) makes the grid shorter; portrait (`3 / 4`, `2 / 3`) makes it taller. |

## Tuning

- **Cell shape**: `cell_aspect_ratio` setting (live, no push).
- **Gap / radius**: `--tlp-gap` and `--tlp-radius` in `common/common.scss`.
- **Columns**: set in JS via `--tlp-cols`, capped at 2 (`Math.min(..., 2)` in
  the initializer) for the 2×N layout. Raise the cap for wider grids.
- **More aspect ratios**: add entries to `cell_aspect_ratio.choices` in
  `settings.yml`, then push.

## Possible next steps

- **Mobile breakpoint**: optionally make the grid smaller / 1-column on narrow
  screens (not done yet).
- **Crop control**: cells use `object-fit: cover`, so portrait/landscape photos
  get cropped to the cell shape. The `cell_aspect_ratio` setting mitigates this;
  a per-image fit option could go further.
- **Lightbox**: intentionally NOT added — in a list the whole card should link
  to the topic, so the `+N` overlay is visual only.

## Troubleshooting

If the grid doesn't appear but the plugin's field is populated, the list model
path may differ on your build. In the browser console on a topic list:

```js
Discourse.__container__.lookup("controller:discovery/topics")?.model?.topics;
```

Confirm that returns the topics and that each has a `tlp_grid_images` property.
If the path differs, update the `keys` array in
`javascripts/discourse/api-initializers/tlp-grid.js`.
