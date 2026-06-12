import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function readProjectFile(path) {
  return readFile(new URL(path, root), "utf8");
}

async function fileExists(path) {
  try {
    await access(new URL(path, root));
    return true;
  } catch {
    return false;
  }
}

async function pngSize(path) {
  const buffer = await readFile(new URL(path, root));

  assert.equal(buffer.toString("ascii", 1, 4), "PNG", `${path} should be a PNG image`);

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function cssRule(styles, selector) {
  const start = styles.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `${selector} rule should exist`);
  const end = styles.indexOf("\n}", start);
  assert.notEqual(end, -1, `${selector} rule should be closed`);
  return styles.slice(start, end + 2);
}

test("home page uses the Antenna redesign implementation", async () => {
  const page = await readProjectFile("src/app/page.tsx");
  const globals = await readProjectFile("src/app/globals.css");
  const styles = await readProjectFile("src/app/components/RedesignHomepage.module.css");

  assert.match(page, /RedesignHomepage/, "home page should render the Figma redesign component");
  assert.equal(
    await fileExists("src/app/components/RedesignHomepage.tsx"),
    true,
    "redesign implementation component should exist",
  );
  assert.equal(
    await fileExists("src/app/components/RedesignHomepage.module.css"),
    true,
    "redesign styles should live beside the component",
  );
  assert.doesNotMatch(
    styles,
    /:global\(body:has\(\[data-redesign-homepage\]\)\)/,
    "CSS Modules should not contain a pure global body selector because next build --webpack rejects it",
  );
  assert.match(
    globals,
    /body:has\(\[data-redesign-homepage\]\) \{\n\s*background: #f7f7f7 !important;\n\}/,
    "redesign body background should live in global CSS instead of the CSS module",
  );
});

test("redesign homepage wires the requested interactive states and assets", async () => {
  const source = await readProjectFile("src/app/components/RedesignHomepage.tsx");
  const styles = await readProjectFile("src/app/components/RedesignHomepage.module.css");
  const implementation = `${source}\n${styles}`;

  for (const marker of [
    'data-scene="shift-scroll"',
    'data-scene="identity-profile"',
    'data-scene="reasons-feed"',
    'data-scene="door-scroll"',
    'data-scene="faq"',
  ]) {
    assert.match(source, new RegExp(marker), `missing ${marker}`);
  }

  for (const asset of [
    "/hero-greek-gods-original-faithful-uhd-4k.png",
    "/redesign/figma/reasons-field-bg.png",
    "/redesign/figma/profile-console-bg.png",
    "/redesign/figma/people-hosts-bg.png",
    "/redesign/figma/party-people.png",
    "/redesign/figma/party-hosts.png",
    "/redesign/figma/rooms-door-transition-transparent.webm",
    "/redesign/figma/rooms-door-transition.mp4",
    "/redesign/reasons/svgnew/serena-portrait-full.svg",
    "/redesign/reasons/svgnew/you-portrait-full.svg",
    "/redesign/reasons/svgnew/serena-token-full.svg",
    "/redesign/reasons/svgnew/you-token-full.svg",
    "/redesign/second-screen/act-3-agent-social-graph.png",
  ]) {
    assert.match(
      implementation,
      new RegExp(asset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `missing ${asset}`,
    );
  }
  assert.doesNotMatch(
    styles,
    /@keyframes lineBreath/,
    "redesign CSS should not keep unused synthetic animations that are absent from the Figma context",
  );
});

test("redesign homepage uses the Figma prototype display typography stack", async () => {
  const styles = await readProjectFile("src/app/components/RedesignHomepage.module.css");

  assert.match(
    styles,
    /--font-display: "Rector", Georgia, "Times New Roman", Times, serif;/,
    "redesign display text should use Rector before the serif fallbacks from the Figma prototypes",
  );
  assert.match(
    styles,
    /--font-sans: "General Sans", var\(--font-inter\), ui-sans-serif, system-ui, sans-serif;/,
    "redesign sans text should use the Figma General Sans family before Inter fallback",
  );
  for (const fontFace of [
    /@font-face \{\n\s*font-family: "Rector";\n\s*src: url\("\/redesign\/fonts\/rector-regular\.otf"\) format\("opentype"\),\n\s*local\("Rector-Regular"\), local\("Rector"\);/,
    /@font-face \{\n\s*font-family: "Rector";\n\s*src: url\("\/redesign\/fonts\/rector-medium\.otf"\) format\("opentype"\),\n\s*local\("Rector-Medium"\), local\("Rector Medium"\);/,
    /@font-face \{\n\s*font-family: "Rector";\n\s*src: url\("\/redesign\/fonts\/rector-bold\.otf"\) format\("opentype"\),\n\s*local\("Rector-Bold"\), local\("Rector Bold"\);/,
    /@font-face \{\n\s*font-family: "General Sans";\n\s*src: url\("\/redesign\/fonts\/GeneralSans-Regular\.woff2"\) format\("woff2"\),\n\s*local\("GeneralSans-Regular"\), local\("General Sans Regular"\);/,
    /@font-face \{\n\s*font-family: "General Sans";\n\s*src: url\("\/redesign\/fonts\/GeneralSans-Medium\.woff2"\) format\("woff2"\),\n\s*local\("GeneralSans-Medium"\), local\("General Sans Medium"\);/,
    /@font-face \{\n\s*font-family: "General Sans";\n\s*src: url\("\/redesign\/fonts\/GeneralSans-Bold\.woff2"\) format\("woff2"\),\n\s*local\("GeneralSans-Bold"\), local\("General Sans Bold"\);/,
  ]) {
    assert.match(styles, fontFace, "Figma font families should load from shipped font files before local fallbacks");
  }
  assert.doesNotMatch(
    styles,
    /--font-display: "Times New Roman"/,
    "redesign display typography should not prefer Times over the Figma Rector face",
  );
  assert.match(
    styles,
    /\.page h1,\n\.page h2,\n\.page h3 \{\n\s*color: var\(--ink\);\n\s*font-family: var\(--font-display\);\n\s*font-weight: 500;/,
    "major headings should use the Figma display stack at the prototype weight",
  );
});

test("redesign homepage ships the actual Figma font assets", async () => {
  for (const fontPath of [
    "public/redesign/fonts/rector-regular.otf",
    "public/redesign/fonts/rector-medium.otf",
    "public/redesign/fonts/rector-bold.otf",
    "public/redesign/fonts/GeneralSans-Regular.woff2",
    "public/redesign/fonts/GeneralSans-Medium.woff2",
    "public/redesign/fonts/GeneralSans-Bold.woff2",
  ]) {
    assert.equal(await fileExists(fontPath), true, `${fontPath} should be checked in for Figma font fidelity`);
  }
});

test("hero section keeps the Figma Rector title and General Sans subhead scale", async () => {
  const styles = await readProjectFile("src/app/components/RedesignHomepage.module.css");

  assert.match(
    styles,
    /\.heroImage \{\n(?:.*\n)*?\s*border-radius: 16px;/,
    "hero image mask should keep the Figma 16px radius",
  );
  assert.match(
    styles,
    /\.heroCopy \{\n\s*position: absolute;\n\s*top: clamp\(14\.75rem, 21\.66svh, 15\.125rem\);\n\s*left: clamp\(2rem, 15\.28vw, 13\.75rem\);/,
    "hero copy should start at the Figma x=220 y=242 desktop coordinate",
  );
  assert.match(
    styles,
    /\.heroCopy \{\n(?:.*\n)*?\s*width: min\(35\.1875rem, calc\(100vw - 4rem\)\);/,
    "hero copy group should match the Figma node 2235:882 width of 563px instead of stretching to an invisible wider box",
  );
  assert.match(
    styles,
    /\.nav \{\n(?:.*\n)*?\s*align-items: flex-start;/,
    "hero nav actions should sit at the Figma top=48 coordinate instead of being vertically centered",
  );
  assert.match(
    styles,
    /\.heroCopy h1 \{\n\s*margin: 0;\n\s*max-width: 35\.1875rem;\n\s*font-size: clamp\(3\.25rem, 4\.45vw, 4rem\);\n\s*line-height: 1;\n\s*letter-spacing: -0\.02em;/,
    "hero title should match Figma Rector Medium 64px, 563px width, and -2% tracking",
  );
  assert.match(
    styles,
    /\.heroCopy h1 \{\n(?:.*\n)*?\s*text-box-trim: trim-both;\n\s*text-box-edge: cap alphabetic;/,
    "hero title should use the Figma text-box trim so the subhead starts at y=399",
  );
  assert.match(
    styles,
    /\.heroCopy p \{\n\s*max-width: 34\.0625rem;\n\s*margin: 1\.75rem 0 0;\n\s*color: var\(--ink\);\n\s*font-family: var\(--font-sans\), ui-sans-serif, system-ui, sans-serif;\n\s*font-size: clamp\(1\.25rem, 1\.67vw, 1\.5rem\);\n\s*font-weight: 500;\n\s*line-height: 1\.2;\n\s*letter-spacing: -0\.02em;\n\}/,
    "hero subhead should match Figma General Sans Medium 24px with the 28px stack gap",
  );
  assert.match(
    styles,
    /\.heroCopy \.ctaRow \{\n\s*width: max-content;\n\s*margin-top: 1\.75rem;\n\}/,
    "hero CTA row should hug the Figma node 2235:886 content width instead of stretching across the copy frame",
  );
  assert.match(
    styles,
    /\.heroCopy \.primaryButton \{\n\s*width: 7\.3125rem;\n\}/,
    "hero primary CTA should match the Figma node 2235:887 width of 117px",
  );
  assert.match(
    styles,
    /\.heroCopy \.secondaryButton \{\n\s*width: 6\.75rem;\n\}/,
    "hero secondary CTA should match the Figma node 2235:889 width of 108px",
  );
  assert.match(
    styles,
    /\.signIn,\n\.primaryButton \{\n\s*background: var\(--forest\);\n\s*color: #f3efe7;\n\}/,
    "hero dark CTAs should use the exact #f3efe7 text color from Figma node 2235:878",
  );
  assert.match(
    styles,
    /\.secondaryButton \{\n\s*border-color: transparent;\n\s*background: #f3efe7;\n\s*color: var\(--ink\);/,
    "hero secondary CTA should use the exact #f3efe7 fill from Figma node 2235:878 without a synthetic stroke",
  );
  assert.doesNotMatch(
    cssRule(styles, ".signIn,\n.menuButton,\n.primaryButton,\n.secondaryButton"),
    /transition:/,
    "hero CTAs should not add synthetic transitions absent from Figma nodes 2235:887, 2235:889, and 2235:891",
  );
  assert.doesNotMatch(
    styles,
    /\.signIn:hover,\n\.menuButton:hover,\n\.primaryButton:hover,\n\.secondaryButton:hover \{\n\s*transform:/,
    "hero CTAs should not add synthetic hover movement absent from Figma nodes 2235:887, 2235:889, and 2235:891",
  );
});

test("hero navigation uses the exact Figma logo and menu assets", async () => {
  const source = await readProjectFile("src/app/components/RedesignHomepage.tsx");
  const styles = await readProjectFile("src/app/components/RedesignHomepage.module.css");

  for (const asset of [
    "/redesign/figma/hero-logo-wordmark.svg",
    "/redesign/figma/hero-logo-mark.svg",
    "/redesign/figma/hero-menu-icon.svg",
  ]) {
    assert.match(source, new RegExp(asset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `missing ${asset}`);
    assert.equal(await fileExists(`public${asset}`), true, `${asset} should be downloaded from the Figma payload`);
  }

  assert.doesNotMatch(source, /from "lucide-react"/, "hero menu should use the Figma icon asset, not a library approximation");
  assert.doesNotMatch(source, /\/brand\/antenna\.svg/, "hero logo should use the Figma-exported logo pieces");
  assert.match(
    styles,
    /\.nav \{\n\s*position: absolute;\n\s*top: 3rem;\n\s*left: 3\.8125rem;\n\s*right: 3\.75rem;/,
    "hero nav should match the Figma x=61 y=48 and right=60 desktop coordinates",
  );
  assert.match(
    styles,
    /\.brand \{\n\s*position: relative;\n\s*display: block;\n\s*width: 10\.125rem;\n\s*height: 2rem;\n\s*overflow: hidden;\n\}/,
    "hero logo lockup should match the Figma 162px by 32px container",
  );
  assert.match(
    styles,
    /\.brandWordmark \{\n\s*position: absolute;\n\s*left: 2\.25rem;\n\s*top: 0\.25rem;\n\s*width: 7\.875rem;\n\s*height: 1\.75rem;\n\}/,
    "hero wordmark should match the Figma x=36 y=4 w=126 h=28 bounds inside the logo",
  );
  assert.match(
    styles,
    /\.brandMark \{\n\s*position: absolute;\n\s*left: 0\.3125rem;\n\s*top: 0\.3125rem;\n\s*width: 1\.3009rem;\n\s*height: 1\.7044rem;\n\}/,
    "hero mark should match the Figma logo crop inside the 162px lockup",
  );
  assert.match(
    cssRule(styles, ".menuButton"),
    /\.menuButton \{\n\s*width: 2rem;\n\s*min-height: 2rem;\n\s*border: 0\.64px solid #1c2a1d;\n\s*background: transparent;/,
    "hero menu button should match Figma node 2235:905 with only the 0.64px #1c2a1d stroke and no synthetic fill",
  );
  assert.match(
    styles,
    /\.menuButton img \{\n\s*display: block;\n\s*width: 0\.88rem;\n\s*height: 0\.88rem;\n\}/,
    "hero menu glyph should use the Figma 14.08px icon asset",
  );
});

test("shift scene starts with only the first Figma statement visible", async () => {
  const styles = await readProjectFile("src/app/components/RedesignHomepage.module.css");

  assert.match(
    styles,
    /\.shiftText \{\n\s*top: 50%;\n\s*display: flex;\n\s*width: min\(33\.125rem, calc\(100vw - 3rem\)\);\n\s*flex-direction: column;\n\s*gap: 1\.9375rem;\n\s*transform: translate\(-50%, -50%\);\n\}/,
    "shift text should stay visually centered after the middle shatter deck is removed",
  );
  assert.match(
    styles,
    /\.shiftText p \{\n\s*font-size: clamp\(1\.55rem, 1\.95vw, 1\.75rem\);\n\s*line-height: 1\.2;\n\s*letter-spacing: -0\.02em;\n\}/,
    "shift body lines should use the Figma Rector Medium 28px scale",
  );
  assert.match(
    styles,
    /\.shiftText strong \{\n\s*font-size: clamp\(1\.75rem, 2\.22vw, 2rem\);\n\s*font-weight: 700;\n\s*line-height: 1\.2;\n\s*letter-spacing: -0\.02em;\n\}/,
    "shift question line should use the Figma Rector Bold 32px scale",
  );
  assert.match(
    styles,
    /\.shiftText \[data-shift-line="2"\],\n\.shiftText \[data-shift-line="3"\] \{\n\s*opacity: 0;\n\s*visibility: hidden;\n\s*transform: translateY\(18px\);/,
    "shift frame 02 should not show the AI-era and meeting-question lines before the scrub reveals them",
  );
});

test("shift scroll holds the first Figma statement before revealing the surrounding card field", async () => {
  const source = await readProjectFile("src/app/components/RedesignHomepage.tsx");
  const styles = await readProjectFile("src/app/components/RedesignHomepage.module.css");
  const scatterTweenBlock = source.match(/gsap\.fromTo\(\n\s*"\[data-shift-group\]"[\s\S]*?\n\s*\);/);

  assert.match(
    source,
    /const scatterFromCenter = \(axis: "x" \| "y"\) =>[\s\S]*?const parentWidth = parent\?\.clientWidth \?\? window\.innerWidth;[\s\S]*?parentWidth \/ 2 - \(element\.offsetLeft \+ element\.offsetWidth \/ 2\)[\s\S]*?parentHeight \/ 2 - \(element\.offsetTop \+ element\.offsetHeight \/ 2\)/,
    "shift groups should compute their first-frame offset from the shift stage center",
  );
  assert.match(
    source,
    /gsap\.fromTo\(\n\s*"\[data-shift-group\]",\n\s*\{ autoAlpha: 1, x: scatterFromCenter\("x"\), y: scatterFromCenter\("y"\), scale: 0\.62 \},\n\s*\{\n\s*autoAlpha: 1,\n\s*x: 0,\n\s*y: 0,\n\s*scale: 1,\n\s*duration: 0\.38,\n\s*stagger: \{ amount: 0\.08, from: "center" \},\n\s*ease: "power3\.out",\n\s*scrollTrigger: \{\n\s*trigger: "\[data-scene='shift-scroll'\]",\n\s*start: "top 50%",\n\s*once: true,\n\s*\},\n\s*\},\n\s*\);/,
    "shift groups should burst from the center once when the second screen is half visible",
  );
  assert.ok(scatterTweenBlock, "shift groups should have a dedicated one-shot scatter tween");
  assert.doesNotMatch(
    scatterTweenBlock[0],
    /scrub:/,
    "the initial center-to-field burst should not be scrubbed by scroll progress",
  );
  assert.doesNotMatch(
    source,
    /shiftTimeline\n\s*\.fromTo\(\n\s*"\[data-shift-group\]"/,
    "the pinned shift scrub timeline should not own the one-shot scatter animation",
  );
  assert.match(
    source,
    /shiftTimeline\n\s*\.to\(\{\}, \{ duration: 0\.32 \}\)\n\s*\.fromTo\("\[data-shift-line='2'\]"/,
    "after the one-shot scatter, the pinned scrub timeline should keep the previous opening hold before revealing the second line",
  );
  assert.match(
    source,
    /data-internet-front/,
    "shift frame 02 should render the Figma act-1 information-front cards before shattering",
  );
  assert.match(
    source,
    /data-internet-shatter/,
    "shift frame 03 should render the Figma individual shatter cards as a separate state",
  );
  assert.doesNotMatch(
    cssRule(styles, ".internetCard"),
    /filter:/,
    "shift frame 03 cards should not add synthetic drop-shadow or saturation absent from Figma node 2235:1713",
  );
  assert.doesNotMatch(
    source,
    /data-shift-card|data-shard|shardDeck|shardTransforms|generated-shards\/browser-window/,
    "second screen should remove the middle browser/card shatter deck and keep only the surrounding information elements",
  );
  assert.doesNotMatch(
    styles,
    /\.shardDeck|\.shardSourceCard|\.shard \{/,
    "second screen CSS should not keep styles for the removed middle shatter deck",
  );
  assert.match(
    source,
    /\.to\("\[data-internet-front\]", \{ autoAlpha: 0, duration: 0\.16 \}, "<"\)\n\s*\.fromTo\("\[data-internet-shatter\]"/,
    "shift timeline should transition from frame 02 front cards into frame 03 shatter cards",
  );
  assert.match(
    source,
    /\.fromTo\("\[data-shift-line='3'\]", \{ autoAlpha: 0, y: 18 \}, \{ autoAlpha: 1, y: 0, duration: 0\.18 \}\)\n\s*\.to\("\[data-internet-shatter\]", \{ opacity: 0\.18, scale: 1\.04, stagger: 0\.01, duration: 0\.18 \}, ">"\)/,
    "shift frame 03 should keep shatter cards visible until the third line has finished appearing",
  );
});

test("shift final social graph keeps the Figma Rector copy and two-line headline", async () => {
  const source = await readProjectFile("src/app/components/RedesignHomepage.tsx");
  const styles = await readProjectFile("src/app/components/RedesignHomepage.module.css");

  assert.match(
    styles,
    /\.mythToken \{\n(?:.*\n)*?\s*width: 6\.125rem;\n\s*height: 6\.125rem;/,
    "final social graph tokens should match the Figma 98px node size",
  );
  assert.doesNotMatch(
    cssRule(styles, ".mythToken"),
    /filter:/,
    "final social graph tokens should not add a synthetic drop-shadow absent from Figma node 2235:1618",
  );
  assert.doesNotMatch(
    styles,
    /\.mythToken:nth-child/,
    "final social graph badges should inherit their positions from the same eight card groups instead of a separate token layer",
  );
  assert.match(
    styles,
    /\.shiftFinalCopy \{\n\s*z-index: 9;\n\s*top: 50%;\n\s*opacity: 0;\n\s*visibility: hidden;\n\}/,
    "final social graph copy should stay hidden by default, then appear at the same centered position as the previous shift text group",
  );
  assert.match(
    source,
    /\.fromTo\("\[data-shift-copy='final'\]", \{ autoAlpha: 0 \}, \{ autoAlpha: 1, duration: 0\.2 \}, ">"\)/,
    "final social graph copy should wait until the previous shift text group has disappeared before fading in",
  );
  assert.doesNotMatch(
    source,
    /\.to\("\[data-shift-copy='final'\]", \{ autoAlpha: 1, duration: 0\.01 \}, "<"\)/,
    "final social graph copy should not use a same-frame snap-to-visible tween that causes a flash",
  );
  assert.match(
    styles,
    /\.shiftFinalCopy p \{\n\s*margin: 0 0 3\.4rem;\n\s*color: var\(--ink\);\n\s*font-family: var\(--font-display\);\n\s*font-size: clamp\(1\.55rem, 1\.95vw, 1\.75rem\);\n\s*font-weight: 500;\n\s*line-height: 1\.2;\n\s*letter-spacing: -0\.02em;\n\}/,
    "final social graph kicker should use Rector Medium 28px with the Figma tracking",
  );
  assert.match(
    styles,
    /\.shiftFinalCopy h2 \{\n\s*width: min\(46rem, 84vw\);\n\s*margin: 0 auto;\n\s*font-size: clamp\(2\.7rem, 3\.9vw, 3\.5rem\);\n\s*line-height: 1\.4;\n\s*letter-spacing: -0\.02em;/,
    "final social graph headline should match the Figma Rector 56px two-line type",
  );
  assert.match(
    styles,
    /\.shiftFinalCopy h2 \{\n(?:.*\n)*?\s*text-box-trim: trim-both;\n\s*text-box-edge: cap alphabetic;/,
    "final social graph headline should use the Figma text-box trim",
  );
});

test("shift scene binds each complete card, shatter card, and badge into eight floating groups", async () => {
  const source = await readProjectFile("src/app/components/RedesignHomepage.tsx");
  const styles = await readProjectFile("src/app/components/RedesignHomepage.module.css");
  const groupBlock = source.match(/const shiftCardGroups = \[([\s\S]*?)\] as const;/);

  assert.ok(groupBlock, "shift scene should use one grouped data source");
  assert.equal([...groupBlock[1].matchAll(/\bid: "/g)].length, 8, "shift scene should render exactly eight grouped card/badge units");
  const floatOffsets = [...groupBlock[1].matchAll(/float(?:Start|End)[XY]: "(-?\d+(?:\.\d+)?)rem"/g)].map((match) =>
    Math.abs(Number(match[1])),
  );
  assert.equal(
    floatOffsets.length,
    32,
    "shift scene should define start/end x/y float offsets for each of the eight groups",
  );
  assert.ok(Math.max(...floatOffsets) >= 1, "second-screen floating groups should have a visibly wider drift");
  assert.ok(
    floatOffsets.filter((offset) => offset >= 0.6).length >= 24,
    "most second-screen floating offsets should be larger than the prior subtle half-rem drift",
  );
  assert.match(
    source,
    /shiftCardGroups\.map\(\(group\) => \(\n\s*<div[\s\S]*data-shift-group[\s\S]*<div className=\{styles\.shiftCardFloat\} data-shift-float>[\s\S]*data-internet-front[\s\S]*data-internet-shatter[\s\S]*data-shift-badge/,
    "each group should contain the complete card, shatter card, and badge in the same DOM unit",
  );
  assert.doesNotMatch(
    source,
    /const constellationTokens|const internetFrontCards|const internetShatterCards/,
    "shift states should not be split into separate position sources after grouping",
  );
  assert.match(
    styles,
    /\.shiftStateAnchor,\n\.shiftBadgeAnchor \{\n\s*position: absolute;\n\s*left: 50%;\n\s*top: 50%;\n\s*transform: translate\(-50%, -50%\);/,
    "complete card, shatter card, and badge should share the same center point inside each group",
  );
  assert.match(
    styles,
    /\.shiftCardGroup \{\n\s*position: absolute;\n\s*width: var\(--group-width\);\n\s*height: var\(--group-height\);\n\s*pointer-events: none;\n\s*will-change: transform;\n\}\n\n\.shiftCardFloat \{\n\s*position: absolute;\n\s*inset: 0;\n\s*animation: shiftCardFloat var\(--float-duration\) ease-in-out infinite alternate;/,
    "the outer group should handle scatter while the inner shell handles subtle floating",
  );
  assert.match(styles, /@keyframes shiftCardFloat \{/, "floating groups should define a shared keyframe animation");
  assert.match(
    source,
    /\.fromTo\("\[data-shift-token\]", \{ autoAlpha: 0, scale: 0\.46 \}, \{ autoAlpha: 1, scale: 1, stagger: 0\.03, duration: 0\.22 \}, "<0\.03"\)/,
    "badges should fade and scale in at the group center without a separate y-offset",
  );
});

test("shift scene uses the Figma individual information-card assets", async () => {
  const source = await readProjectFile("src/app/components/RedesignHomepage.tsx");

  for (const asset of [
    "/redesign/second-screen/act-1-information-internet-front.png",
    "/redesign/second-screen/act-2-individual-card-shatter-sheet.png",
  ]) {
    assert.match(source, new RegExp(asset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `missing ${asset}`);
  }
  assert.equal(
    source.includes('src: "/redesign/second-screen/act-1-information-internet.png"'),
    false,
    "the shift field should not shrink the full collage into one misplaced card",
  );
});

test("shift shatter cards use the exact Figma frame 3 sprite crops and bounds", async () => {
  const source = await readProjectFile("src/app/components/RedesignHomepage.tsx");
  const styles = await readProjectFile("src/app/components/RedesignHomepage.module.css");

  for (const crop of [
    'sheetLeft: "-3.91%"',
    'sheetTop: "-9.88%"',
    'sheetWidth: "169%"',
    'sheetHeight: "258.02%"',
    'sheetLeft: "-161.02%"',
    'sheetTop: "-10.57%"',
    'sheetWidth: "265.68%"',
    'sheetHeight: "276.23%"',
    'sheetLeft: "-6.41%"',
    'sheetTop: "-247.11%"',
    'sheetWidth: "297.86%"',
    'sheetHeight: "381.16%"',
    'sheetLeft: "-113.74%"',
    'sheetTop: "-233.62%"',
    'sheetWidth: "319.08%"',
    'sheetHeight: "360.34%"',
    'sheetLeft: "-184.3%"',
    'sheetTop: "-226.74%"',
    'sheetWidth: "289.61%"',
    'sheetHeight: "518.85%"',
    'sheetLeft: "-124.93%"',
    'sheetTop: "-194.8%"',
    'sheetWidth: "359.31%"',
    'sheetHeight: "466.17%"',
    'sheetLeft: "-7.46%"',
    'sheetTop: "-196.99%"',
    'sheetWidth: "322.37%"',
    'sheetHeight: "471.43%"',
    'sheetLeft: "-221.41%"',
    'sheetTop: "-233.62%"',
    'sheetWidth: "327.42%"',
    'sheetHeight: "360.34%"',
  ]) {
    assert.match(source, new RegExp(crop.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `missing Figma crop ${crop}`);
  }

  for (const block of [
    /\.internetCardBrowser \{\n\s*left: 8\.75%;\n\s*top: 7\.7%;\n\s*width: 11\.375rem;\n\s*height: 7\.4375rem;\n\}/,
    /\.internetCardSearch \{\n\s*left: 79\.1%;\n\s*top: 28\.56%;\n\s*width: 9\.3125rem;\n\s*height: 9rem;\n\}/,
    /\.internetCardCalendar \{\n\s*left: 6\.11%;\n\s*top: 66\.52%;\n\s*width: 8\.625rem;\n\s*height: 6\.75rem;\n\}/,
    /\.internetCardMedia \{\n\s*left: 59\.79%;\n\s*top: 13\.07%;\n\s*width: 8\.25rem;\n\s*height: 7\.3125rem;\n\}/,
    /\.internetCardProfile \{\n\s*left: 38\.13%;\n\s*top: 84\.24%;\n\s*width: 8\.4118rem;\n\s*height: 4\.6875rem;\n\}/,
    /\.internetCardMap \{\n\s*left: 79\.58%;\n\s*top: 67\.32%;\n\s*width: 7\.1875rem;\n\s*height: 5\.5rem;\n\}/,
    /\.internetCardFeed \{\n\s*left: 12\.85%;\n\s*top: 37\.6%;\n\s*width: 7\.25rem;\n\s*height: 5rem;\n\}/,
    /\.internetCardInbox \{\n\s*left: 35\.49%;\n\s*top: 20\.32%;\n\s*width: 8\.25rem;\n\s*height: 7\.5rem;\n\}/,
  ]) {
    assert.match(styles, block, "shatter cards should match the Figma frame 3 bounds at 1440px");
  }
});

test("identity profile section keeps the Figma dashboard placement and size", async () => {
  const source = await readProjectFile("src/app/components/RedesignHomepage.tsx");
  const styles = await readProjectFile("src/app/components/RedesignHomepage.module.css");

  assert.deepEqual(
    await pngSize("public/redesign/figma/profile-console-bg.png"),
    { width: 1586, height: 992 },
    "profile console should use the Figma background media, not a flattened UI screenshot",
  );
  assert.doesNotMatch(
    source,
    /profile-dashboard\.png/,
    "profile console should be built from real DOM instead of using the old flattened dashboard image",
  );
  assert.match(
    source,
    /data-profile-console/,
    "profile console should expose a real DOM shell",
  );
  for (const panel of ["today", "identity", "matches", "rooms"]) {
    assert.match(
      source,
      new RegExp(`(?:data-profile-panel="${panel}"|<ConsolePanel[\\s\\S]*?id="${panel}")`),
      `profile console should render a real ${panel} panel`,
    );
  }
  for (const copy of [
    "Nothing needs action right now.",
    "Matches, event tasks, and agent recommendations will appear here as rows.",
    "Antenna helps your agent understand the room, surface the people who matter, and turn hidden relevance into real-world connection.",
    "People who valued real feeling and the real world.",
    "No pending matches.",
    "No room joined.",
  ]) {
    assert.match(
      source,
      new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `profile console should render Figma copy as text: ${copy}`,
    );
  }
  assert.match(
    source,
    /const profileConsoleBackground = "\/redesign\/figma\/profile-console-bg\.png";[\s\S]*?<img alt="" className=\{styles\.consoleBackground\} loading="lazy" src=\{profileConsoleBackground\} \/>/,
    "profile console may use the Figma background as media while keeping the UI as DOM",
  );
  assert.match(
    styles,
    /\.identitySection \{\n\s*min-height: 100svh;\n\s*padding-top: clamp\(7\.5rem, 10\.97vw, 9\.875rem\);\n\s*padding-bottom: 0;\n\}/,
    "profile section should keep Figma frame 2235:1168 at 1117px with the dashboard crop ending at the frame bottom",
  );
  assert.match(
    styles,
    /\.identitySection \.sectionHeader \{\n\s*margin-bottom: clamp\(3rem, 3\.6vw, 3\.25rem\);\n\}/,
    "profile dashboard should keep its original internal hero-to-console rhythm",
  );
  assert.match(
    styles,
    /\.identitySection \.sectionHeader h2 \{\n\s*width: min\(48\.1875rem, 100%\);\n\s*margin-inline: auto;\n\s*font-size: clamp\(2\.7rem, 3\.9vw, 3\.5rem\);\n\s*line-height: 1\.4;\n\s*letter-spacing: -0\.02em;\n\s*text-box-trim: trim-both;\n\s*text-box-edge: cap alphabetic;\n\}/,
    "profile title should match Figma Rector Medium 56px and 771px width",
  );
  assert.match(
    styles,
    /\.identitySection \.sectionHeader p \{\n\s*width: min\(28\.75rem, 100%\);\n\s*margin-top: 2\.35rem;\n\s*color: rgba\(28, 42, 29, 0\.7\);\n\s*font-size: clamp\(1\.5rem, 1\.95vw, 1\.75rem\);\n\s*font-weight: 500;\n\s*line-height: 1\.6;\n\s*letter-spacing: -0\.02em;\n\}/,
    "profile subhead should match Figma General Sans Medium 28px with -2% tracking",
  );
  assert.match(
    styles,
    /\.dashboardMock \{\n(?:.*\n)*?\s*width: min\(77\.25rem, calc\(100% - 5\.5rem\)\);\n(?:.*\n)*?\s*border-radius: 24px;\n(?:.*\n)*?\s*aspect-ratio: 1236 \/ 810;/,
    "profile console should render at the exact Figma node 2235:1169 size ratio, 1236 by 810, with 24px radius",
  );
  assert.match(
    styles,
    /\.consoleBackground \{\n\s*position: absolute;\n\s*inset: 0;\n\s*display: block;\n\s*width: 100%;\n\s*height: 100%;\n\s*object-fit: cover;/,
    "profile console background should be a media layer below the DOM UI",
  );
  assert.match(
    styles,
    /\.profileConsoleGrid \{\n\s*position: absolute;\n\s*left: 37\.06%;\n\s*top: 12\.1%;\n\s*z-index: 2;\n\s*display: grid;\n\s*width: 60\.52%;\n\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);\n\s*gap: 1\.5em;/,
    "profile panels should use the Figma 748px two-column DOM grid",
  );
  assert.match(
    styles,
    /\.consoleNav \{\n\s*position: absolute;\n\s*top: 3\.7%;\n\s*right: 2\.427%;\n\s*z-index: 3;[\s\S]*?justify-content: flex-end;[\s\S]*?white-space: nowrap;/,
    "profile console top controls should keep the Figma right padding stable when translated copy changes width",
  );
  assert.match(
    styles,
    /\.profileConsoleGrid \{\n\s*position: absolute;\n\s*left: 37\.06%;\n\s*top: 12\.1%;/,
    "profile panel grid should start at the Figma node 2235:1207 x=458 y=98 coordinate",
  );
  assert.match(
    styles,
    /\.dashboardMock \{\n(?:.*\n)*?\s*container-type: inline-size;\n\s*font-size: 1rem;/,
    "profile console should expose a container query coordinate system for Figma-scaled internals",
  );
  for (const [selector, pattern] of [
    [".consoleBrand", /\.consoleBrand \{\n(?:.*\n)*?\s*font-size: clamp\(0\.75rem, 1\.294cqw, 1rem\);/],
    [".consoleNav", /\.consoleNav \{\n(?:.*\n)*?\s*font-size: clamp\(0\.75rem, 1\.294cqw, 1rem\);/],
    [".profileConsoleGrid", /\.profileConsoleGrid \{\n(?:.*\n)*?\s*font-size: clamp\(0\.75rem, 1\.294cqw, 1rem\);/],
  ]) {
    assert.match(
      styles,
      pattern,
      `${selector} should use the Figma 16px design unit scaled from the 1236px dashboard width`,
    );
  }
  assert.doesNotMatch(
    styles,
    /font-size: clamp\(0\.75rem, 1\.111vw, 1rem\);/,
    "profile console internals should not scale from viewport width after the dashboard itself has a fixed Figma coordinate system",
  );
  for (const asset of [
    "/redesign/figma/profile-icon-api-settings.svg",
    "/redesign/figma/profile-icon-public-profile.svg",
    "/redesign/figma/profile-icon-sign-out.svg",
    "/redesign/figma/profile-icon-refresh.svg",
    "/redesign/figma/profile-icon-edit.svg",
    "/redesign/figma/profile-icon-location.svg",
  ]) {
    assert.match(
      source,
      new RegExp(asset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `profile console should use the exact Figma asset from context: ${asset}`,
    );
  }
  assert.doesNotMatch(
    source,
    /<img alt="" className=\{styles\.consolePassiveHover\} src=\{profileConsoleIcons\.(github|x)\} \/>/,
    "profile social icons should stay static like Figma nodes 2235:1279 and 2235:1281, without synthetic hover movement",
  );
  assert.match(
    styles,
    /\.consoleSocials \{\n\s*font-size: 1\.2308em;\n\s*isolation: isolate;\n\}/,
    "profile social icon group should cancel the identityMeta text-size shrink so Figma 24px icons stay 24px in the panel coordinate system",
  );
  assert.match(
    source,
    /<span className=\{styles\.consoleSocials\}>\n\s*<ConsoleSocialGlyph type="github" \/>\n\s*<ConsoleSocialGlyph type="x" \/>\n\s*<\/span>/,
    "profile social icons should use the single SVG lens exported by Figma instead of an extra wrapper glass layer",
  );
  assert.doesNotMatch(
    source,
    /profile-icon-(github|x)-exported\.svg|profileConsoleIcons\.(github|x)/,
    "profile social icons should not use exported full-circle SVGs because they create a double glass layer",
  );
  assert.match(
    source,
    /data-social-icon="github"[\s\S]*?<foreignObject height="45\.2" width="45\.2" x="-10" y="-10">[\s\S]*?backdropFilter: "blur\(5px\)"[\s\S]*?<g data-figma-bg-blur-radius="10">[\s\S]*?fill="#F3EFE7" fillOpacity="0\.3"[\s\S]*?stroke="url\(#profile_github_stroke\)"[\s\S]*?stopColor="#B88F4F" stopOpacity="0\.2"/,
    "profile GitHub social lens should preserve the Figma exported 24px SVG, 30% F3EFE7 fill, gradient stroke, and background blur",
  );
  assert.match(
    source,
    /data-social-icon="x"[\s\S]*?<foreignObject height="45\.2" width="45\.2" x="-10" y="-10">[\s\S]*?backdropFilter: "blur\(5px\)"[\s\S]*?<g data-figma-bg-blur-radius="10">[\s\S]*?fill="#F3EFE7" fillOpacity="0\.3"[\s\S]*?stroke="url\(#profile_x_stroke\)"[\s\S]*?stopColor="#B88F4F" stopOpacity="0\.2"/,
    "profile X social lens should preserve the Figma exported 24px SVG, 30% F3EFE7 fill, gradient stroke, and background blur",
  );
  assert.match(
    styles,
    /\.consoleSocialFrame \{\n\s*position: absolute;\n\s*inset: -2\.5%;\n\s*display: block;\n\}\n\n\.consoleSocialSvg \{\n\s*display: block;\n\s*width: 100%;\n\s*height: 100%;\n\}/,
    "profile social SVG should keep the Figma absolute inset wrapper around the 24px lens",
  );
  assert.match(
    source,
    /function ConsoleButton\(\{\s*children,\s*icon,\s*actionKey,\s*activeAction,\s*onAction,/,
    "profile console buttons should support the icons returned by Figma context and clicked state",
  );
  assert.match(
    styles,
    /\.consoleButton \{\n(?:.*\n)*?\s*gap: 0\.6154em;\n(?:.*\n)*?\s*text-transform: none;/,
    "profile console buttons should keep Figma title case labels instead of inheriting uppercase headers",
  );
  assert.match(
    styles,
    /\.consoleButtonIcon \{\n\s*position: relative;\n\s*z-index: 1;\n\s*display: block;\n\s*width: 0\.9231em;\n\s*height: 0\.9231em;\n\s*flex: 0 0 auto;\n\}/,
    "profile console button icons should match Figma 12px icons inside 13px controls",
  );
  assert.match(
    styles,
    /\.consolePanelHeader > span:first-child \{\n\s*text-transform: uppercase;\n\}/,
    "profile console should only uppercase panel titles, not nested button labels",
  );
  assert.match(
    styles,
    /\.todayPanel \{\n\s*grid-column: 1 \/ -1;\n\s*min-height: 10\.875em;\n\}/,
    "profile today panel should match the Figma 174px card height and push the second row down",
  );
  assert.match(
    styles,
    /\.todayPanel \.consolePanelHeader \{\n\s*min-height: 2em;\n\}/,
    "profile today card header should match the Figma 26px header frame instead of the lower cards' 32px header",
  );
  assert.match(
    styles,
    /\.todayPanel h3 \{\n(?:.*\n)*?\s*min-height: 0\.9286em;/,
    "profile today headline should preserve the Figma 26px heading frame before the footer row",
  );
  assert.match(
    styles,
    /\.todayPanel \.consolePanelFooter \{\n\s*margin-top: 0\.9em;\n\}/,
    "profile today footer row should keep the Figma 16px gap after the heading group",
  );
  assert.match(
    styles,
    /\.identityPanel \{\n\s*height: 28\.125em;\n\s*min-height: 28\.125em;\n\}/,
    "profile identity panel should match the Figma 450px lower-column height",
  );
  assert.match(
    styles,
    /\.consolePanel \{\n\s*--profile-panel-fill: rgba\(236, 233, 230, 0\.5\);\n\s*--glass-light-angle: -45deg;\n\s*--glass-light-opacity: 0\.8;\n\s*--glass-refraction: 80;\n\s*--glass-depth: 31;\n\s*--glass-dispersion: 60;\n\s*--glass-frost: 10px;\n(?:.*\n)*?\s*overflow: visible;\n(?:.*\n)*?\s*border: 0;\n(?:.*\n)*?\s*background: transparent;\n\s*box-shadow: none;/,
    "profile panel root should mirror the Figma outer wrapper so the Glass shadow is not clipped or doubled",
  );
  assert.doesNotMatch(
    styles,
    /radial-gradient\(ellipse 42% 26%|hue-rotate\(4deg\)/,
    "profile glass should not keep the old incorrect hue or radial gloss effects",
  );
  assert.match(
    source,
    /<span aria-hidden="true" className=\{styles\.consolePanelGlass\} \/>\n\s*<div className=\{styles\.consolePanelContent\}>\n\s*\{children\}\n\s*<\/div>\n\s*<span aria-hidden="true" className=\{styles\.consolePanelInset\} \/>\n\s*<span aria-hidden="true" className=\{styles\.consolePanelShadow\} \/>\n\s*<span aria-hidden="true" className=\{styles\.consolePanelStroke\} \/>/,
    "profile panels should split the Figma Glass effect into material, content, inset, shadow, and stroke DOM layers",
  );
  assert.match(
    styles,
    /\.consolePanelContent \{\n\s*position: relative;\n\s*box-sizing: border-box;\n\s*z-index: 3;\n\s*display: flex;\n\s*width: 100%;\n\s*height: 100%;\n\s*min-height: inherit;\n\s*flex-direction: column;\n\s*align-items: flex-start;\n\s*overflow: clip;\n\s*border-radius: inherit;\n\s*padding: 1\.5em;\n\}/,
    "profile panel content should keep the Figma inner overflow-clip padded wrapper",
  );
  assert.match(
    styles,
    /\.consolePanel > \.consolePanelGlass \{\n\s*z-index: 0;\n\s*background: var\(--profile-panel-fill\);\n\s*-webkit-backdrop-filter: blur\(5px\);\n\s*backdrop-filter: blur\(5px\);\n\}/,
    "profile panel material should use the Figma exported 50% ECE9E6 fill and 5px backdrop blur layer",
  );
  assert.match(
    styles,
    /\.consolePanel > \.consolePanelInset \{\n\s*z-index: 1;\n\s*box-shadow:\n\s*inset 0 0 0 1px rgba\(255, 244, 231, 0\.03\),\n\s*inset 0 0 28px rgba\(226, 196, 110, 0\.03\);\n\}/,
    "profile panel inset glow should match the Figma generated overlay layer",
  );
  assert.match(
    styles,
    /\.consolePanel > \.consolePanelShadow \{\n\s*z-index: 1;\n\s*box-shadow: 0 20px 80px rgba\(99, 88, 77, 0\.32\);\n\}/,
    "profile panel drop shadow should match the Figma 20px/80px shadow layer",
  );
  assert.match(
    styles,
    /\.consolePanel > \.consolePanelStroke \{\n\s*z-index: 2;\n\s*padding: 1px;\n\s*background: linear-gradient\(135deg, rgba\(255, 255, 255, 0\.4\) 0%, rgba\(184, 143, 79, 0\.4\) 100%\);\n\s*mask:\n\s*linear-gradient\(#000 0 0\) content-box,\n\s*linear-gradient\(#000 0 0\);\n\s*mask-composite: exclude;\n\s*-webkit-mask:\n\s*linear-gradient\(#000 0 0\) content-box,\n\s*linear-gradient\(#000 0 0\);\n\s*-webkit-mask-composite: xor;\n\}/,
    "profile panel stroke should use the Figma linear border mask instead of a flat CSS border",
  );
  assert.match(
    styles,
    /\.consoleDivider \{\n(?:.*\n)*?\s*background-image: url\("\/redesign\/figma\/profile-line-card\.svg"\);/,
    "profile card dividers should use the Figma exported 312px line asset rather than a hand-written gradient",
  );
  assert.match(
    styles,
    /\.consoleDividerWide \{\n\s*background-image: url\("\/redesign\/figma\/profile-line-wide\.svg"\);\n\}/,
    "profile top panel divider should use the Figma exported 698px line asset",
  );
});

test("identity profile console has interactive widgets, buttons, language switching, and liquid glass states", async () => {
  const source = await readProjectFile("src/app/components/RedesignHomepage.tsx");
  const styles = await readProjectFile("src/app/components/RedesignHomepage.module.css");

  assert.match(
    source,
    /const \[consoleLanguage, setConsoleLanguage\] = useState<"en" \| "zh">\("en"\);/,
    "profile console should keep language in React state",
  );
  assert.match(
    source,
    /const \[selectedConsolePanel, setSelectedConsolePanel\] = useState\("today"\);/,
    "profile widgets should keep a clicked/selected panel state",
  );
  assert.match(
    source,
    /data-console-language=\{consoleLanguage\}/,
    "profile console should expose the active language state to DOM/CSS",
  );
  assert.match(
    source,
    /<button\s+type="button"\s+className=\{styles\.consoleLanguageOption\}/,
    "language switch should be real clickable buttons",
  );
  assert.match(
    source,
    /onClick=\{\(\) => setConsoleLanguage\("zh"\)\}/,
    "Chinese language option should switch the console copy",
  );
  assert.match(
    source,
    /const profileCopy = profileConsoleCopy\[consoleLanguage\];/,
    "profile console copy should actually change when language changes",
  );
  assert.match(
    source,
    /en: \{\n\s*brandKicker: "PERSONAL AGENT CONTROL CONSOLE",[\s\S]*?zh: \{\n\s*brandKicker: "PERSONAL AGENT CONTROL CONSOLE",/,
    "profile console brand kicker should remain English in both language modes",
  );
  assert.match(
    source,
    /<div className=\{styles\.sectionHeader\}>\n\s*<h2>A profile for agents, not for scrolling<\/h2>\n\s*<p>Your profile is not a bio\. It is a reading\.<\/p>\n\s*<\/div>/,
    "language switching should leave the outer profile section headline in the original English copy",
  );
  assert.doesNotMatch(
    source,
    /sectionTitle|sectionSubtitle/,
    "profile console language copy should not include outer section copy",
  );
  assert.match(
    source,
    /function ConsolePanel\(\{\s*id,/,
    "profile cards should be rendered through an interactive widget component",
  );
  assert.match(
    source,
    /data-selected=\{selected\}/,
    "profile widgets should expose selected state for click feedback",
  );
  assert.match(
    source,
    /onClick=\{\(\) => onSelect\(id\)\}/,
    "clicking a profile widget should select it",
  );
  assert.match(
    source,
    /function ConsoleButton\(\{\s*children,\s*icon,\s*actionKey,\s*activeAction,\s*onAction,/,
    "profile buttons should be real interactive controls while keeping the Figma default visual treatment",
  );
  assert.match(
    source,
    /<button\s+type="button"\s+className=\{styles\.consoleButton\}/,
    "profile buttons should render as real button elements",
  );
  assert.match(
    source,
    /onClick=\{\(event\) => \{\n\s*event\.stopPropagation\(\);\n\s*onAction\?\.\(actionKey \?\? children\);\n\s*\}\}/,
    "profile button clicks should preserve event behavior without selecting the parent widget",
  );
  assert.match(
    styles,
    /\.consoleButton \{\n(?:.*\n)*?\s*background: transparent;\n\s*box-shadow: 0 20px 40px rgba\(0, 0, 0, 0\.32\);/,
    "profile console buttons should keep the Figma CTA drop shadow on the button shell",
  );
  assert.match(
    styles,
    /\.consoleButtonFill \{\n\s*z-index: -2;\n\s*background: #f3efe7;\n\s*transition: background 180ms ease;\n\}/,
    "profile console buttons should render the Figma CTA fill as a separate material layer",
  );
  assert.match(
    styles,
    /\.consoleButtonInset \{\n\s*z-index: -1;\n\s*box-shadow:\n\s*inset 0 0 0 0 rgba\(255, 244, 231, 0\.03\),\n\s*inset 0 0 28px rgba\(226, 196, 110, 0\.03\);\n\}/,
    "profile console buttons should render Figma CTA inset glow as an overlay layer",
  );
  assert.match(
    styles,
    /\.consoleNav \.consoleButton \{\n\s*box-shadow: none;\n\}\n\n\.consoleNav \.consoleButtonInset \{\n\s*display: none;\n\}/,
    "top nav CTAs should keep the flat Figma fill instead of inheriting the panel button shadow",
  );
  assert.match(
    styles,
    /\.consoleButtonGroup,\n\.consoleSocials \{\n\s*display: inline-flex;\n\s*margin-left: auto;[\s\S]*?justify-content: flex-end;[\s\S]*?flex: 0 0 auto;\n\}\n\n\.consolePanelFooter \.consoleButton \{\n\s*margin-left: auto;\n\s*flex: 0 0 auto;\n\}/,
    "profile button groups should stay pinned to the right edge when translated labels change width",
  );
  assert.match(
    styles,
    /\.consolePanel > \.consolePanelGlass \{\n\s*z-index: 0;\n\s*background: var\(--profile-panel-fill\);\n\s*-webkit-backdrop-filter: blur\(5px\);\n\s*backdrop-filter: blur\(5px\);\n\}/,
    "profile panels should use the Figma generated Glass material layer instead of a root-level synthetic filter",
  );
  assert.match(
    styles,
    /\.consolePanelHeader \.consoleButton \{\n\s*font-size: 1em;\n\}/,
    "profile header buttons should not inherit a second 13px shrink from the header and should stay at Figma's 32px height",
  );
  assert.match(
    styles,
    /\.identityTitleRow \{\n\s*min-height: 2em;\n\s*margin-bottom: 0\.75em;\n\}/,
    "identity title row should preserve Figma's 32px row and 12px gap before the summary",
  );
  assert.match(
    styles,
    /\.consoleTags \{\n\s*display: flex;\n\s*flex-wrap: wrap;\n\s*gap: 0\.25em;\n\s*margin-top: 0\.75em;\n\s*width: max-content;\n\s*max-width: 100%;\n\}/,
    "identity badges should keep Figma's 4px auto-layout gap and hug-content width",
  );
  assert.match(
    source,
    /<span className=\{styles\.consoleTag\} key=\{tag\}>\n\s*<span aria-hidden="true" className=\{styles\.consoleTagEdge\} \/>\n\s*<span>\{tag\}<\/span>\n\s*<\/span>/,
    "identity badges should use an explicit CSS module class and keep text above the glass overlay layers",
  );
  assert.doesNotMatch(
    source,
    /<span className=\{styles\.consolePassiveHover\} key=\{tag\}>/,
    "identity badges should stay static like Figma node 2235:1260, without synthetic hover movement",
  );
  assert.match(
    styles,
    /\.consoleTag \{\n\s*--profile-badge-fill: rgba\(243, 239, 231, 0\.3\);\n\s*--profile-badge-ink: #1c2a1d;\n\s*--glass-light-angle: -45deg;\n\s*--glass-light-opacity: 0\.8;\n\s*--glass-refraction: 80;\n\s*--glass-depth: 20;\n\s*--glass-dispersion: 50;\n\s*--glass-frost: 5px;\n(?:.*\n)*?\s*min-height: 2\.6em;\n(?:.*\n)*?\s*background: var\(--profile-badge-fill\);\n(?:.*\n)*?\s*font-size: 0\.625em;\n(?:.*\n)*?\s*line-height: 1\.3333;\n\s*letter-spacing: 0;\n\s*padding: 0\.6em 1\.2em;\n\s*-webkit-backdrop-filter: blur\(var\(--glass-frost\)\);\n\s*backdrop-filter: blur\(var\(--glass-frost\)\);/,
    "identity badges should match Figma node 2235:1260 fill, typography, padding, and Glass params",
  );
  assert.match(
    styles,
    /\.consoleTagEdge \{\n\s*position: absolute;\n\s*inset: 0;\n\s*z-index: 1;\n\s*border: 0\.5px solid rgba\(255, 255, 255, 0\.6\);\n\s*border-radius: inherit;\n\s*pointer-events: none;\n\}/,
    "identity badges should use the Figma exported 0.5px white edge layer",
  );
  assert.match(
    styles,
    /\.consoleTag > span:not\(\.consoleTagEdge\) \{\n\s*position: relative;\n\s*z-index: 2;\n\}/,
    "identity badge labels should sit above the light and refraction overlays",
  );
  assert.doesNotMatch(styles, /\.consoleTag::before,\n\.consoleTag::after/, "identity badges should use the exported edge element rather than synthetic pseudo glass");
  assert.doesNotMatch(
    styles,
    /profile-badge-gloss|profile-badge-edge|profile-badge-warm-edge/,
    "identity badges should not keep the old named gloss variables",
  );
  assert.match(
    styles,
    /\.consoleField \{\n\s*display: grid;\n\s*width: 100%;\n\s*gap: 0\.75em;\n\s*margin-top: 0\.75em;\n\}/,
    "identity text fields should keep the Figma 12px gap between labels and copy",
  );
  assert.match(
    styles,
    /\.consolePanel\[data-selected="true"\] \{\n\s*box-shadow: none;\n\}/,
    "selected profile panels should not add a second shadow beyond the Figma glass layer",
  );
  assert.match(
    styles,
    /\.consoleLanguageOption\[data-active="true"\] \{\n\s*background: #f3efe7;\n\s*color: var\(--ink\);\n\s*font-weight: 500;\n\}/,
    "language active state should match the Figma EN pill without extra shadows or motion",
  );
  for (const selector of [
    ".consolePanel:hover",
    ".consoleButton:active",
    ".consoleButton[data-active=\"true\"]",
    ".consoleLanguageOption:hover",
    ".consolePassiveHover:hover",
  ]) {
    assert.doesNotMatch(
      styles,
      new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `${selector} should not add synthetic visual effects absent from the Figma default state`,
    );
  }
  assert.match(
    styles,
    /\.consolePanel \.identitySummary,\n\.consolePanel \.consoleField p,\n\.todayPanel \.consolePanelFooter p,\n\.profileSideStack \.consolePanel p \{\n\s*font-family: var\(--font-sans\), ui-sans-serif, system-ui, sans-serif;\n\}/,
    "profile body copy should follow Figma General Sans Medium rather than Rector",
  );
});

test("reasons feed keeps the Figma compact and expanded card proportions", async () => {
  const source = await readProjectFile("src/app/components/RedesignHomepage.tsx");
  const styles = await readProjectFile("src/app/components/RedesignHomepage.module.css");

  assert.match(
    styles,
    /\.reasonsSection \{\n\s*position: relative;\n\s*min-height: max\(100svh, 69\.8125rem\);\n\s*margin-top: clamp\(2rem, 4vw, 3rem\);/,
    "reasons section should create an external gap after the profile page without moving its internal layout",
  );
  assert.match(
    styles,
    /\.reasonsBackground \{\n\s*filter: none;\n\s*object-position: center;\n\}/,
    "reasons background should not add synthetic saturation or contrast and should keep the same centered alignment as the hero image fill",
  );
  assert.match(
    styles,
    /\.reasonsVeil \{\n\s*display: none;\n\}/,
    "reasons scene should not add a synthetic veil that is absent from the Figma frame",
  );
  assert.equal(
    await fileExists("public/redesign/figma/meadow-foreground.png"),
    false,
    "the removed meadow foreground overlay asset should not remain in the project",
  );
  assert.doesNotMatch(
    source,
    /reasonsForeground|meadow-foreground\.png/,
    "reasons scene should not render the removed meadow foreground overlay",
  );
  assert.doesNotMatch(
    styles,
    /reasonsForeground|--reasons-foreground/,
    "reasons foreground positioning variables should be removed with the overlay",
  );
  assert.match(
    styles,
    /\.reasonsHeader \{\n\s*position: absolute;\n\s*top: 10rem;\n(?:.*\n)*?\s*width: min\(60\.25rem, calc\(100% - 3rem\)\);/,
    "reasons heading should keep its original internal coordinate while the whole section gains external spacing",
  );
  assert.match(
    styles,
    /\.reasonsHeader h2 \{\n\s*margin: 0;\n\s*color: #fff9e9;\n\s*font-size: clamp\(2\.7rem, 3\.9vw, 3\.5rem\);\n\s*line-height: 1\.4;\n\s*letter-spacing: -0\.02em;\n\s*text-box-trim: trim-both;\n\s*text-box-edge: cap alphabetic;\n\}/,
    "reasons heading should use the Figma Rector 56px rhythm",
  );
  assert.match(
    styles,
    /\.reasonsHeader p \{\n\s*width: min\(56\.1875rem, 100%\);\n\s*margin: 2\.5rem auto 0;\n\s*color: #fff;\n\s*font-family: var\(--font-sans\), ui-sans-serif, system-ui, sans-serif;\n\s*font-size: clamp\(1\.25rem, 1\.67vw, 1\.5rem\);\n\s*font-weight: 500;\n\s*line-height: 1\.2;\n\s*letter-spacing: -0\.02em;\n\}/,
    "reasons subtitle should match Figma General Sans Medium 24px and 899px width",
  );
  assert.match(
    styles,
    /\.feedStack \{\n(?:.*\n)*?\s*top: 24\.875rem;\n(?:.*\n)*?\s*width: min\(50\.3125rem, calc\(100% - 3rem\)\);\n\s*gap: 1\.25rem;/,
    "reasons feed stack should keep its original internal rhythm while the whole section moves away from the profile page",
  );
  assert.match(
    styles,
    /\.reasonCard \{\n\s*display: flex;\n(?:.*\n)*?\s*min-height: 7\.875rem;\n(?:.*\n)*?\s*border: 0;\n\s*border-radius: 24px;\n\s*background: rgba\(28, 42, 29, 0\.4\);\n(?:.*\n)*?\s*padding: 1\.25rem 2\.5rem;\n\s*box-shadow: none;\n(?:.*\n)*?\s*backdrop-filter: blur\(10px\);/,
    "compact reason cards should match Figma's 126px card, 40/20 padding, no stroke/shadow, and GLASS 10 effect",
  );
  assert.match(
    cssRule(styles, ".reasonCard"),
    /transition:\n\s*min-height 420ms cubic-bezier\(0\.22, 1, 0\.36, 1\),\n\s*height 420ms cubic-bezier\(0\.22, 1, 0\.36, 1\),\n\s*padding 420ms cubic-bezier\(0\.22, 1, 0\.36, 1\);/,
    "reason cards should animate between the compact and expanded Figma states instead of snapping open",
  );
  assert.doesNotMatch(
    styles,
    /\.reasonCard:hover/,
    "reason cards should not add a hover state absent from Figma nodes 2235:525 and 2235:677",
  );
  assert.match(
    styles,
    /\.reasonText p \{\n\s*margin: 0;\n\s*color: #fff;\n\s*font-family: var\(--font-display\);\n\s*font-size: clamp\(1\.1rem, 1\.39vw, 1\.25rem\);\n\s*font-weight: 500;\n\s*line-height: 1\.6;\n\s*letter-spacing: -0\.02em;\n\s*text-align: left;\n\s*white-space: nowrap;\n\}/,
    "compact reason quotes should match Figma Rector Medium 20px",
  );
  assert.match(
    styles,
    /\.reasonCardExpanded \{\n(?:.*\n)*?\s*height: 15\.9375rem;\n\s*min-height: 15\.9375rem;\n\s*background: rgba\(28, 42, 29, 0\.4\);/,
    "expanded reason cards should keep the Figma 255px height and the same translucent forest fill",
  );
  assert.match(
    styles,
    /\.reasonCardExpanded \.reasonPerson \{\n\s*width: 11\.8125rem;\n\s*height: 14\.695rem;\n\s*margin-block: -0\.62875rem;\n\s*overflow: visible;\n\}/,
    "expanded reason portraits should use the Figma 189 by 235.12 frame clipped by the 215px inner row",
  );
  assert.match(
    styles,
    /\.reasonPerson \{\n\s*position: relative;\n\s*display: block;\n\s*flex: 0 0 auto;\n\s*justify-self: center;\n\s*width: 5\.375rem;\n\s*height: 5\.375rem;\n\s*overflow: hidden;/,
    "compact reason tokens should keep the Figma 86 by 86 clipping frame",
  );
  assert.match(
    styles,
    /\.reasonCardExpanded \.reasonText \{\n\s*width: 21\.6875rem;\n\s*height: 13\.4375rem;\n\}/,
    "expanded reason copy column should match the Figma 347 by 215 text frame",
  );
  assert.match(
    styles,
    /\.reasonCardExpanded \.reasonText p \{\n\s*width: 21\.6875rem;\n\s*max-width: 21\.6875rem;\n\s*margin: 0 auto;\n\s*font-size: clamp\(1\.1rem, 1\.39vw, 1\.25rem\);\n\s*line-height: 1\.6;\n\s*text-align: center;\n\s*white-space: normal;\n\}/,
    "expanded reason copy should match the Figma centered 347px text column and 20px rhythm",
  );
  assert.match(
    styles,
    /\.reasonText div \{\n\s*display: flex;\n\s*flex-wrap: wrap;\n\s*justify-content: center;\n\s*gap: 1\.25rem;\n\s*margin-top: 1rem;\n\s*transition:\n\s*gap 420ms cubic-bezier\(0\.22, 1, 0\.36, 1\),\n\s*transform 420ms cubic-bezier\(0\.22, 1, 0\.36, 1\);\n\}/,
    "reason tag rows should match the Figma 20px horizontal spacing and 16px compact vertical rhythm",
  );
  assert.match(
    styles,
    /\.reasonText span \{\n(?:.*\n)*?\s*min-height: 2\.375rem;\n(?:.*\n)*?\s*border: 0;\n\s*border-radius: 24px;\n\s*background: rgba\(255, 255, 255, 0\.1\);\n\s*padding: 0\.375rem 0\.625rem;\n(?:.*\n)*?\s*font-family: var\(--font-display\);\n\s*font-size: 1rem;\n\s*font-weight: 500;\n\s*line-height: 1\.6;\n\s*letter-spacing: -0\.02em;\n(?:.*\n)*?\s*backdrop-filter: blur\(10px\);/,
    "reason tags should match Figma Rector Medium 16px, 38px pill height, and GLASS 10 effect",
  );
  assert.match(
    source,
    /<span className=\{styles\.reasonPerson\} data-reason-person data-reason-slug=\{slug\} data-reason-variant=\{variant\}>[\s\S]*?data-reason-motion-node="token"[\s\S]*?src=\{assets\.token\}[\s\S]*?data-reason-motion-node="portrait"[\s\S]*?src=\{assets\.portrait\}/,
    "reason people should keep token and portrait in one motion graph wrapper so state changes can interpolate",
  );
  assert.match(
    source,
    /<span data-reason-badge key=\{tag\}>\{tag\}<\/span>/,
    "reason badges should be marked as graph nodes for badge/token motion continuity",
  );
  assert.match(
    styles,
    /\.reasonPerson\[data-reason-variant="token"\] \.reasonPersonToken \{\n\s*opacity: 1;\n\s*filter: none;\n\s*transform: scale\(1\);\n\}[\s\S]*?\.reasonPerson\[data-reason-variant="portrait"\] \.reasonPersonPortrait \{\n\s*opacity: 1;\n\s*filter: none;\n\s*transform: scale\(1\);\n\}/,
    "reason token and portrait layers should cross-fade and scale through a shared graph instead of swapping images",
  );
  assert.doesNotMatch(
    cssRule(styles, ".reasonPersonLayer img"),
    /filter:/,
    "reason portraits and tokens should not add a synthetic drop-shadow absent from Figma nodes 2235:527, 2235:572, 2235:679, and 2235:740",
  );
  assert.match(
    source,
    /tags: \["Speed gap", "Friction", "Theory\/practice"\]/,
    "shipping reason badges should use slightly shorter matching labels",
  );
  assert.match(
    source,
    /expanded:\n\s*"You theorize, she ships\. You're still explaining why; she's already building the first usable version\. Talk before momentum splits into two separate paths\.",/,
    "expanded shipping reason can be slightly longer once the first-row badges are shorter",
  );
  assert.match(
    source,
    /expanded:\n\s*"You're both stuck on the same wall, from different sides\. You're reading the pushback; he found the crack from the product side\. Talk before you build around it\.",/,
    "expanded wall reason should stay concise enough to keep the fixed badges inside the card",
  );
  assert.match(
    source,
    /tags: \["Parallel struggle", "Cross-section", "Same wall"\]/,
    "wall reason badges should keep their compact-state matching labels",
  );
  assert.match(
    source,
    /expanded:\n\s*"She just made the decision you're two weeks away from\. You're still weighing risks; she chose, shipped, and learned what broke\.",/,
    "expanded decision reason should stay concise enough to keep the fixed badges inside the card",
  );
  assert.match(
    source,
    /tags: \["Fresh data", "Decision window", "Just-in-time"\]/,
    "decision reason badges should keep their compact-state matching labels",
  );
  assert.match(
    source,
    /expandedRight: "mira"/,
    "expanded shipping reason should use the Figma node 2235:742 mira portrait on the right side",
  );
  assert.match(
    source,
    /const rightSlug = expanded && "expandedRight" in reason \? reason\.expandedRight : reason\.right;/,
    "ReasonsFeed should switch only the expanded-state right portrait when Figma uses a different character",
  );
  for (const quote of [
    "“You theorize, she ships. Talk before you both forget why.”",
    "“You're both stuck on the same wall, from different sides.”",
    "“She just made the decision you're 2 weeks away from.”",
  ]) {
    assert.match(
      source,
      new RegExp(quote.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      "compact reason quotes should preserve the Figma curly quote punctuation",
    );
  }
  assert.doesNotMatch(
    source,
    /expandedTags|visibleTags|reason\.expandedTags/,
    "ReasonsFeed should keep every row's badges fixed and change only the expanded sentence",
  );
  assert.match(
    source,
    /reason\.tags\.map\(\(tag\) =>/,
    "ReasonsFeed should render the fixed matching labels directly from reason.tags",
  );
});

test("people and host cards keep the Figma max bounds, responsive scale, and independent hover", async () => {
  const source = await readProjectFile("src/app/components/RedesignHomepage.tsx");
  const styles = await readProjectFile("src/app/components/RedesignHomepage.module.css");

  assert.match(
    styles,
    /\.peopleHosts \{\n(?:.*\n)*?\s*padding: clamp\(7\.25rem, 8\.25vw, 7\.4375rem\) clamp\(1\.25rem, 5vw, 7rem\);/,
    "people/host heading should start at the Figma y=119 frame position",
  );
  assert.match(
    styles,
    /\.peopleHostsContent \{\n\s*position: relative;\n\s*z-index: 2;\n\}[\s\S]*?\.peopleHosts\.doorFullWorld \.peopleHostsContent \{\n\s*opacity: 0;\n\s*will-change: opacity;\n\}[\s\S]*?\.peopleHosts h2 \{\n\s*position: relative;\n\s*margin: 0;\n\s*color: #f3efe7;\n\s*font-size: clamp\(2\.7rem, 3\.9vw, 3\.5rem\);\n\s*line-height: 1\.4;\n\s*letter-spacing: -0\.02em;\n\s*text-box-trim: trim-both;\n\s*text-box-edge: cap alphabetic;\n\}/,
    "people/host heading should use the exact #f3efe7 Rector Medium 56px styling from Figma node 2235:1064",
  );
  assert.match(
    styles,
    /\.peopleHosts \{\n(?:.*\n)*?\s*--role-card-width: min\(26rem, 28\.9vw, 37\.25svh\);\n\s*--role-card-gap: clamp\(4rem, min\(13\.89vw, 17\.9svh\), 12\.5rem\);\n\s*--role-card-label-gap: clamp\(1\.8rem, min\(3\.58svh, 2\.78vw\), 2\.5rem\);\n\s*--role-card-label-size: clamp\(2\.1rem, min\(3\.35vw, 4\.3svh\), 3rem\);/,
    "role phone cards should use the Figma 416x642 maximum while shrinking against viewport width and height",
  );
  assert.match(
    styles,
    /\.roleCards \{\n(?:.*\n)*?\s*width: max-content;\n\s*max-width: 100%;\n\s*grid-template-columns: repeat\(2, minmax\(0, var\(--role-card-width\)\)\);\n\s*justify-content: center;\n\s*gap: var\(--role-card-gap\);/,
    "role phone group should keep separate card columns and shrink the 200px Figma gap responsively",
  );
  assert.match(
    styles,
    /\.roleCards \{\n(?:.*\n)*?\s*gap: var\(--role-card-gap\);\n\s*margin-inline: auto;\n\s*margin-top: clamp\(4rem, min\(8\.25vw, 10\.65svh\), 7\.4375rem\);/,
    "role phone group should stay centered while keeping the Figma y=277 spacing as the maximum",
  );
  assert.match(
    styles,
    /\.roleVisual \{\n(?:.*\n)*?\s*box-sizing: border-box;\n\s*width: var\(--role-card-width\);\n\s*aspect-ratio: 416 \/ 642;/,
    "role phone frames should preserve the Figma 416px by 642px ratio without exceeding that maximum",
  );
  assert.match(
    styles,
    /\.peopleHostsBg \{\n(?:.*\n)*?\s*filter: blur\(4px\);/,
    "people/host background should use the Figma LAYER_BLUR radius 4 effect from nodes 2235:1023 and 2235:1094",
  );
  assert.match(
    cssRule(styles, ".reasonsBackground,\n.peopleHostsBg"),
    /pointer-events: none;/,
    "people/host background image should not block the independent role-card hover targets",
  );
  assert.match(
    styles,
    /\.peopleHosts::after \{\n(?:.*\n)*?\s*inset: 20px;\n(?:.*\n)*?\s*border-radius: 16px;\n\s*background: rgba\(0, 0, 0, 0\.3\);\n\s*backdrop-filter: none;[\s\S]*?\.peopleHosts \.peopleHostsBg \{\n\s*inset: 20px;\n\s*width: calc\(100% - 40px\);\n\s*height: calc\(100% - 40px\);\n\s*border-radius: 16px;\n\}/,
    "people/host scene should keep the Figma Hero 90 background inset: x=20 y=20 width=1400 height=1077 radius=16 inside the 1440x1117 frame",
  );
  assert.match(
    styles,
    /\.roleVisual \{\n(?:.*\n)*?\s*box-shadow: none;/,
    "role phone cards should not add a synthetic shadow absent from the Figma frames",
  );
  assert.match(
    styles,
    /\.roleCard \{\n(?:.*\n)*?\s*gap: var\(--role-card-label-gap\);\n\s*min-width: 0;/,
    "role labels should keep the Figma 40px gap as a maximum and shrink with the cards",
  );
  assert.match(
    styles,
    /\.roleOverlay \{\n(?:.*\n)*?\s*inset: 0;\n(?:.*\n)*?\s*padding: clamp\(1\.55rem, 2\.78vw, 2\.5rem\) clamp\(1\.35rem, 2\.5vw, 2\.25rem\) clamp\(1rem, 1\.67vw, 1\.5rem\);\n(?:.*\n)*?\s*opacity: 0;\n\s*pointer-events: none;/,
    "role overlays should be hidden in the frame 9 rest state and align to the inner 376px image",
  );
  assert.doesNotMatch(
    cssRule(styles, ".roleOverlay"),
    /transition:/,
    "role overlays should not add a synthetic opacity transition absent from Figma nodes 2235:1098 and 2235:1108",
  );
  assert.match(
    styles,
    /\.roleOverlay \{\n(?:.*\n)*?\s*background: linear-gradient\(180deg, #1e1e1e 0%, rgba\(30, 30, 30, 0\) 42%\);/,
    "role hover overlays should use the exact Figma top gradient from node 2235:1064",
  );
  assert.match(
    styles,
    /\.roleVisual:hover \.roleOverlay,\n\.roleVisual:focus-within \.roleOverlay \{\n\s*opacity: 1;\n\s*pointer-events: auto;\n\}/,
    "role overlays should reveal only for the hovered or focused individual card",
  );
  assert.doesNotMatch(
    styles,
    /\.roleCards:hover \.roleOverlay/,
    "role card hover should not reveal both overlays from the parent grid",
  );
  assert.match(
    styles,
    /\.roleOverlay p \{\n\s*width: min\(19rem, 100%\);\n\s*margin: 0;\n\s*color: #fff;\n\s*font-family: var\(--font-display\);\n\s*font-size: clamp\(1\.35rem, 1\.67vw, 1\.5rem\);\n\s*font-weight: 500;\n\s*line-height: 1\.7;\n\s*letter-spacing: -0\.02em;\n\s*white-space: pre-line;\n\s*text-align: left;\n\}/,
    "role card copy should use the Figma white Rector Medium 24px text scale and line rhythm",
  );
  assert.match(
    styles,
    /\.roleOverlay a \{\n\s*position: absolute;\n\s*right: clamp\(1rem, 1\.39vw, 1\.25rem\);\n\s*bottom: clamp\(1rem, 1\.67vw, 1\.5rem\);\n(?:.*\n)*?\s*min-height: 3rem;\n(?:.*\n)*?\s*background: #f3efe7;\n\s*color: var\(--ink\);\n\s*padding: 0 1rem;\n\s*font-size: clamp\(1\.05rem, 1\.39vw, 1\.25rem\);\n\s*font-weight: 500;/,
    "role card CTAs should keep the Figma right/bottom placement while scaling with the card",
  );
  assert.match(
    styles,
    /\.roleCard h3 \{\n(?:.*\n)*?\s*color: #f3efe7;\n\s*font-size: var\(--role-card-label-size\);\n\s*line-height: 1\.4;\n\s*letter-spacing: -0\.02em;\n\s*text-box-trim: trim-both;\n\s*text-box-edge: cap alphabetic;/,
    "role labels should match the Figma #f3efe7 Rector Medium 48px labels as the maximum",
  );
  for (const marker of ["data-role-card", "data-role-visual", "data-role-overlay"]) {
    assert.match(source, new RegExp(marker), `role cards should expose ${marker} for hover verification`);
  }
  assert.match(
    source,
    /\{ autoAlpha: 1, pointerEvents: "auto", duration: 0\.08, ease: "none" \}/,
    "door-revealed people/host screen should restore pointer events so the role cards can hover independently",
  );
  assert.match(
    styles,
    /@media \(max-width: 56rem\) \{[\s\S]*?\.roleVisual \{\n\s*width: min\(24rem, 100%\);\n\s*aspect-ratio: 416 \/ 642;\n\s*height: auto;\n\s*\}/,
    "role phone cards should keep the same ratio on mobile instead of falling back to a fixed height",
  );
  assert.doesNotMatch(
    cssRule(styles, ".roleCard h3"),
    /text-shadow:/,
    "role labels should not add a synthetic text shadow absent from Figma nodes 2235:1059 and 2235:1063",
  );
  assert.match(
    source,
    /Give your agent an identity card\.\\nWalk into a room\. Find the\\npeople you would have missed\./,
    "people card copy should preserve the Figma three-line break rhythm",
  );
  assert.match(
    source,
    /Turn your gathering into an\\nintelligent room where the right\\npeople actually meet\./,
    "host card copy should preserve the Figma three-line break rhythm",
  );
});

test("rooms section keeps the Figma paragraph rhythm and door alignment", async () => {
  const source = await readProjectFile("src/app/components/RedesignHomepage.tsx");
  const styles = await readProjectFile("src/app/components/RedesignHomepage.module.css");

  assert.equal(
    await fileExists("public/redesign/figma/rooms-door-transition-transparent.webm"),
    true,
    "door transition should use the user-provided transparent video encoded for the browser",
  );
  assert.equal(
    await fileExists("public/redesign/figma/rooms-door-transition.mp4"),
    true,
    "door transition should keep an MP4 fallback encoded from the same user-provided video",
  );
  for (const marker of [
    "data-door-video",
    "data-door-camera-rig",
    "data-door-full-world",
    "data-door-full-content",
    "data-door-full-bg",
    "data-door-portal",
    "data-door-portal-bg",
    "styles.doorVideoWrap",
    "styles.doorVideo",
    "styles.doorCameraRig",
    "styles.doorFullWorld",
    "styles.doorPortal",
  ]) {
    assert.match(source, new RegExp(marker), `door transition should expose ${marker}`);
  }
  assert.doesNotMatch(
    source,
    /data-door-frame|data-door-leaf-left|data-door-leaf-right|data-door-portal-preview|rooms-door-frame\.png|rooms-door-left-leaf\.png|rooms-door-right-leaf\.png|rooms-door-leaves\.png/,
    "door animation should be replaced by the video, not the generated frame/leaf layers",
  );
  assert.doesNotMatch(
    source,
    /DoorRoomPreview|data-door-room-preview|doorPreviewBg|doorRoomPreview/,
    "Door handoff should not use a separate preview image layer; the sixth-screen background image should be the only door-behind visual",
  );
  assert.doesNotMatch(
    source,
    /<PeopleHostCards \/>|function PeopleHostCards|data-scene="people-hosts"/,
    "The sixth screen should no longer exist as a separate below-the-door section; it should be entered through the door handoff",
  );
  assert.match(
    source,
    /const doorVideo = root\.querySelector<HTMLVideoElement>\("\[data-door-video\]"\);[\s\S]*?let doorVideoFrame: number \| null = null;[\s\S]*?window\.requestAnimationFrame\(renderDoorVideoFrame\);[\s\S]*?trigger: "\[data-scene='door-scroll'\]",[\s\S]*?end: "\+=230%",[\s\S]*?pin: true,[\s\S]*?onUpdate: \(self\) => scrubDoorVideo\(Math\.min\(1, self\.progress \/ 0\.76\)\)/,
    "door transition should pin the fifth screen and scrub the door video while the camera pushes in",
  );
  assert.match(
    source,
    /<img[\s\S]*?className=\{styles\.peopleHostsBg\}[\s\S]*?data-door-full-bg[\s\S]*?src="\/redesign\/figma\/people-hosts-bg\.png"[\s\S]*?\/>/,
    "Door opening should use the sixth-screen hero background image itself as the only door-behind visual",
  );
  assert.match(
    source,
    /getDoorPushScale[\s\S]*?const camera = root\.querySelector<HTMLElement>\("\[data-door-camera-rig\]"\);[\s\S]*?return Math\.max\(2\.8, Math\.max\(window\.innerWidth \/ width, window\.innerHeight \/ height\) \* 1\.34\);[\s\S]*?\.fromTo\(\s*"\[data-door-portal\]",\s*\{ autoAlpha: 0 \},\s*\{ autoAlpha: 1, duration: 0\.12, ease: "none" \},\s*0\.02,[\s\S]*?\.fromTo\(\s*"\[data-door-portal-bg\]",\s*\{ scale: 1\.26 \},\s*\{ scale: 1\.08, duration: 0\.5, ease: "power1\.out" \},\s*0\.02,[\s\S]*?\.to\("\[data-door-camera-rig\]", \{ scale: getDoorPushScale, duration: 0\.86, ease: "power1\.inOut" \}, 0\.04\)[\s\S]*?\.to\(\s*"\[data-door-full-world\]",\s*\{ autoAlpha: 1, pointerEvents: "auto", duration: 0\.08, ease: "none" \},\s*0\.84,[\s\S]*?\.set\("\[data-door-full-content\]", \{ visibility: "visible" \}, 0\.84\)[\s\S]*?\.to\("\[data-door-portal\]", \{ autoAlpha: 0, duration: 0\.08, ease: "none" \}, 0\.84\)[\s\S]*?\.to\("\[data-door-camera-rig\]", \{ autoAlpha: 0,[\s\S]*?\}, 0\.9\)[\s\S]*?\.to\("\[data-door-full-content\]", \{ opacity: 1,[\s\S]*?\}, 0\.96\)/,
    "Door camera should show a clipped in-door portal first, then hand off to the final sixth-screen background before revealing the text/cards",
  );
  assert.match(
    source,
    /<div className=\{styles\.doorPortal\} data-door-portal aria-hidden="true">[\s\S]*?<img[\s\S]*?className=\{styles\.doorPortalBg\}[\s\S]*?data-door-portal-bg[\s\S]*?src="\/redesign\/figma\/people-hosts-bg\.png"[\s\S]*?\/>/,
    "The small sixth-screen image should be clipped inside the door portal instead of appearing as a full-page card",
  );
  assert.match(
    styles,
    /\.doorSection \{\n\s*position: relative;\n\s*box-sizing: border-box;\n\s*height: 100svh;\n\s*min-height: 100svh;\n\s*overflow: hidden;\n\s*isolation: isolate;\n\s*padding-top: clamp\(4\.5rem, 6vw, 6\.25rem\);\n\s*padding-inline: 0;\n\s*padding-bottom: 0;\n\}/,
    "Rooms section should keep Figma frame 2235:964 at 1117px while preserving the y=96 title and y=375 door positions",
  );
  assert.match(
    styles,
    /\.peopleHosts\.doorFullWorld \{\n\s*position: absolute;\n\s*inset: 0;\n\s*z-index: 1;\n\s*width: 100%;\n\s*min-height: 100%;\n\s*opacity: 0;[\s\S]*?will-change: opacity;\n\}[\s\S]*?\.peopleHosts\.doorFullWorld \.peopleHostsBg \{\n\s*inset: 20px;\n\s*width: calc\(100% - 40px\);\n\s*height: calc\(100% - 40px\);\n\s*border-radius: 16px;\n\}[\s\S]*?\.peopleHosts\.doorFullWorld::after \{\n\s*content: none;\n\}[\s\S]*?\.peopleHosts\.doorFullWorld \.peopleHostsBg \{\n\s*opacity: 1;\n\s*transform-origin: 50% 50%;\n\s*will-change: opacity;\n\}/,
    "Final sixth-screen background should stay hidden as a full-world layer until the door handoff",
  );
  assert.match(
    styles,
    /\.doorPortal \{\n\s*position: absolute;\n\s*left: 50%;\n\s*top: 13%;\n\s*z-index: 0;\n\s*width: 56%;\n\s*height: 84%;\n\s*overflow: hidden;\n\s*opacity: 0;[\s\S]*?transform: translateX\(-50%\);[\s\S]*?\}[\s\S]*?\.doorPortalBg \{\n\s*display: block;\n\s*width: 100%;\n\s*height: 100%;\n\s*object-fit: cover;\n\s*object-position: center;\n\s*filter: blur\(4px\);/,
    "Door portal should crop the sixth-screen image inside the video-masked opening before the full-screen handoff",
  );
  assert.match(
    styles,
    /\.doorSection \.sectionHeader \{\n\s*width: min\(74rem, 100%\);\n\s*margin-bottom: -0\.75rem;\n\}/,
    "Rooms header should hand off directly to the door stage after the larger Figma paragraph",
  );
  assert.match(
    source,
    /<span>Rooms<\/span>/,
    "Rooms heading should preserve the Figma mixed 48px/56px title sizing",
  );
  assert.match(
    styles,
    /\.doorSection \.sectionHeader h2 \{\n\s*width: min\(69\.0625rem, 100%\);\n\s*margin: 0 auto;\n\s*font-size: clamp\(2\.35rem, 3\.34vw, 3rem\);\n\s*line-height: 1\.4;\n\s*letter-spacing: -0\.02em;\n\s*text-box-trim: trim-both;\n\s*text-box-edge: cap alphabetic;\n\s*transform: translate\(-0\.59375rem, 0\.625rem\);\n\}/,
    "Rooms title first line should match Figma Rector Medium 48px with the Figma text-box trim and 1105px title width",
  );
  assert.match(
    styles,
    /\.doorSection \.sectionHeader h2 span \{\n\s*font-size: clamp\(2\.7rem, 3\.9vw, 3\.5rem\);\n\}/,
    "Rooms title second line should match Figma Rector Medium 56px",
  );
  assert.match(
    styles,
    /\.doorSection \.sectionHeader p \{\n\s*position: relative;\n\s*left: 0\.25rem;\n\s*width: min\(43\.5rem, 100%\);\n\s*margin-top: 2\.625rem;\n\s*color: rgba\(28, 42, 29, 0\.7\);\n\s*font-family: var\(--font-sans\), ui-sans-serif, system-ui, sans-serif;\n\s*font-size: clamp\(1\.1rem, 1\.39vw, 1\.25rem\);\n\s*font-weight: 500;\n\s*line-height: 1\.8;\n\s*letter-spacing: -0\.02em;\n\}/,
    "Rooms paragraph should match Figma General Sans Medium 20px, 696px width, and 1.8 line-height",
  );
  assert.match(
    styles,
    /\.doorStage \{\n(?:.*\n)*?\s*margin: -0\.4375rem auto 0;/,
    "Door stage should align the 659px door to the Figma y=375 placement at 1440px",
  );
  assert.match(
    styles,
    /\.doorCameraRig \{\n\s*position: absolute;\n\s*left: 50%;\n\s*top: clamp\(1\.5625rem, 2\.92vw, 3\.3125rem\);\n\s*z-index: 1;\n\s*width: clamp\(29\.5rem, 45\.75vw, 41\.1875rem\);\n\s*aspect-ratio: 1;[\s\S]*?transform-origin: 50% 66%;/,
    "Door camera rig should use the Figma door square as the zooming object",
  );
  assert.doesNotMatch(
    styles,
    /doorRoomPreview|doorPreviewBg/,
    "Door transition should not render a second preview background in CSS",
  );
  assert.match(
    styles,
    /\.doorVideoWrap \{\n\s*position: absolute;\n\s*inset: 0;\n\s*z-index: 1;\n\s*overflow: hidden;\n\}/,
    "Door video should fill the zooming camera rig without adding extra generated layers",
  );
  assert.match(
    styles,
    /\.doorVideo \{\n\s*display: block;\n\s*width: 100%;\n\s*height: 100%;\n\s*object-fit: cover;\n\s*background: transparent;\n\}/,
    "Door video should fill the square without adding extra generated layers",
  );
  assert.match(
    source,
    /<source src="\/redesign\/figma\/rooms-door-transition-transparent\.webm" type="video\/webm" \/>\n\s*<source src="\/redesign\/figma\/rooms-door-transition\.mp4" type="video\/mp4" \/>/,
    "Door video source should prefer the transparent encoded transition before the fallback",
  );
  assert.match(
    styles,
    /\.roomSteps \{\n(?:.*\n)*?\s*transform: translateY\(-0\.4375rem\);/,
    "Room steps should compensate the final 7px runtime y-offset against the Figma coordinates",
  );
  assert.match(
    styles,
    /\.roomSteps li:nth-child\(1\) \{\n\s*top: 3\.8%;\n\s*left: 0\.8%;\n\s*width: min\(13\.4375rem, 38vw\);\n\s*--step-float-x: 0\.74rem;\n\s*--step-float-y: -0\.92rem;\n\s*--step-float-delay: -0\.8s;\n\}/,
    "Room step 1 should use the Figma 215px text block width",
  );
  assert.match(
    styles,
    /\.roomSteps li:nth-child\(2\) \{\n\s*top: 35\.5%;\n\s*left: 8\.7%;\n\s*width: min\(12\.5rem, 38vw\);\n\s*--step-float-x: -0\.68rem;\n\s*--step-float-y: 0\.86rem;\n\s*--step-float-delay: -2\.1s;\n\}/,
    "Room step 2 should keep the Figma x=200 y=616 placement rhythm",
  );
  assert.match(
    styles,
    /\.roomSteps li:nth-child\(3\) \{\n\s*top: 64\.4%;\n\s*left: 3\.5%;\n\s*--step-float-x: 0\.62rem;\n\s*--step-float-y: 0\.96rem;\n\s*--step-float-delay: -3\.4s;\n\}/,
    "Room step 3 should join the same staggered step motion system",
  );
  assert.match(
    styles,
    /\.roomSteps li:nth-child\(4\) \{\n\s*top: 19\.4%;\n\s*right: -3\.25%;\n\s*--step-float-x: -0\.82rem;\n\s*--step-float-y: -0\.76rem;\n\s*--step-float-delay: -1\.4s;\n\}/,
    "Room step 4 should keep the Figma x=1172 y=484 placement rhythm",
  );
  assert.match(
    styles,
    /\.roomSteps li:nth-child\(5\) \{\n\s*top: 52\.3%;\n\s*right: 1\.25%;\n\s*--step-float-x: 0\.88rem;\n\s*--step-float-y: 0\.68rem;\n\s*--step-float-delay: -2\.8s;\n\}/,
    "Room step 5 should keep the Figma x=1115 y=753 placement rhythm",
  );
  assert.match(
    styles,
    /\.roomSteps li \{\n\s*position: absolute;\n\s*width: min\(13\.75rem, 38vw\);\n\s*color: var\(--ink\);\n\s*font-family: var\(--font-display\);\n\s*font-size: clamp\(1\.1rem, 1\.39vw, 1\.25rem\);\n\s*font-weight: 500;\n\s*line-height: 1\.2;\n\s*letter-spacing: -0\.02em;\n\s*--step-float-x: 0rem;\n\s*--step-float-y: 0\.72rem;\n\s*--step-float-delay: 0s;\n\s*animation: roomStepFloat 7\.2s ease-in-out infinite;\n\s*animation-delay: var\(--step-float-delay\);\n\s*will-change: transform, opacity;\n\}/,
    "Room step bodies should match Figma Rector Medium 20px while adding second-screen-scale independent motion",
  );
  assert.match(
    styles,
    /\.roomSteps b \{\n\s*display: block;\n\s*margin-bottom: 0\.5rem;\n\s*color: var\(--ink\);\n\s*font-family: var\(--font-display\);\n\s*font-size: 1rem;\n\s*font-weight: 500;\n\s*line-height: 1\.2;\n\s*letter-spacing: -0\.02em;\n\}/,
    "Room step labels should match Figma Rector Medium 16px",
  );
  assert.match(
    styles,
    /\.roomSteps b::before \{\n\s*content: "";\n\s*display: inline-block;\n\s*width: 0\.625rem;\n\s*height: 0\.625rem;\n\s*margin-right: 0\.5rem;[\s\S]*?animation: roomStepDotPulse 3\.8s ease-in-out infinite;\n\s*animation-delay: var\(--step-float-delay\);/,
    "Room step bullets should match the Figma 10px dot and 8px label gap",
  );
  assert.match(
    styles,
    /@keyframes roomStepFloat \{\n\s*0%,\n\s*100% \{\n\s*opacity: 0\.94;\n\s*transform: translate3d\(0, 0, 0\);\n\s*\}\n\s*50% \{\n\s*opacity: 1;\n\s*transform: translate3d\(var\(--step-float-x\), var\(--step-float-y\), 0\);\n\s*\}\n\}/,
    "Room steps should use a gentle floating keyframe instead of remaining static",
  );
  assert.match(
    styles,
    /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\.roomSteps li,\n\s*\.roomSteps b::before \{\n\s*animation: none;\n\s*\}/,
    "Room step motion should respect reduced-motion preferences",
  );
});

test("beyond section keeps the Figma two-line display heading", async () => {
  const source = await readProjectFile("src/app/components/RedesignHomepage.tsx");
  const styles = await readProjectFile("src/app/components/RedesignHomepage.module.css");

  assert.match(
    styles,
    /\.beyond \{\n\s*min-height: 100svh;\n\s*padding-top: clamp\(5rem, 6\.04vw, 5\.4375rem\);\n\s*padding-bottom: clamp\(2\.5rem, 3\.35vw, 3rem\);\n\}/,
    "Beyond section should keep the Figma frame 11 top spacing while tightening the handoff to FAQ",
  );
  assert.match(
    styles,
    /\.beyond \.sectionHeader \{\n\s*width: min\(49\.5rem, 100%\);\n\s*margin-bottom: 3\.6875rem;/,
    "Beyond heading should use the Figma 792px centered text box before the card grid",
  );
  assert.match(
    styles,
    /\.beyond \.sectionHeader h2 \{\n\s*font-size: clamp\(2\.7rem, 3\.9vw, 3\.5rem\);\n\s*line-height: 1\.4;\n\s*letter-spacing: -0\.02em;\n\s*text-box-trim: trim-both;\n\s*text-box-edge: cap alphabetic;\n\s*transform: translateY\(0\.375rem\);\n\}/,
    "Beyond heading should match the Figma Rector 56px rhythm and text-box trim",
  );
  assert.match(
    styles,
    /\.beyond \.sectionHeader p \{\n\s*position: relative;\n\s*left: 0\.5rem;\n\s*width: min\(39\.75rem, 100%\);\n\s*margin-top: 3\.5625rem;\n\s*font-size: clamp\(1\.15rem, 1\.39vw, 1\.25rem\);\n\s*font-weight: 500;\n\s*line-height: 1\.6;\n\s*letter-spacing: -0\.02em;\n\}/,
    "Beyond paragraph should match the Figma General Sans 20px rhythm",
  );
  assert.match(
    source,
    /const verticals = \[[\s\S]*?vertical-communities\.png", label: "Communities"[\s\S]*?vertical-hiring\.png", label: "Hiring"[\s\S]*?vertical-dating\.png", label: "Dating"[\s\S]*?vertical-founder\.png", label: "Founder"[\s\S]*?vertical-collaboration\.png", label: "Collaboration"[\s\S]*?vertical-local-discovery\.png", label: "Local discovery"[\s\S]*?\] as const;/,
    "Beyond should keep the six Figma-exported wedge images and their Figma card labels",
  );
  assert.match(
    source,
    /<div className=\{styles\.verticalGrid\} aria-label="Rooms use case examples">[\s\S]*?<article className=\{styles\.verticalCard\} key=\{vertical\.id\}>[\s\S]*?<h3>\{vertical\.label\}<\/h3>/,
    "Beyond should render the six Figma image cards inside the Rooms wedge section",
  );
  assert.match(
    styles,
    /\.verticalGrid \{\n\s*display: grid;\n\s*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);\n\s*gap: 2\.5rem;\n\s*width: min\(71\.75rem, 100%\);\n\s*margin: 0 auto;\n\}/,
    "Beyond vertical cards should match the Figma 1148px grid with 40px gaps",
  );
  assert.match(
    styles,
    /\.verticalCard \{\n\s*position: relative;\n\s*aspect-ratio: 356 \/ 254;\n\s*overflow: hidden;\n\s*border-radius: clamp\(2\.25rem, 4\.17vw, 3\.75rem\);/,
    "Beyond vertical cards should use the Figma 356x254 card size and 60px radius",
  );
  assert.match(
    styles,
    /\.verticalCard::after \{[\s\S]*?background: linear-gradient\(180deg, rgba\(0, 0, 0, 0\.4\) 0%, rgba\(0, 0, 0, 0\) 100%\);/,
    "Beyond vertical cards should include the Figma 40% black-to-transparent gradient overlay",
  );
  assert.match(
    styles,
    /\.verticalCard h3 \{[\s\S]*?top: 1\.5rem;[\s\S]*?right: 1\.5rem;[\s\S]*?font-size: clamp\(1\.45rem, 2\.22vw, 2rem\);[\s\S]*?line-height: 1\.7;/,
    "Beyond vertical card labels should match Figma Rector 32px labels at x/right=24 y=24",
  );
  assert.doesNotMatch(
    styles,
    /\.faqVerticalEcho/,
    "FAQ echo styles should stay removed so the six images are not repeated after the Rooms wedge",
  );
});

test("FAQ section keeps the Figma Rector heading and General Sans rows", async () => {
  const source = await readProjectFile("src/app/components/RedesignHomepage.tsx");
  const styles = await readProjectFile("src/app/components/RedesignHomepage.module.css");

  assert.match(
    source,
    /\/redesign\/figma\/faq-plus-icon\.svg/,
    "FAQ rows should use the Figma-exported 20px plus icon asset",
  );
  assert.match(
    source,
    /\/redesign\/figma\/faq-expanded-icon\.svg/,
    "FAQ expanded rows should use the Figma-exported 20px expanded icon asset from node 2235:1498",
  );
  assert.doesNotMatch(
    source,
    /faqVerticalEchoes|faqVerticalEcho/,
    "FAQ should start directly after the Rooms wedge section without repeating the six-card continuity reference",
  );
  assert.equal(
    await fileExists("public/redesign/figma/faq-plus-icon.svg"),
    true,
    "FAQ plus icon should be downloaded from the Figma context payload",
  );
  assert.equal(
    await fileExists("public/redesign/figma/faq-expanded-icon.svg"),
    true,
    "FAQ expanded icon should be downloaded from the Figma context payload",
  );
  assert.doesNotMatch(
    source,
    /\{openFaq === index \? "×" : "\+"\}/,
    "FAQ rows should not approximate the Figma icon with text glyphs",
  );
  assert.match(
    styles,
    /\.faqSection \{\n\s*position: relative;\n\s*box-sizing: border-box;\n\s*overflow: visible;\n\s*padding: 0;\n\s*background: var\(--forest\);\n\}/,
    "FAQ section should own the full FAQ-to-CTA flow on a green footer background",
  );
  assert.match(
    source,
    /<div className=\{styles\.faqPanel\}>[\s\S]*?<h2 className=\{styles\.faqTitle\}>FAQ<\/h2>[\s\S]*?<div className=\{styles\.faqClosing\}>/,
    "FAQ title, rows, and closing CTA should remain in one continuous section instead of being split into the footer",
  );
  assert.match(
    styles,
    /\.faqPanel \{\n\s*position: relative;\n\s*box-sizing: border-box;\n\s*overflow: hidden;\n\s*border-radius: 0 0 6\.25rem 6\.25rem;\n\s*background: var\(--paper\);\n\s*padding-top: clamp\(2\.5rem, 3\.35vw, 3rem\);\n\s*padding-right: clamp\(1\.25rem, 4vw, 5\.5rem\);\n\s*padding-bottom: clamp\(4\.75rem, 7vw, 6\.25rem\);\n\s*padding-left: clamp\(1\.25rem, 4vw, 5\.5rem\);\n\}/,
    "FAQ white panel should continue through the CTA and round into the green footer like Figma frame 14",
  );
  assert.match(
    styles,
    /\.faqTitle \{\n\s*width: min\(41\.1875rem, 100%\);\n\s*margin: 0 auto 2\.9375rem;\n\s*font-size: clamp\(2\.7rem, 3\.9vw, 3\.5rem\);\n\s*line-height: 1\.4;\n\s*letter-spacing: -0\.02em;\n\s*text-align: center;\n\s*text-box-trim: trim-both;\n\s*text-box-edge: cap alphabetic;\n\}/,
    "FAQ title should match the Figma Rector Medium 56px heading and text-box trim",
  );
  assert.match(
    styles,
    /\.faqList \{\n\s*display: flex;\n\s*flex-direction: column;\n\s*gap: 1rem;\n\s*width: min\(47\.25rem, 100%\);\n\s*margin: 0 auto;\n\}/,
    "FAQ list should keep one stable width so the icon column does not jump during open and close",
  );
  assert.doesNotMatch(
    styles,
    /\.faqList:has\(\[aria-expanded="true"\]\)/,
    "FAQ expanded state should not change the list width or horizontal position",
  );
  assert.match(
    styles,
    /\.faqItem \{\n\s*border-bottom: 1px solid var\(--line\);\n\s*padding-bottom: 1rem;\n\}/,
    "FAQ rows should keep the Figma 16px gap between each 32px row and divider",
  );
  assert.match(
    styles,
    /\.faqItem button \{\n(?:.*\n)*?\s*min-height: 2rem;\n(?:.*\n)*?\s*font-family: var\(--font-sans\), ui-sans-serif, system-ui, sans-serif;\n\s*font-size: clamp\(1\.15rem, 1\.39vw, 1\.25rem\);\n\s*font-weight: 500;\n\s*line-height: 1\.6;\n\s*letter-spacing: -0\.02em;/,
    "FAQ questions should use the Figma 32px row height and General Sans Medium 20px tracking",
  );
  assert.match(
    styles,
    /\.faqIconSlot \{\n\s*position: relative;\n\s*display: block;\n\s*flex: 0 0 1\.25rem;\n\s*width: 1\.25rem;\n\s*height: 1\.25rem;\n\}/,
    "FAQ icon slot should keep the Figma 20px frame size for both plus and close states",
  );
  assert.match(
    styles,
    /\.faqIcon \{\n\s*position: absolute;\n\s*inset: 0;\n\s*display: block;\n\s*width: 1\.25rem;\n\s*height: 1\.25rem;\n\s*transition: opacity 180ms ease;\n\}/,
    "FAQ plus and close assets should crossfade inside the same fixed slot",
  );
  assert.doesNotMatch(
    styles,
    /\.faqItem button\[aria-expanded="true"\] \.faqIcon \{\n\s*transform:/,
    "FAQ expanded icon should come from the Figma asset instead of rotating the closed icon",
  );
  assert.match(
    source,
    /className=\{`\$\{styles\.faqAnswerShell\} \$\{[\s\S]*?openFaq === index \? styles\.faqAnswerOpen : ""[\s\S]*?\}`\}/,
    "FAQ answers should stay mounted so closing can animate instead of hard-unmounting",
  );
  assert.match(
    styles,
    /\.faqAnswerShell \{\n\s*max-height: 0;\n\s*opacity: 0;\n\s*transform: translateY\(-0\.375rem\);\n\s*overflow: hidden;\n\s*will-change: max-height, opacity, transform;\n\s*transition:\n\s*max-height 520ms cubic-bezier\(0\.33, 0, 0\.2, 1\),\n\s*opacity 260ms ease-out,\n\s*transform 520ms cubic-bezier\(0\.33, 0, 0\.2, 1\);\n\}/,
    "FAQ answer shell should use a smooth height and opacity transition",
  );
  assert.match(
    styles,
    /\.faqAnswerOpen \{\n\s*max-height: 15rem;\n\s*opacity: 1;\n\s*transform: translateY\(0\);\n\}/,
    "FAQ answer open state should expand the same mounted shell",
  );
  assert.match(
    styles,
    /@media \(max-width: 56rem\) \{[\s\S]*?\.faqAnswerOpen \{\n\s*max-height: 36rem;\n\s*\}/,
    "FAQ answer should allow more height when the two-column answer becomes one column on mobile",
  );
  assert.match(
    styles,
    /\.faqAnswer,\n\.faqTwoColumn \{\n\s*padding: 0\.25rem 0 2rem;\n\s*color: var\(--ink\);\n\s*font-family: var\(--font-sans\), ui-sans-serif, system-ui, sans-serif;\n\s*font-size: 1rem;\n\s*line-height: 1\.6;\n\s*letter-spacing: -0\.02em;\n\}/,
    "FAQ expanded answer should use the Figma General Sans 16px answer rhythm",
  );
  assert.match(
    styles,
    /\.faqTwoColumn \{\n\s*display: grid;\n\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);\n\s*gap: 1rem;\n\s*padding-top: 0;\n\}/,
    "FAQ expanded two-column answer should match the Figma 16px column gap",
  );
  assert.match(
    styles,
    /\.faqTwoColumn p \{\n\s*border: 0;\n\s*border-radius: 0;\n\s*background: transparent;\n\s*padding: 0;\n\s*font-weight: 500;\n\}/,
    "FAQ expanded answer body should use the Figma General Sans Medium spans",
  );
  assert.match(
    styles,
    /\.faqTwoColumn b \{\n\s*display: block;\n\s*margin-bottom: 0;\n\s*color: var\(--ink\);\n\s*font-weight: 700;\n\}/,
    "FAQ expanded answer labels should use the Figma General Sans Bold headings",
  );
  assert.match(
    source,
    /q: "How does Antenna work today\?"/,
    "FAQ question copy should match the expanded Figma context",
  );
  assert.doesNotMatch(
    source,
    /finalFrameFaqTail|finalFaqEcho/,
    "FAQ rows should not be duplicated as an isolated footer echo",
  );
});

test("final section keeps the Figma footer typography and brand scale", async () => {
  const source = await readProjectFile("src/app/components/RedesignHomepage.tsx");
  const styles = await readProjectFile("src/app/components/RedesignHomepage.module.css");

  assert.match(
    styles,
    /\.finalSection \{\n\s*position: relative;\n\s*min-height: clamp\(29rem, 31\.25vw, 40rem\);\n\s*background: var\(--forest\);\n\s*color: #f3efe7;\n\}/,
    "final frame should be the taller green footer after the FAQ-owned white panel",
  );
  assert.match(
    styles,
    /\.faqClosing \{\n\s*display: flex;\n\s*flex-direction: column;\n\s*align-items: center;\n\s*margin-top: clamp\(3\.5rem, 5vw, 4\.25rem\);\n\s*text-align: center;\n\}/,
    "FAQ closing CTA should be part of the same white FAQ section, not a separate footer echo",
  );
  assert.match(
    styles,
    /\.faqClosing h2 \{\n\s*margin: 0 0 4\.3125rem;\n\s*font-size: clamp\(2\.7rem, 3\.9vw, 3\.5rem\);\n\s*line-height: 1\.4;\n\s*letter-spacing: -0\.02em;\n\s*text-box-trim: trim-both;\n\s*text-box-edge: cap alphabetic;\n\}/,
    "final CTA heading should match the Figma Rector 56px footer headline and text-box trim",
  );
  assert.match(
    styles,
    /\.faqClosing \.ctaRow \{\n\s*width: 14\.8125rem;\n\s*justify-content: center;\n\}/,
    "final CTA row should match Figma node 2235:1578 at 237px instead of drifting with browser text metrics",
  );
  assert.match(
    styles,
    /\.faqClosing \.primaryButton \{\n\s*width: 7\.3125rem;\n\}/,
    "final primary CTA should match the Figma node 2235:1579 width of 117px",
  );
  assert.match(
    styles,
    /\.faqClosing \.secondaryButton \{\n\s*width: 6\.75rem;\n\}/,
    "final secondary CTA should match the Figma node 2235:1581 width of 108px",
  );
  assert.match(
    styles,
    /\.footerNav \{\n(?:.*\n)*?\s*grid-template-columns: minmax\(0, 1fr\) auto;\n(?:.*\n)*?\s*gap: clamp\(3rem, 5vw, 6rem\);\n(?:.*\n)*?\s*width: min\(121rem, calc\(100% - clamp\(3\.5rem, 5\.5vw, 7rem\)\)\);\n(?:.*\n)*?\s*padding: clamp\(4\.75rem, 4\.15vw, 5\.3125rem\) 0 clamp\(4\.5rem, 6\.8vw, 8\.75rem\);/,
    "footer content should use the wider screenshot grid while preserving responsive side padding",
  );
  assert.match(
    styles,
    /\.footerBrand \{\n\s*position: relative;\n\s*display: block;\n\s*width: min\(72\.5rem, 56\.5vw\);\n\s*aspect-ratio: 625 \/ 108;\n\s*height: auto;\n\s*overflow: hidden;\n\s*margin-top: 0;\n\}/,
    "footer logo lockup should scale to the large screenshot wordmark while preserving the 625px by 108px ratio",
  );
  assert.match(
    styles,
    /\.footerMark \{\n\s*position: absolute;\n\s*left: 0;\n\s*bottom: 0;\n\s*display: block;\n\s*width: 13\.1807%;\n\s*height: 100%;\n\s*aspect-ratio: 20\.8071 \/ 27\.2778;\n\s*max-width: none;\n\}/,
    "footer mark should keep the exact Figma single-symbol aspect ratio inside the responsive lockup",
  );
  assert.match(
    styles,
    /\.footerNav \.footerMark \{\n\s*width: 13\.1807%;\n\s*height: 100%;\n\s*max-width: none;\n\}/,
    "footer mark should override the generic footer image sizing so it cannot be stretched by footer img rules",
  );
  assert.match(
    source,
    /src="\/redesign\/figma\/footer-mark\.svg"/,
    "footer should use the unified Figma mark asset instead of composing stretched SVG fragments",
  );
  assert.doesNotMatch(
    source,
    /footer-mark-(?:lower|upper)\.svg/,
    "footer should not compose the mark from separate stretch-prone upper and lower SVG images",
  );
  assert.match(
    styles,
    /\.footerWordmark \{\n\s*position: absolute;\n\s*right: 0;\n\s*bottom: 0;\n\s*display: block;\n\s*width: 85\.2192%;\n\s*height: 100%;\n\s*aspect-ratio: 532\.62 \/ 108;\n\}/,
    "footer wordmark should preserve the exported 532.62px by 108px ratio instead of stretching",
  );
  assert.match(
    styles,
    /\.footerNav \.footerWordmark \{\n\s*width: 85\.2192%;\n\s*height: 100%;\n\s*max-width: none;\n\}/,
    "footer wordmark should override the generic footer image sizing so the exported Antenna letters render",
  );
  assert.match(
    source,
    /src="\/redesign\/figma\/footer-wordmark\.svg"/,
    "footer should use the wordmark asset exported from the Figma final frame",
  );
  assert.doesNotMatch(
    source,
    /className=\{styles\.footerWordmark\} loading="lazy"/,
    "footer wordmark should render immediately instead of waiting for lazy-load at the bottom of the page",
  );
  assert.match(
    styles,
    /\.footerNav p \{\n\s*max-width: min\(72\.5rem, 56\.5vw\);\n\s*margin: clamp\(1\.75rem, 2\.75vw, 3\.5rem\) 0 0;\n\s*color: rgba\(243, 239, 231, 0\.7\);\n\s*font-family: var\(--font-display\);\n\s*font-size: clamp\(1rem, 1\.42vw, 1\.8125rem\);\n\s*font-weight: 500;\n\s*line-height: 1\.6;\n\s*letter-spacing: -0\.02em;\n\}/,
    "footer description should scale with the large wordmark and keep Rector Medium styling",
  );
  assert.match(
    styles,
    /\.footerNav nav \{\n\s*display: grid;\n\s*grid-template-columns: auto auto auto;\n\s*gap: clamp\(3\.75rem, 6\.8vw, 9rem\);\n\s*align-content: start;\n\s*width: auto;\n\s*min-width: 0;\n\s*margin-top: -1\.125rem;\n\s*color: rgba\(243, 239, 231, 0\.7\);\n\s*font-family: var\(--font-display\);\n\s*font-size: clamp\(1rem, 1\.42vw, 1\.8125rem\);\n\s*font-weight: 500;\n\s*line-height: 1\.6;\n\s*letter-spacing: -0\.02em;\n\}/,
    "footer navigation columns should scale from the right edge instead of staying locked to the old 326px grid",
  );
  assert.match(
    styles,
    /\.footerNav nav div \{\n\s*display: grid;\n\s*align-content: start;\n\s*gap: clamp\(0\.75rem, 1\.18vw, 1\.5rem\);\n\}/,
    "footer navigation row gaps should grow with the enlarged footer typography without grid stretch",
  );
  assert.match(
    styles,
    /\.footerNav nav h3 \{\n\s*margin: 0;\n\s*color: #f3efe7;\n\s*font-family: var\(--font-display\);\n\s*font-size: clamp\(1rem, 1\.42vw, 1\.8125rem\);\n\s*font-weight: 500;\n\s*line-height: 1\.6;\n\s*letter-spacing: -0\.02em;\n\}/,
    "footer navigation headers should use cream Rector Medium text that scales with the enlarged footer",
  );
  assert.match(
    styles,
    /\.footerPrivacy \{\n\s*position: absolute;\n\s*right: clamp\(2\.5rem, 3vw, 3\.75rem\);\n\s*bottom: clamp\(0\.75rem, 1\.05vw, 1\.25rem\);\n\}/,
    "footer privacy link should stay pinned to the lower-right screenshot padding responsively",
  );
  assert.match(
    styles,
    /\.finalSection small \{\n\s*position: absolute;\n\s*left: clamp\(1\.5rem, 1\.6vw, 2rem\);\n\s*bottom: clamp\(0\.75rem, 1\.05vw, 1\.25rem\);\n\s*display: block;\n\s*color: rgba\(243, 239, 231, 0\.7\);\n\s*font-family: var\(--font-display\);\n\s*font-size: clamp\(1rem, 1\.42vw, 1\.8125rem\);\n\s*font-weight: 500;\n\s*line-height: 1\.6;\n\s*letter-spacing: -0\.02em;\n\}/,
    "footer copyright should stay pinned to the lower-left screenshot padding responsively",
  );
  assert.match(source, />AGENTS<\/h3>/, "footer first column heading should match the Figma final frame copy");
  assert.match(source, />COMPANY<\/h3>/, "footer company column heading should match the Figma final frame copy");
  assert.doesNotMatch(source, />Agent<\/h3>/, "footer first column should not drift from the Figma uppercase plural label");
  assert.doesNotMatch(source, />Company<\/h3>/, "footer company column should not drift from the Figma uppercase label");
});

test("redesign homepage preserves exact Figma section copy", async () => {
  const source = await readProjectFile("src/app/components/RedesignHomepage.tsx");

  assert.equal(
    (source.match(/Your profile is not a bio\. It is a reading\./g) ?? []).length,
    1,
    "identity profile subhead should appear once",
  );
  assert.match(
    source,
    /q: "How does Antenna work today\?"/,
    "FAQ question copy should match the Figma reference",
  );
  assert.doesNotMatch(
    source,
    /q: "How does the first use case work\?"/,
    "FAQ should not drift from the Figma wording",
  );
  assert.match(source, /label: "For Hosts"/, "people/hosts card should use the plural Figma label");
  assert.doesNotMatch(source, /label: "For Host"/, "people/hosts card should not drift from Figma copy");
  assert.equal(
    (source.match(/vertical-founder\.png/g) ?? []).length,
    1,
    "Beyond should include the founder wedge image once without repeating the six-card sequence later",
  );
  assert.match(source, />Vision<\/a>/, "footer Company column should include Vision");
  assert.match(source, />Changelog<\/a>/, "footer Company column should include Changelog");
});
