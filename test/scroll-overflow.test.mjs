import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function readProjectFile(path) {
  return readFile(new URL(path, root), "utf8");
}

test("page-level horizontal clipping does not create nested vertical scroll containers", async () => {
  const [globalsCss, layout, page] = await Promise.all([
    readProjectFile("src/app/globals.css"),
    readProjectFile("src/app/layout.tsx"),
    readProjectFile("src/app/page.tsx"),
  ]);

  assert.match(
    globalsCss,
    /html,\s*body\s*{[^}]*overflow-x:\s*clip/s,
    "html/body should use overflow-x: clip so horizontal clipping does not compute overflow-y to auto",
  );

  assert.doesNotMatch(
    layout,
    /<html[\s\S]*?className=\{[^}]*overflow-x-hidden/,
    "the root html element must not use overflow-x-hidden",
  );

  assert.doesNotMatch(
    layout,
    /<body[\s\S]*?className="[^"]*overflow-x-hidden/,
    "the root body element must not use overflow-x-hidden",
  );

  assert.doesNotMatch(
    page,
    /<main\s+className="[^"]*overflow-x-hidden/,
    "the home page main element must not use overflow-x-hidden",
  );
});
