import { Composition } from "remotion";
import { Sample10s, SAMPLE_TOTAL } from "./stories/cerita-pekerja/Sample10s";
import { Cuti10s, CUTI_TOTAL } from "./stories/cerita-pekerja/Cuti10s";
import { EP12, EP12_TOTAL } from "./stories/cerita-pekerja/EP12";
import { EP13, EP13_TOTAL } from "./stories/cerita-pekerja/EP13";
import { EP14, EP14_TOTAL } from "./stories/cerita-pekerja/EP14";
import { KitDemo, KIT_TOTAL } from "./stories/cerita-pekerja/KitDemo";

/** Every episode is a 1080x1920 (9:16) composition. Samples are 30 fps; full episodes are 24 fps. */
const SHORT = { fps: 30, width: 1080, height: 1920 } as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Sample10s" component={Sample10s} durationInFrames={SAMPLE_TOTAL} {...SHORT} />
    <Composition id="Cuti10s" component={Cuti10s} durationInFrames={CUTI_TOTAL} {...SHORT} />
    <Composition id="EP12" component={EP12} durationInFrames={EP12_TOTAL} fps={24} width={1080} height={1920} />
    <Composition id="EP13" component={EP13} durationInFrames={EP13_TOTAL} fps={24} width={1080} height={1920} />
    <Composition id="EP14" component={EP14} durationInFrames={EP14_TOTAL} fps={24} width={1080} height={1920} />
    <Composition id="KitDemo" component={KitDemo} durationInFrames={KIT_TOTAL} {...SHORT} />
  </>
);
