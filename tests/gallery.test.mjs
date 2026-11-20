import test from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { projectDetails } from "../src/data/portfolio.js";
import { getProjectDetails } from "../src/content.js";

test("a ficha aceita projetos sem capturas e conserva a ordem das telas", () => {
  const shots = [{ title: "Hoje" }, { title: "Foco" }];
  assert.deepEqual(getProjectDetails({}, "novo").screenshots, []);
  assert.deepEqual(getProjectDetails({ novo: { screenshots: shots } }, "novo").screenshots, shots);
});

test("cada captura cadastrada tem descrição e arquivos locais disponíveis", async () => {
  for (const [slug, project] of Object.entries(projectDetails)) {
    for (const shot of project.screenshots ?? []) {
      for (const field of ["src", "alt", "title", "caption"]) assert.ok(shot[field]?.trim());
      for (const path of [shot.src, shot.thumbnail, shot.full].filter(Boolean)) {
        assert.ok(path.startsWith(`assets/projects/${slug}/`));
        await access(new URL(`../${path}`, import.meta.url));
      }
    }
  }
});
