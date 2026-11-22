import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Serve prerendered (○ static) pages straight from Workers static assets.
// With the default (no incremental cache) every request re-rendered the page —
// the home/invite HTML is ~580 KB (inline garland SVG), and that render blew
// the Workers CPU limit intermittently (error 1102 on every domain).
// Fine here: no page uses revalidate/ISR; dynamic data (Our Story) is fetched
// client-side from Supabase.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
