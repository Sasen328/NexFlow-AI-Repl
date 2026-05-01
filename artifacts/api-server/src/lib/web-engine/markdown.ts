/**
 * HTML → clean Markdown converter.
 *
 * Mirrors Firecrawl's killer feature: strip nav/footer/script/style noise,
 * keep semantic structure (headings, lists, links, code), output Markdown
 * that LLMs can read without choking.
 *
 * Self-contained (no Turndown dep): ~150 lines of focused Cheerio walks.
 */

import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";

// Cheerio nodes are typed via domhandler internally; for our walker we only
// need .type / .data / .name, so an `any` shim is fine and avoids dragging
// in @types/domhandler as a direct dep.
/* eslint-disable @typescript-eslint/no-explicit-any */
type Node = any;
type CheerioCol = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

const NOISE_SELECTORS = [
  "script", "style", "noscript", "iframe", "svg", "canvas",
  "nav", "header", "footer", "aside",
  "[role=navigation]", "[role=banner]", "[role=contentinfo]",
  ".navbar", ".nav", ".menu", ".sidebar", ".footer", ".header",
  ".cookie", ".cookies", ".cookie-banner", ".gdpr",
  ".advertisement", ".ads", ".ad-banner",
  ".social-share", ".share-buttons",
];

export interface MarkdownResult {
  markdown: string;
  title?: string;
  description?: string;
  language?: string;
  links: string[];
  images: string[];
}

export function htmlToMarkdown(html: string, baseUrl?: string): MarkdownResult {
  const $ = cheerio.load(html);

  const title = $("title").first().text().trim()
    || $('meta[property="og:title"]').attr("content")?.trim()
    || $("h1").first().text().trim();

  const description = $('meta[name="description"]').attr("content")?.trim()
    || $('meta[property="og:description"]').attr("content")?.trim();

  const language = $("html").attr("lang")?.trim();

  // Strip noise
  for (const sel of NOISE_SELECTORS) $(sel).remove();
  // Remove hidden elements
  $('[hidden], [aria-hidden="true"], [style*="display:none"], [style*="display: none"]').remove();

  // Pick the main content container if one exists
  const main = $("main, article, [role=main], #main, #content, .content, .post, .article").first();
  const root = main.length > 0 ? main : $("body");

  const links: string[] = [];
  const images: string[] = [];

  // Pre-pass: absolutize URLs and collect link/image lists
  if (baseUrl) {
    root.find("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      const abs = absolutize(href, baseUrl);
      if (abs) {
        $(el).attr("href", abs);
        links.push(abs);
      }
    });
    root.find("img[src]").each((_, el) => {
      const src = $(el).attr("src");
      const abs = absolutize(src, baseUrl);
      if (abs) {
        $(el).attr("src", abs);
        images.push(abs);
      }
    });
  }

  const md = walk($, root as CheerioCol, 0).trim();
  return {
    markdown: collapse(md),
    title,
    description,
    language,
    links: dedupe(links),
    images: dedupe(images),
  };
}

function walk($: CheerioAPI, $node: CheerioCol, depth: number): string {
  let out = "";
  $node.contents().each((_: number, el: Node) => {
    out += render($, el, depth);
  });
  return out;
}

function render($: CheerioAPI, el: Node, depth: number): string {
  if (el.type === "text") {
    return (el.data || "").replace(/\s+/g, " ");
  }
  if (el.type !== "tag") return "";
  const $el = $(el) as CheerioCol;
  const tag = (el.name || "").toLowerCase();
  const inner = () => walk($, $el, depth + 1);

  switch (tag) {
    case "h1": return `\n\n# ${inner().trim()}\n\n`;
    case "h2": return `\n\n## ${inner().trim()}\n\n`;
    case "h3": return `\n\n### ${inner().trim()}\n\n`;
    case "h4": return `\n\n#### ${inner().trim()}\n\n`;
    case "h5": return `\n\n##### ${inner().trim()}\n\n`;
    case "h6": return `\n\n###### ${inner().trim()}\n\n`;
    case "p":  return `\n\n${inner().trim()}\n\n`;
    case "br": return "\n";
    case "hr": return "\n\n---\n\n";
    case "strong": case "b": return `**${inner().trim()}**`;
    case "em": case "i": return `*${inner().trim()}*`;
    case "code": return `\`${inner().trim()}\``;
    case "pre": return `\n\n\`\`\`\n${$el.text().trim()}\n\`\`\`\n\n`;
    case "blockquote": return `\n\n> ${inner().trim().replace(/\n/g, "\n> ")}\n\n`;
    case "a": {
      const href = $el.attr("href");
      const text = inner().trim() || href || "";
      return href ? `[${text}](${href})` : text;
    }
    case "img": {
      const src = $el.attr("src");
      const alt = $el.attr("alt") || "";
      return src ? `![${alt}](${src})` : "";
    }
    case "ul": case "ol": {
      const items: string[] = [];
      $el.children("li").each((i: number, li: Node) => {
        const bullet = tag === "ol" ? `${i + 1}.` : "-";
        items.push(`${bullet} ${walk($, $(li) as CheerioCol, depth + 1).trim().replace(/\n+/g, " ")}`);
      });
      return `\n\n${items.join("\n")}\n\n`;
    }
    case "table": {
      const rows: string[] = [];
      $el.find("tr").each((_: number, tr: Node) => {
        const cells: string[] = [];
        $(tr).find("th, td").each((_i: number, td: Node) => {
          cells.push($(td).text().trim().replace(/\s+/g, " ") || " ");
        });
        if (cells.length > 0) rows.push(`| ${cells.join(" | ")} |`);
      });
      if (rows.length === 0) return "";
      const sep = `| ${rows[0]!.split("|").slice(1, -1).map(() => "---").join(" | ")} |`;
      return `\n\n${rows[0]}\n${sep}\n${rows.slice(1).join("\n")}\n\n`;
    }
    case "div": case "section": case "span": case "article": case "main":
      return inner();
    default:
      return inner();
  }
}

function absolutize(href: string | undefined, base: string): string | null {
  if (!href) return null;
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

function collapse(md: string): string {
  return md
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^[ \t]+/gm, "")
    .trim();
}
