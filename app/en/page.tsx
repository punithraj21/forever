import type { Metadata } from "next";
import Home, { metadata as homeMetadata } from "../page";

// English home at an explicit path. Needed because on wedding.devshark.site
// "/" is rewritten to the Kannada page (proxy.ts), so the Kannada page's
// "Read in English" toggle links here. Same content as "/".
export const metadata: Metadata = {
  ...homeMetadata,
  alternates: { canonical: "/", languages: { kn: "/kn" } },
};

export default Home;
