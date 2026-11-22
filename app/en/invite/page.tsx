import Invite, { metadata as inviteMetadata } from "../../invite/page";
import type { Metadata } from "next";

// English invitation at an explicit path: on wedding.devshark.site /invite is
// Kannada, so the Kannada page's "Read in English" toggle links here.
export const metadata: Metadata = {
  ...inviteMetadata,
  alternates: { canonical: "/invite", languages: { kn: "/kn/invite" } },
};

export default Invite;
