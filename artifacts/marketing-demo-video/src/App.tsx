import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import VideoWithControls from "@/components/video/VideoWithControls";
import Gallery from "@/components/Gallery";

const HeroTemplate = lazy(() => import("@/components/video/videos/hero/Template"));
const LaylaTemplate = lazy(() => import("@/components/video/videos/layla/Template"));
const Replace5Template = lazy(() => import("@/components/video/videos/replace5/Template"));
const MobileTemplate = lazy(() => import("@/components/video/videos/mobile/Template"));
const NarrativeTemplate = lazy(() => import("@/components/video/videos/narrative/Template"));
const TutorialTemplate = lazy(() => import("@/components/video/videos/tutorial/Template"));

import { SCENE_DURATIONS as HERO_DURATIONS } from "@/components/video/videos/hero/Template";
import { SCENE_DURATIONS as LAYLA_DURATIONS } from "@/components/video/videos/layla/Template";
import { SCENE_DURATIONS as REPLACE5_DURATIONS } from "@/components/video/videos/replace5/Template";
import { SCENE_DURATIONS as MOBILE_DURATIONS } from "@/components/video/videos/mobile/Template";
import { SCENE_DURATIONS as NARRATIVE_DURATIONS } from "@/components/video/videos/narrative/Template";
import { SCENE_DURATIONS as TUTORIAL_DURATIONS } from "@/components/video/videos/tutorial/Template";

type RouteKey =
  | "gallery"
  | "hero"
  | "layla"
  | "replace5"
  | "mobile"
  | "narrative"
  | "tutorial"
  | "investor";

function getRouteFromPath(): RouteKey {
  if (typeof window === "undefined") return "gallery";
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  let path = window.location.pathname;
  if (base && path.startsWith(base)) {
    path = path.slice(base.length);
  }
  const slug = path.split("/").filter(Boolean).pop() ?? "";
  switch (slug) {
    case "hero":
    case "layla":
    case "replace5":
    case "mobile":
    case "narrative":
    case "tutorial":
    case "investor":
      return slug;
    default:
      return "gallery";
  }
}

function VideoLoader() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#1F1A24] text-white/60 text-sm tracking-widest uppercase">
      Loading video…
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState<RouteKey>(() => getRouteFromPath());

  useEffect(() => {
    const onPop = () => setRoute(getRouteFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const content = useMemo(() => {
    switch (route) {
      case "gallery":
        return <Gallery />;
      case "hero":
        return (
          <Suspense fallback={<VideoLoader />}>
            <VideoWithControls Template={HeroTemplate} sceneDurations={HERO_DURATIONS} />
          </Suspense>
        );
      case "layla":
        return (
          <Suspense fallback={<VideoLoader />}>
            <VideoWithControls Template={LaylaTemplate} sceneDurations={LAYLA_DURATIONS} />
          </Suspense>
        );
      case "replace5":
        return (
          <Suspense fallback={<VideoLoader />}>
            <VideoWithControls Template={Replace5Template} sceneDurations={REPLACE5_DURATIONS} />
          </Suspense>
        );
      case "mobile":
        return (
          <Suspense fallback={<VideoLoader />}>
            <VideoWithControls Template={MobileTemplate} sceneDurations={MOBILE_DURATIONS} />
          </Suspense>
        );
      case "narrative":
        return (
          <Suspense fallback={<VideoLoader />}>
            <VideoWithControls Template={NarrativeTemplate} sceneDurations={NARRATIVE_DURATIONS} />
          </Suspense>
        );
      case "tutorial":
        return (
          <Suspense fallback={<VideoLoader />}>
            <VideoWithControls Template={TutorialTemplate} sceneDurations={TUTORIAL_DURATIONS} />
          </Suspense>
        );
      case "investor":
        // Original long-form investor pitch — uses default VideoTemplate
        return <VideoWithControls />;
    }
  }, [route]);

  return content;
}
