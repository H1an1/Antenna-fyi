import { Composition } from "remotion";
import { AntennaPromo } from "./AntennaPromo";

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const DURATION_IN_FRAMES = 660;

export const RemotionRoot = () => {
  return (
    <Composition
      id="AntennaPromo"
      component={AntennaPromo}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
