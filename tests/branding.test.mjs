import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const rootPath = fileURLToPath(new URL("../", import.meta.url));
const htmlPath = fileURLToPath(new URL("../index.html", import.meta.url));
const cssPath = fileURLToPath(new URL("../src/styles.css", import.meta.url));
const appPath = fileURLToPath(new URL("../src/app.js", import.meta.url));
const manifestPath = fileURLToPath(new URL("../assets/branding/icons/site.webmanifest", import.meta.url));

const readHtml = () => readFileSync(htmlPath, "utf8");
const readCss = () => readFileSync(cssPath, "utf8");

function localAssetReferences(html) {
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  return refs.filter((ref) => !/^(?:[a-z]+:|\/\/|#)/i.test(ref));
}

test("o favicon, os ícones e o manifesto estão declarados no head", () => {
  const html = readHtml();

  assert.match(html, /rel="icon" href="assets\/favicon\.svg" type="image\/svg\+xml"/);
  assert.match(html, /rel="icon" href="assets\/branding\/icons\/favicon\.ico"/);
  assert.match(html, /rel="apple-touch-icon" href="assets\/branding\/icons\/apple-touch-icon\.png"/);
  assert.match(html, /rel="manifest" href="assets\/branding\/icons\/site\.webmanifest"/);
  assert.equal((html.match(/rel="icon"/g) ?? []).length, 2, "o favicon SVG precisa de um único fallback ICO");
});

test("todo caminho local do HTML aponta para um arquivo existente", () => {
  const missing = localAssetReferences(readHtml()).filter((ref) => !existsSync(`${rootPath}${ref.split("?")[0]}`));

  assert.deepEqual(missing, []);
});

test("o cabeçalho usa o logotipo oficial nos dois temas sem perder o nome acessível", () => {
  const html = readHtml();
  const start = html.indexOf('<a class="wordmark"');
  const end = html.indexOf("</a>", start);
  const wordmark = html.slice(start, end);

  assert.doesNotMatch(html, /wordmark-symbol/);
  assert.match(wordmark, /aria-label="Início do portfólio"/);
  assert.match(wordmark, /<span class="wordmark-mark" aria-hidden="true">/);
  assert.match(wordmark, /src="assets\/branding\/svg\/logo-dark\.svg" alt=""/);
  assert.match(wordmark, /src="assets\/branding\/svg\/logo-light\.svg" alt=""/);
  assert.match(wordmark, /<span data-content="profile\.name">Nicolas Ponciano<\/span>/);
});

test("o CSS troca a versão do logotipo pelo tema e pela preferência do sistema", () => {
  const css = readCss();

  assert.match(css, /\.wordmark-logo-light\s*{\s*display:\s*none/);
  assert.match(css, /html\[data-theme="paper"\]\s+\.wordmark-logo-dark\s*{\s*display:\s*none/);
  assert.match(css, /html\[data-theme="paper"\]\s+\.wordmark-logo-light\s*{\s*display:\s*block/);
  assert.match(css, /@media \(prefers-color-scheme: light\)[\s\S]*?html:not\(\[data-theme\]\)\s+\.wordmark-logo-light\s*{\s*display:\s*block/);
});

test("o favicon SVG acompanha o tema ativo no JavaScript", () => {
  const app = readFileSync(appPath, "utf8");
  const start = app.indexOf("function syncThemeControls");
  const end = app.indexOf("function applyTheme", start);
  const sync = app.slice(start, end);

  assert.match(sync, /link\[rel="icon"\]\[type="image\/svg\+xml"\]/);
  assert.match(sync, /assets\/branding\/icons\/favicon-light\.svg/);
  assert.match(sync, /assets\/branding\/icons\/favicon-dark\.svg/);
});

test("o manifesto usa ícones existentes e abre na raiz do site", () => {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const dir = new URL("../assets/branding/icons/", import.meta.url);

  assert.equal(manifest.start_url, "/");
  assert.ok(manifest.icons.length >= 3);
  manifest.icons.forEach((icon) => {
    assert.ok(existsSync(fileURLToPath(new URL(icon.src, dir))), `ícone ausente: ${icon.src}`);
    assert.match(icon.sizes, /^\d+x\d+$/);
  });
  assert.ok(manifest.icons.some((icon) => icon.purpose === "maskable"));
});

test("Open Graph e Twitter Card usam imagem social existente no domínio publicado", () => {
  const html = readHtml();
  const image = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? "";

  assert.match(image, /^https:\/\/nicolasponciano\.github\.io\//);
  assert.match(html, /<meta property="og:image:alt" content="[^"]+"/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"/);
  assert.equal(html.match(/<meta name="twitter:image" content="([^"]+)"/)?.[1], image);

  const assetPath = image.replace("https://nicolasponciano.github.io/", rootPath);
  assert.ok(existsSync(assetPath), `imagem social ausente: ${assetPath}`);
});
