import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "./style.css";

type FanCard = {
  id: string;
  src: string;
  x: number;
  y: number;
  rotation: number;
  depth: number;
};

const sideCards: FanCard[] = [
  { id: "hermes", src: "assets/profile-01-hermes.mp4", x: -650, y: 76, rotation: -26, depth: 1 },
  { id: "athena", src: "assets/profile-02-athena.mp4", x: -520, y: 38, rotation: -19, depth: 2 },
  { id: "prometheus", src: "assets/profile-03-prometheus.mp4", x: -390, y: 10, rotation: -12, depth: 3 },
  { id: "apollo", src: "assets/profile-04-apollo.mp4", x: -260, y: -10, rotation: -7, depth: 4 },
  { id: "artemis", src: "assets/profile-05-artemis.mp4", x: -130, y: -24, rotation: -3, depth: 5 },
  { id: "aphrodite", src: "assets/profile-06-aphrodite.mp4", x: 130, y: -24, rotation: 3, depth: 5 },
  { id: "dionysus", src: "assets/profile-07-dionysus.mp4", x: 260, y: -10, rotation: 7, depth: 4 },
  { id: "hades", src: "assets/profile-08-hades.mp4", x: 390, y: 10, rotation: 12, depth: 3 },
  { id: "persephone", src: "assets/profile-09-persephone.mp4", x: 520, y: 38, rotation: 19, depth: 2 },
  { id: "odysseus", src: "assets/profile-10-odysseus.mp4", x: 650, y: 76, rotation: 26, depth: 1 },
];

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

function seconds(value: number, fps: number) {
  return Math.round(value * fps);
}

function cardProgress(frame: number, start: number, duration: number) {
  return interpolate(frame, [start, start + duration], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
}

function typedValue(text: string, frame: number, start: number, interval: number) {
  const count = Math.max(0, Math.min(text.length, Math.floor((frame - start) / interval) + 1));
  return text.slice(0, count);
}

function fade(frame: number, start: number, end: number) {
  return interpolate(frame, [start, end], [0, 1], clamp);
}

function CardVideo({
  src,
  lead = false,
  style,
}: {
  src: string;
  lead?: boolean;
  style: React.CSSProperties;
}) {
  return (
    <div className={`video-card ${lead ? "video-card-lead" : ""}`} style={style}>
      <Video src={staticFile(src)} muted loop className="video-card-media" />
    </div>
  );
}

function FanCardLayer({
  card,
  frame,
  fanStart,
  mergeStart,
}: {
  card: FanCard;
  frame: number;
  fanStart: number;
  mergeStart: number;
}) {
  const side = Math.abs(card.x) / 650;
  const delayedStart = fanStart + Math.round((1 - side) * 8);
  const p = cardProgress(frame, delayedStart, 30);
  const merge = interpolate(frame, [mergeStart, mergeStart + 28], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });

  const x = interpolate(merge, [0, 1], [interpolate(p, [0, 1], [0, card.x]), 0]);
  const y = interpolate(merge, [0, 1], [interpolate(p, [0, 1], [178, card.y]), -40]);
  const rotation = interpolate(merge, [0, 1], [interpolate(p, [0, 1], [0, card.rotation]), 0]);
  const scale = interpolate(merge, [0, 1], [interpolate(p, [0, 1], [0.78, 1]), 0.16]);
  const opacity = interpolate(frame, [delayedStart, delayedStart + 10, mergeStart + 12, mergeStart + 26], [0, 1, 1, 0], clamp);

  return (
    <CardVideo
      src={card.src}
      style={{
        opacity,
        zIndex: card.depth,
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`,
      }}
    />
  );
}

function CurrentCardLayer({
  frame,
  liftStart,
  fanStart,
  mergeStart,
}: {
  frame: number;
  liftStart: number;
  fanStart: number;
  mergeStart: number;
}) {
  const lift = interpolate(frame, [liftStart, fanStart], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const merge = interpolate(frame, [mergeStart, mergeStart + 28], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  const opacity = interpolate(frame, [liftStart - 14, liftStart + 8, mergeStart + 12, mergeStart + 26], [0, 1, 1, 0], clamp);
  const x = interpolate(merge, [0, 1], [interpolate(lift, [0, 1], [250, 0]), 0]);
  const y = interpolate(merge, [0, 1], [interpolate(lift, [0, 1], [52, -64]), -34]);
  const scale = interpolate(merge, [0, 1], [interpolate(lift, [0, 1], [0.94, 1.08]), 0.18]);

  return (
    <CardVideo
      lead
      src="assets/profile-current.mp4"
      style={{
        opacity,
        zIndex: 30,
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`,
      }}
    />
  );
}

function HomeScene({ frame, start, end }: { frame: number; start: number; end: number }) {
  const opacity =
    fade(frame, start, start + 16) *
    interpolate(frame, [end - 16, end], [1, 0], clamp);
  const click = interpolate(frame, [start + 38, start + 44, start + 58], [0, 1, 0], clamp);
  const scale = interpolate(frame, [start, end], [1, 1.018], clamp);

  return (
    <AbsoluteFill className="browser-layer" style={{ opacity, transform: `scale(${scale})` }}>
      <Img src={staticFile("captures/homepage.jpg")} className="browser-video" />
      <div className="home-click-target" style={{ opacity: click, transform: `scale(${1 + click * 0.055})` }} />
    </AbsoluteFill>
  );
}

function LoginShell({
  frame,
  start,
  end,
  mode,
}: {
  frame: number;
  start: number;
  end: number;
  mode: "email" | "code";
}) {
  const opacity =
    fade(frame, start, start + 14) *
    interpolate(frame, [end - 14, end], [1, 0], clamp);
  const y = interpolate(frame, [start, start + 24], [22, 0], { ...clamp, easing: easeOut });
  const emailText = typedValue("hellp@antenna.fyi", frame, start + 24, 2);
  const codeText = typedValue("123456", frame, start + 22, 3);
  const sendPulse = mode === "email" ? interpolate(frame, [end - 28, end - 20, end - 10], [0, 1, 0], clamp) : 0;
  const verifyPulse = mode === "code" ? interpolate(frame, [end - 30, end - 22, end - 12], [0, 1, 0], clamp) : 0;

  return (
    <AbsoluteFill className="login-stage" style={{ opacity }}>
      <div className="login-card" style={{ transform: `translateY(${y}px)` }}>
        <h1>Antenna</h1>
        <p>{mode === "email" ? "Sign in or create an account" : "Enter the code sent to hellp@antenna.fyi"}</p>

        {mode === "email" ? (
          <>
            <label>Email</label>
            <div className="login-input">{emailText}</div>
            <div className="login-button" style={{ boxShadow: `0 0 ${sendPulse * 30}px rgba(226, 196, 110, ${sendPulse * 0.34})` }}>
              Send verification code
            </div>
            <div className="login-divider">
              <span />
              <em>or</em>
              <span />
            </div>
            <div className="google-button">
              <span>G</span>
              Continue with Google
            </div>
          </>
        ) : (
          <>
            <label>Verification code</label>
            <div className="login-input code-input">{codeText}</div>
            <div className="login-button" style={{ boxShadow: `0 0 ${verifyPulse * 30}px rgba(226, 196, 110, ${verifyPulse * 0.34})` }}>
              Verify
            </div>
            <div className="login-footer">
              <span>Change email</span>
              <span>Resend code</span>
            </div>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
}

function DashboardScene({
  frame,
  start,
  liftStart,
  fanStart,
}: {
  frame: number;
  start: number;
  liftStart: number;
  fanStart: number;
}) {
  const opacity =
    fade(frame, start, start + 14) *
    interpolate(frame, [liftStart, fanStart], [1, 0.14], clamp);
  const scale = interpolate(frame, [start, fanStart], [1, 1.035], clamp);

  return (
    <AbsoluteFill className="browser-layer" style={{ opacity, transform: `scale(${scale})` }}>
      <Sequence from={start}>
        <Video src={staticFile("captures/dashboard-interaction.mp4")} muted className="browser-video" />
      </Sequence>
    </AbsoluteFill>
  );
}

function Wordmark({ frame, flashStart }: { frame: number; flashStart: number }) {
  const opacity = interpolate(frame, [flashStart + 4, flashStart + 18], [0, 1], clamp);
  const scale = interpolate(frame, [flashStart + 4, flashStart + 30], [0.92, 1], {
    ...clamp,
    easing: easeOut,
  });

  return (
    <div className="wordmark-lockup" style={{ opacity, transform: `scale(${scale})` }}>
      <Img src={staticFile("assets/antenna.svg")} className="wordmark" />
    </div>
  );
}

export const AntennaPromo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const homeStart = seconds(0, fps);
  const homeEnd = seconds(2.2, fps);
  const loginStart = seconds(2.1, fps);
  const loginEnd = seconds(5.0, fps);
  const codeStart = seconds(4.85, fps);
  const codeEnd = seconds(7.05, fps);
  const dashboardStart = seconds(6.85, fps);
  const liftStart = seconds(13.95, fps);
  const fanStart = seconds(15.35, fps);
  const mergeStart = seconds(19.05, fps);
  const flashStart = seconds(20.0, fps);

  const fanOpacity = interpolate(frame, [liftStart - 8, liftStart + 12, mergeStart + 10, mergeStart + 28], [0, 1, 1, 0], clamp);
  const glowOpacity = interpolate(frame, [fanStart, fanStart + 35, mergeStart, mergeStart + 30], [0, 0.72, 0.72, 0], clamp);
  const flashOpacity = interpolate(frame, [flashStart - 5, flashStart, flashStart + 8, flashStart + 24], [0, 1, 0.46, 0], clamp);

  return (
    <AbsoluteFill className="stage">
      <HomeScene frame={frame} start={homeStart} end={homeEnd} />
      <LoginShell frame={frame} start={loginStart} end={loginEnd} mode="email" />
      <LoginShell frame={frame} start={codeStart} end={codeEnd} mode="code" />
      <DashboardScene frame={frame} start={dashboardStart} liftStart={liftStart} fanStart={fanStart} />

      <AbsoluteFill className="cinema-field" style={{ opacity: fanOpacity }}>
        <div className="field-glow" style={{ opacity: glowOpacity }} />
        <div className="fan-table">
          {sideCards.map((card) => (
            <FanCardLayer
              key={card.id}
              card={card}
              frame={frame}
              fanStart={fanStart}
              mergeStart={mergeStart}
            />
          ))}
          <CurrentCardLayer frame={frame} liftStart={liftStart} fanStart={fanStart} mergeStart={mergeStart} />
        </div>
      </AbsoluteFill>

      <AbsoluteFill className="flash" style={{ opacity: flashOpacity }} />
      <Wordmark frame={frame} flashStart={flashStart} />
    </AbsoluteFill>
  );
};
