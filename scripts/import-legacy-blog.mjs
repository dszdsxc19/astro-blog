import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const sourceRoot = '/Users/admin/Desktop/mine/we-write-to-think/data/blog/zh';
const imageSourceRoot = '/Users/admin/Desktop/mine/we-write-to-think/public/static/images/blog';
const postTargetRoot = path.resolve('src/data/post/legacy');
const imageTargetRoot = path.resolve('public/static/images/blog');

const excludedBasenames = new Set(['learning-with-ai-duplicate.mdx']);

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) return [fullPath];
    return [];
  });
};

const parseFrontmatter = (source, filePath) => {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    throw new Error(`Missing frontmatter: ${filePath}`);
  }

  return {
    data: yaml.load(match[1]) ?? {},
    body: source.slice(match[0].length),
  };
};

const normalizeDate = (value) => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.valueOf())) return String(value);
  return date;
};

const normalizeBody = (body) =>
  body
    .replace(/\]\(static\/images\/blog\//g, '](/static/images/blog/')
    .replace(
      /\[how-i-use-llm\]\(\/static\/images\/blog\/how-i-use-llm\.png\)/g,
      '![how-i-use-llm](/static/images/blog/how-i-use-llm.png)'
    );

const imported = [];

fs.rmSync(postTargetRoot, { recursive: true, force: true });
fs.mkdirSync(postTargetRoot, { recursive: true });

for (const filePath of walk(sourceRoot).sort()) {
  const basename = path.basename(filePath);
  if (excludedBasenames.has(basename)) continue;

  const relativePath = path.relative(sourceRoot, filePath);
  const targetPath = path.join(postTargetRoot, relativePath);
  const source = fs.readFileSync(filePath, 'utf8');
  const { data, body } = parseFrontmatter(source, filePath);

  const normalized = {
    title: data.title,
    publishDate: normalizeDate(data.publishDate ?? data.date),
    updateDate: normalizeDate(data.updateDate ?? data.lastmod),
    draft: data.draft ?? false,
    excerpt: data.excerpt ?? data.summary,
    image: data.image,
    category: data.category ?? 'Software Engineering',
    tags: data.tags,
    author: data.author ?? 'Terry',
  };

  for (const key of Object.keys(normalized)) {
    if (normalized[key] === undefined || normalized[key] === null) {
      delete normalized[key];
    }
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, `---\n${yaml.dump(normalized, { lineWidth: -1 })}---\n\n${normalizeBody(body)}`);
  imported.push(relativePath);
}

if (fs.existsSync(imageSourceRoot)) {
  fs.mkdirSync(imageTargetRoot, { recursive: true });
  fs.cpSync(imageSourceRoot, imageTargetRoot, { recursive: true });
}

console.log(`Imported ${imported.length} legacy posts into ${path.relative(process.cwd(), postTargetRoot)}`);
