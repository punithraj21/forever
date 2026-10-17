import { redirect } from "next/navigation";

// /moments2 was the preview route for the redesign, which is now /moments.
// Kept only so old bookmarks keep working.
export default function Moments2Redirect() {
  redirect("/moments");
}
