import { TYPE_SORT_ORDER } from './constants'

export const sortCatalogTiles = (tiles) =>
  [...tiles].sort((a, b) =>
    (TYPE_SORT_ORDER[a.type] ?? 99) - (TYPE_SORT_ORDER[b.type] ?? 99) ||
    a.name.localeCompare(b.name)
  );

export const filterCatalogByQuery = (tiles, q) => {
  const needle = q.trim().toLowerCase();
  if (!needle) return tiles;
  return tiles.filter(t =>
    [t.name, t.desc, t.useCase, t.cat, t.id].some(f => (f || "").toLowerCase().includes(needle))
  );
};

export const normalizeIdeaStatus = (s) =>
  ({ planned: "committed", "in-progress": "committed", shipped: "delivered" }[s] || s);

export const parseUnifiedSearch = (text) => {
  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return {
      // Accept both new {catalog:[]} and legacy {recommendations:[]} shapes
      catalog: Array.isArray(parsed.catalog)         ? parsed.catalog :
               Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      ideas:   Array.isArray(parsed.ideas)           ? parsed.ideas   : [],
    };
  } catch { return { catalog: [], ideas: [] }; }
};
