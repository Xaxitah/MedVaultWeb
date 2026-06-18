const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const workspace = path.resolve(root, "..");
const sourceRoot = path.join(
  workspace,
  "MED-Vault-2.0",
  "03-Disciplinas",
  "Semiologia-Medica",
  "Revisao",
  "Resumos",
  "P2"
);
const targetRoot = path.join(
  root,
  "03-disciplinas",
  "semiologia-medica",
  "revisao",
  "resumos",
  "p2"
);
const medTargetRoot = path.join(
  root,
  "med",
  "03-disciplinas",
  "semiologia-medica",
  "revisao",
  "resumos",
  "p2"
);
const imageAssetRoot = path.join(root, "assets", "img", "semiologia-medica", "p2");
const medImageAssetRoot = path.join(root, "med", "assets", "img", "semiologia-medica", "p2");
const imagePublicRoot = "assets/img/semiologia-medica/p2";
const vaultRoot = path.join(workspace, "MED-Vault-2.0");
const imageSearchRoots = [
  path.join(vaultRoot, "07-Biblioteca-Geral", "07-Banco-de-Imagens"),
  path.join(vaultRoot, "07-Biblioteca-Geral", "01-Livros", "LLANIO-Propedeutica-Clinica-Tomo-I", "imagens"),
  path.join(vaultRoot, "03-Disciplinas", "Semiologia-Medica"),
];
const copiedImages = new Map();

const nodeModules = path.join(workspace, "MED-Vault-Website-v2", "node_modules");
process.env.NODE_PATH = nodeModules;
require("module").Module._initPaths();
const { marked } = require("marked");

marked.setOptions({
  gfm: true,
  breaks: false,
  mangle: false,
  headerIds: false,
});

const mappings = [
  ["P2-Tema-00-Anatomia-Fisiologia-Clinica-Torax", "P2-Tema-00-Anatomia-Fisiologia-Clinica-Torax.md", "p2-tema-00-anatomia-fisiologia-clinica-torax", "p2-tema-00-anatomia-fisiologia-clinica-torax.html"],
  ["P2-Tema-01-Parte-1-Inspeccion-Palpacion", "P2-Tema-01-Parte-1-Inspeccion-Palpacion.md", "p2-tema-01-parte-1-inspeccion-palpacion", "p2-tema-01-parte-1-inspeccion-palpacion.html"],
  ["P2-Tema-01-Parte-2-Percusion-Auscultacion", "P2-Tema-01-Parte-2-Percusion-Auscultacion.md", "p2-tema-01-parte-2-percusion-auscultacion", "p2-tema-01-parte-2-percusion-auscultacion.html"],
  ["P2-Tema-02-Sintomas-Respiratorios", "P2-Tema-02-Sintomas-Respiratorios.md", "p2-tema-02-sintomas-respiratorios", "p2-tema-02-sintomas-respiratorios.html"],
  ["P2-Tema-03-Estertores-Ruidos-Adventicios", "P2-Tema-03-Estertores-Ruidos-Adventicios.md", "p2-tema-03-estertores-ruidos-adventicios", "p2-tema-03-estertores-ruidos-adventicios.html"],
  ["P2-Tema-04-Parte-1-Bronquitis-Obstruccion-Bronquial", "P2-Tema-04-Parte-1-Bronquitis-Obstruccion-Bronquial.md", "p2-tema-04-parte-1-bronquitis-obstruccion-bronquial", "p2-tema-04-parte-1-bronquitis-obstruccion-bronquial.html"],
  ["P2-Tema-04-Parte-2-Asma-Bronquiectasia", "P2-Tema-04-Parte-2-Asma-Bronquiectasia.md", "p2-tema-04-parte-2-asma-bronquiectasia", "p2-tema-04-parte-2-asma-bronquiectasia.html"],
  ["P2-Tema-05-Parte-1-Enfisema-EPOC-Atelectasia", "P2-Tema-05-Parte-1-Enfisema-EPOC-Atelectasia.md", "p2-tema-05-parte-1-enfisema-epoc-atelectasia", "p2-tema-05-parte-1-enfisema-epoc-atelectasia.html"],
  ["P2-Tema-05-Parte-2-Neumonia-Bronconeumonia-Condensacion-Tumoral", "P2-Tema-05-Parte-2-Neumonia-Bronconeumonia-Condensacion-Tumoral.md", "p2-tema-05-parte-2-neumonia-bronconeumonia-condensacion-tumoral", "p2-tema-05-parte-2-neumonia-bronconeumonia-condensacion-tumoral.html"],
  ["P2-Tema-06-Parte-1-Derrame-Pleural", "P2-Tema-06-Parte-1-Derrame-Pleural.md", "p2-tema-06-parte-1-derrame-pleural", "p2-tema-06-parte-1-derrame-pleural.html"],
  ["P2-Tema-06-Parte-2-Neumotorax-Gap-Critico", "P2-Tema-06-Parte-2-Neumotorax-Gap-Critico.md", "p2-tema-06-parte-2-neumotorax-gap-critico", "p2-tema-06-parte-2-neumotorax-gap-critico.html"],
  ["P2-Tema-07-EF-Cardiovascular", "P2-T07-EF-Cardiovascular.md", "p2-tema-07-ef-cardiovascular", "p2-t07-ef-cardiovascular.html"],
];

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function toPosixPath(value) {
  return value.replace(/\\/g, "/");
}

function safeAssetName(value) {
  return path
    .basename(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findFileByName(rootDir, fileName) {
  if (!fs.existsSync(rootDir)) return "";
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isFile() && entry.name.toLowerCase() === fileName.toLowerCase()) {
      return entryPath;
    }
    if (entry.isDirectory()) {
      const found = findFileByName(entryPath, fileName);
      if (found) return found;
    }
  }
  return "";
}

function resolveImageSource(target) {
  const normalizedTarget = target.trim().replace(/\//g, path.sep);
  const directCandidates = [
    path.join(vaultRoot, normalizedTarget),
    path.join(sourceRoot, normalizedTarget),
  ];

  for (const candidate of directCandidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  const fileName = path.basename(normalizedTarget);
  for (const searchRoot of imageSearchRoots) {
    const found = findFileByName(searchRoot, fileName);
    if (found) return found;
  }

  return "";
}

function publicImageFor(target) {
  const normalizedTarget = target.trim();
  if (copiedImages.has(normalizedTarget)) return copiedImages.get(normalizedTarget);

  const source = resolveImageSource(normalizedTarget);
  if (!source) {
    copiedImages.set(normalizedTarget, "");
    return "";
  }

  fs.mkdirSync(imageAssetRoot, { recursive: true });
  fs.mkdirSync(medImageAssetRoot, { recursive: true });

  const assetName = safeAssetName(source);
  const destination = path.join(imageAssetRoot, assetName);
  const medDestination = path.join(medImageAssetRoot, assetName);
  fs.copyFileSync(source, destination);
  fs.copyFileSync(source, medDestination);

  const publicPath = `${imagePublicRoot}/${toPosixPath(assetName)}`;
  copiedImages.set(normalizedTarget, publicPath);
  return publicPath;
}

function splitFrontmatter(markdown) {
  const normalized = markdown.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { frontmatter: "", body: normalized };
  }
  return {
    frontmatter: match[1].trim(),
    body: normalized.slice(match[0].length),
  };
}

function renderCallouts(markdown) {
  const lines = markdown.split("\n");
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^>\s*\[!(\w+)\]\s*(.*)$/);
    if (!match) {
      out.push(lines[i]);
      continue;
    }

    const type = match[1].toLowerCase();
    const title = match[2].trim() || type;
    const content = [];
    i += 1;
    while (i < lines.length) {
      if (lines[i].trim() === "") {
        content.push("");
        i += 1;
        continue;
      }
      if (!lines[i].startsWith(">")) break;
      if (/^>\s*\[!(\w+)\]/.test(lines[i])) break;
      content.push(lines[i].replace(/^>\s?/, ""));
      i += 1;
    }
    i -= 1;

    const rendered = marked.parse(preprocessMarkdown(content.join("\n"))).trim();
    out.push(`<div data-callout="${type}" class="callout"><div class="callout-title" dir="auto"><div class="callout-title-inner">${escapeHtml(title)}</div></div><div class="callout-content">`);
    out.push(rendered);
    out.push("</div></div>");
  }
  return out.join("\n");
}

function convertWikiEmbeds(markdown) {
  return markdown.replace(/!\[\[([^\]]+)\]\]/g, (_match, raw) => {
    const [target, label] = raw.split("|");
    const name = (label || path.basename(target)).trim();
    const imagePath = publicImageFor(target);
    if (!imagePath) {
      return `<p class="image-embed image-missing">Imagem ausente: ${escapeHtml(name)}</p>`;
    }
    return `<figure class="image-embed"><img src="${escapeAttribute(imagePath)}" alt="${escapeAttribute(name)}" loading="lazy" decoding="async"><figcaption>${escapeHtml(name)}</figcaption></figure>`;
  });
}

function convertWikiLinks(markdown) {
  return markdown.replace(/\[\[([^\]]+)\]\]/g, (_match, raw) => {
    const [target, label] = raw.split("|");
    const text = (label || target).trim();
    return `<span class="internal-link">${escapeHtml(text)}</span>`;
  });
}

function collapseTableBlankLines(markdown) {
  const lines = markdown.split("\n");
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (
      lines[i].trim() === "" &&
      out.length > 0 &&
      i + 1 < lines.length &&
      out[out.length - 1].trim().startsWith("|") &&
      lines[i + 1].trim().startsWith("|")
    ) {
      continue;
    }
    out.push(lines[i]);
  }
  return out.join("\n");
}

function preprocessMarkdown(markdown) {
  return collapseTableBlankLines(convertWikiLinks(convertWikiEmbeds(markdown)));
}

function renderMarkdown(markdown) {
  const withCallouts = renderCallouts(markdown);
  return marked.parse(preprocessMarkdown(withCallouts));
}

function replaceDocumentContent(existingHtml, pageTitle, frontmatter, renderedBody) {
  const start = existingHtml.indexOf('<pre class="frontmatter');
  const right = existingHtml.indexOf('<div id="right-content"', start);
  if (start === -1 || right === -1) {
    throw new Error("Could not find document replacement boundaries");
  }

  const prefix = existingHtml.slice(0, start);
  const suffix = existingHtml.slice(right);
  const frontmatterHtml = `<pre class="frontmatter language-yaml" style="display: none;"><code class="language-yaml is-loaded">${escapeHtml(frontmatter)}</code></pre>`;
  const contentHtml = `<div class="markdown-preview-sizer markdown-preview-section"><div class="header"><h1 class="page-title heading inline-title" dir="auto">${escapeHtml(pageTitle)}</h1><div class="data-bar"></div></div><div class="markdown-preview-pusher" style="width: 1px; height: 0.1px; margin-bottom: 0px;"></div>${renderedBody}<div class="footer"><div class="data-bar"></div></div></div></div></div></div>`;
  return prefix + frontmatterHtml + contentHtml + suffix;
}

let updated = 0;
for (const [sourceDir, sourceFile, targetDir, targetFile] of mappings) {
  const sourcePath = path.join(sourceRoot, sourceDir, sourceFile);
  const targetPath = path.join(targetRoot, targetDir, targetFile);
  const medTargetPath = path.join(medTargetRoot, targetDir, targetFile);
  if (!fs.existsSync(sourcePath)) throw new Error(`Missing source: ${sourcePath}`);
  if (!fs.existsSync(targetPath)) throw new Error(`Missing target: ${targetPath}`);
  if (!fs.existsSync(medTargetPath)) throw new Error(`Missing med target: ${medTargetPath}`);

  const source = fs.readFileSync(sourcePath, "utf8");
  const target = fs.readFileSync(targetPath, "utf8");
  const { frontmatter, body } = splitFrontmatter(source);
  const rendered = renderMarkdown(body);
  const next = replaceDocumentContent(target, targetDir, frontmatter, rendered).replace(/[ \t]+$/gm, "");
  fs.writeFileSync(targetPath, next, "utf8");
  fs.writeFileSync(medTargetPath, next, "utf8");
  updated += 1;
  console.log(`updated ${path.relative(root, targetPath)} and ${path.relative(root, medTargetPath)}`);
}

console.log(`Done. Updated ${updated} Semiologia Medica P2 summaries in both legacy website trees.`);
console.log(`Copied ${Array.from(copiedImages.values()).filter(Boolean).length} images to ${path.relative(root, imageAssetRoot)}.`);
