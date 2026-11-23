import { Composition } from "remotion";
import { Sample10s, SAMPLE_TOTAL } from "./stories/cerita-pekerja/Sample10s";

/** Every episode is a 1080x1920 (9:16) composition at 30 fps. Add new episodes here. */
const SHORT = { fps: 30, width: 1080, height: 1920 } as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Sample10s" component={Sample10s} durationInFrames={SAMPLE_TOTAL} {...SHORT} />
  </>
);
