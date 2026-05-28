# Semantic Search

Semantic search lets users search by meaning instead of only by matching words. In this marketplace, a query like "help me prepare for a renewal conversation" can match renewal, risk, and adoption capabilities even when the exact words differ.

## How It Works

Embeddings are numeric vectors that represent text meaning. The marketplace creates one embedding for each catalog tile and pipeline idea, stores those vectors in a generated `search-index.json` file, and compares the user's query vector to those item vectors at search time.

The runtime flow is:

1. The app loads catalog and idea data.
2. The app tries to load a matching semantic index.
3. The browser embeds the user's query with `@huggingface/transformers`.
4. Search compares vectors with cosine similarity.
5. Results are blended with Fuse keyword matches.
6. If anything fails, keyword search still returns results.

This is retrieval, not answer generation. It does not ask an LLM to explain, summarize, or invent recommendations.

## Regenerating The Index

For bundled local data:

```bash
npm run search:index
```

That reads:

- `public/data/tiles.json`
- `public/data/ideas.json`

and writes:

- `public/data/search-index.json`

If the production `data` branch combined catalog payload becomes the semantic index source of truth, first obtain the exact `catalog.json` payload, then run:

```bash
npm run search:index -- --catalog path/to/catalog.json --out path/to/search-index.json
```

The generated index records:

- schema version
- source fingerprint
- tile and idea counts
- model id
- runtime package
- vector dimension
- generated timestamp

If the fingerprint does not match the live catalog and ideas, semantic search is disabled for that session and Fuse keyword search takes over.

## Model And Runtime

The default model is `Xenova/all-MiniLM-L6-v2` through `@huggingface/transformers`. It is small enough for browser-side use and produces 384-dimensional vectors. The first semantic search may need to download and initialize model assets, so search surfaces use loading states and retain keyword fallback.

Changing models requires regenerating the index and keeping the runtime metadata in sync. If the query embedder model and index model differ, the index is rejected.

## Pros

- No Cloud API or OpenRouter dependency.
- No API key in the browser.
- Queries stay local to the browser embedding runtime.
- Stronger use-case matching than keyword search alone.
- Works with GitHub Pages and static JSON assets.

## Trade-Offs

- First-use model loading can be slower than keyword search.
- Browser/device performance varies.
- Semantic matches can produce plausible false positives.
- The generated index must stay aligned with the live data payload.
- Local submissions and admin overrides may fall back to keyword behavior until a regenerated index includes them.

## Tuning

Tune these carefully in `src/search.js`:

- semantic confidence thresholds
- keyword versus semantic blend weights
- exact-match boost behavior
- result labels
- fallback reason handling

Use real marketplace queries when tuning. Good test queries include:

- "help me prepare for a renewal conversation"
- "new account handoff before interlock"
- "find adoption risks before a QBR"
- "support cases and escalations before a customer meeting"
