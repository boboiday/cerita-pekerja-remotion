import { Composition } from "remotion";
import { Sample10s, SAMPLE_TOTAL } from "./stories/cerita-pekerja/Sample10s";
import { Cuti10s, CUTI_TOTAL } from "./stories/cerita-pekerja/Cuti10s";
import { EP12, EP12_TOTAL } from "./stories/cerita-pekerja/EP12";

/** Every episode is a 1080x1920 (9:16) composition. Samples are 30 fps; full episodes are 24 fps. */
const SHORT = { fps: 30, width: 1080, height: 1920 } as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Sample10s" component={Sample10s} durationInFrames={SAMPLE_TOTAL} {...SHORT} />
    <Composition id="Cuti10s" component={Cuti10s} durationInFrames={CUTI_TOTAL} {...SHORT} />
    <Composition id="EP12" component={EP12} durationInFrames={EP12_TOTAL} fps={24} width={1080} height={1920} />
  </>
);
