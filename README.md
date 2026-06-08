# TLP Grid Display

Companion **theme component** for the
[`discourse-tlp-grid-images`](https://github.com/nocactus/discourse-tlp-grid-images)
plugin.

The plugin caches up to N image URLs from each topic's first post and serves
them to the topic list. This component renders those URLs as a grid with a
`+N` overlay inside each row's existing `.topic-image` block — without forking
the main theme.

## Requires

- The `discourse-tlp-grid-images` plugin installed and `tlp_grid_enabled` = true.
- Topics whose first post has 2+ images (re-bake or re-post older topics so the
  field is populated).

## Install

This is a theme **component**, not a plugin — install it through the admin UI,
not `app.yml`:

**Admin → Customize → Themes → Install → From a git repository**, then add it as
a component to your active theme (FKB Pro).

## How it works

- Reads `topic.tlp_grid_images` from the current list model.
- For each `.topic-list-item[data-topic-id]`, replaces the contents of
  `.topic-image` with a grid (idempotent; re-runs on navigation and infinite
  scroll).
- Topics with fewer than `min_images_for_grid` images are left untouched, so
  the theme's normal single thumbnail still shows.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `max_visible_images` | `4` | Images shown before the rest collapse into `+N`. |
| `min_images_for_grid` | `2` | Minimum images required to render a grid. |

## Tuning

- Grid width: edit `--tlp-max-width` in `common/common.scss`.
- Columns are set in JS via `--tlp-cols` (capped at 2 for a 2×N layout); change
  the `Math.min(..., 2)` in the initializer for wider grids.

## Troubleshooting

If the grid doesn't appear but the plugin's field is populated, the list model
path may differ on your build. In the browser console on a topic list:

```js
require("discourse/lib/api"); // ensure app loaded
Discourse.__container__.lookup("controller:discovery/topics")?.model?.topics;
```

Confirm that returns the topics, and that each has a `tlp_grid_images` property.
