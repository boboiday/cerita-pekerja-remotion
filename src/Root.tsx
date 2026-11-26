import { Composition } from "remotion";
import { Sample10s, SAMPLE_TOTAL } from "./stories/cerita-pekerja/Sample10s";
import { Cuti10s, CUTI_TOTAL } from "./stories/cerita-pekerja/Cuti10s";
import { EP12, EP12_TOTAL } from "./stories/cerita-pekerja/EP12";
import { EP13, EP13_TOTAL } from "./stories/cerita-pekerja/EP13";
import { EP14, EP14_TOTAL } from "./stories/cerita-pekerja/EP14";
import { EP15, EP15_TOTAL } from "./stories/cerita-pekerja/EP15";
import { EP16, EP16_TOTAL } from "./stories/cerita-pekerja/EP16";
import { EP17, EP17_TOTAL } from "./stories/cerita-pekerja/EP17";
import { EP18, EP18_TOTAL } from "./stories/cerita-pekerja/EP18";
import { EP19, EP19_TOTAL } from "./stories/cerita-pekerja/EP19";
import { EP19Test, EP19TEST_TOTAL } from "./stories/cerita-pekerja/EP19Test";
import { KitDemo, KIT_TOTAL } from "./stories/cerita-pekerja/KitDemo";

/** Every episode is a 1080x1920 (9:16) composition. Samples are 30 fps; full episodes are 24 fps (EP15 is 12 fps). */
const SHORT = { fps: 30, width: 1080, height: 1920 } as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Sample10s" component={Sample10s} durationInFrames={SAMPLE_TOTAL} {...SHORT} />
    <Composition id="Cuti10s" component={Cuti10s} durationInFrames={CUTI_TOTAL} {...SHORT} />
    <Composition id="EP12" component={EP12} durationInFrames={EP12_TOTAL} fps={24} width={1080} height={1920} />
    <Composition id="EP13" component={EP13} durationInFrames={EP13_TOTAL} fps={24} width={1080} height={1920} />
    <Composition id="EP14" component={EP14} durationInFrames={EP14_TOTAL} fps={24} width={1080} height={1920} />
    <Composition id="EP15" component={EP15} durationInFrames={EP15_TOTAL} fps={12} width={1080} height={1920} />
    <Composition id="EP16" component={EP16} durationInFrames={EP16_TOTAL} fps={24} width={1080} height={1920} />
    <Composition id="EP17" component={EP17} durationInFrames={EP17_TOTAL} fps={24} width={1080} height={1920} />
    <Composition id="EP18" component={EP18} durationInFrames={EP18_TOTAL} fps={24} width={1080} height={1920} />
    <Composition id="EP19" component={EP19} durationInFrames={EP19_TOTAL} fps={24} width={1080} height={1920} />
    {/* EP19Test = salinan uji EP19 (bukti upgrade kit). Bukan episode tayang. */}
    <Composition id="EP19Test" component={EP19Test} durationInFrames={EP19TEST_TOTAL} fps={24} width={1080} height={1920} />
    <Composition id="KitDemo" component={KitDemo} durationInFrames={KIT_TOTAL} {...SHORT} />
  </>
);
