// The rose heart pin, shared by the Places map and the form's mini map. Styles
// live in globals.css (.story-pin).
export const HEART_SVG =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="#fff" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

export const pinHtml = (count = 1) =>
  `<div class="story-pin">${HEART_SVG}${
    count > 1 ? `<span class="story-pin-count">${count}</span>` : ""
  }</div>`;

// OpenStreetMap's own tiles: keyless, and light personal-site traffic is within
// their tile policy. CARTO's public tiles now return an "API KEY REQUIRED"
// placeholder image, so they can't be used.
export const OSM_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
