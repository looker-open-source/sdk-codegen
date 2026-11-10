/*

 Copyright 2026 Google LLC

 Use of this source code is governed by an MIT-style
 license that can be found in the LICENSE file or at
 https://opensource.org/licenses/MIT

 */

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const DROP_SUBTREE_TAGS = new Set([
  'applet',
  'audio',
  'base',
  'button',
  'canvas',
  'embed',
  'form',
  'frame',
  'frameset',
  'head',
  'iframe',
  'input',
  'link',
  'math',
  'meta',
  'noscript',
  'object',
  'option',
  'script',
  'select',
  'style',
  'svg',
  'template',
  'textarea',
  'title',
  'video',
]);

const ALLOWED_TAGS = new Set([
  'a',
  'abbr',
  'b',
  'blockquote',
  'br',
  'caption',
  'cite',
  'code',
  'dd',
  'del',
  'details',
  'dfn',
  'div',
  'dl',
  'dt',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'ins',
  'kbd',
  'li',
  'mark',
  'ol',
  'p',
  'pre',
  'q',
  's',
  'samp',
  'small',
  'span',
  'strike',
  'strong',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'time',
  'tr',
  'u',
  'ul',
  'var',
]);

const GLOBAL_ALLOWED_PROPS = new Set([
  'align',
  'colSpan',
  'dir',
  'lang',
  'open',
  'reversed',
  'rowSpan',
  'scope',
  'start',
  'title',
]);

const TAG_ALLOWED_PROPS: Record<string, Set<string>> = {
  a: new Set(['href', 'rel', 'target']),
  code: new Set(['className']),
  img: new Set(['alt', 'height', 'src', 'width']),
};

const SAFE_HREF_SCHEMES = new Set(['http:', 'https:', 'mailto:']);
const SAFE_SRC_SCHEMES = new Set(['http:', 'https:']);

const isSafeUrl = (raw: unknown, allowedSchemes: Set<string>): boolean => {
  if (typeof raw !== 'string') return false;
  // Strip ASCII control characters, whitespace, and <mark> highlight tags
  // (raw or URL-encoded) before checking host-relative prefixes and URI schemes.
  const normalized = raw
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0020]+/g, '')
    .replace(/<\/?mark>/gi, '')
    .replace(/%3c\/?mark%3e/gi, '');
  if (!normalized) return true;
  const decodedSlashes = normalized.replace(/%5c/gi, '\\');
  if (/^[/\\]{2}/.test(decodedSlashes) || decodedSlashes.startsWith('\\')) {
    return false;
  }

  const colonIndex = normalized.indexOf(':');
  const firstDelimiter = normalized.search(/[/?#]/);
  if (
    colonIndex !== -1 &&
    (firstDelimiter === -1 || colonIndex < firstDelimiter)
  ) {
    const scheme = normalized.slice(0, colonIndex + 1).toLowerCase();
    if (!/^[a-z][a-z0-9+.-]*:$/.test(scheme)) {
      return false;
    }
    return allowedSchemes.has(scheme);
  }
  return true;
};

/**
 * Checks whether a link href uses an allowed scheme and is not protocol-relative.
 */
export const isSafeHref = (raw: unknown): boolean =>
  isSafeUrl(raw, SAFE_HREF_SCHEMES);

const sanitizeProperties = (
  tag: string,
  properties?: Record<string, unknown>
): Record<string, unknown> => {
  if (!properties) return {};
  const tagAllowed = TAG_ALLOWED_PROPS[tag];
  const clean: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (/^on/i.test(key)) continue;
    if (!GLOBAL_ALLOWED_PROPS.has(key) && !tagAllowed?.has(key)) continue;

    if (key === 'href') {
      if (!isSafeUrl(value, SAFE_HREF_SCHEMES)) continue;
    } else if (key === 'src') {
      if (!isSafeUrl(value, SAFE_SRC_SCHEMES)) continue;
    } else if (key === 'className') {
      const classList = Array.isArray(value)
        ? value
        : typeof value === 'string'
        ? value.split(/\s+/)
        : [];
      const classes = classList.filter(
        (cls): cls is string =>
          typeof cls === 'string' && /^language-[\w-]+$/.test(cls)
      );
      if (classes.length === 0) continue;
      clean[key] = classes;
      continue;
    }

    clean[key] = value;
  }

  if (tag === 'a' && clean.target !== undefined) {
    clean.rel = 'noopener noreferrer';
  }

  return clean;
};

const sanitizeChildren = (children?: HastNode[]): HastNode[] => {
  if (!children) return [];
  const result: HastNode[] = [];
  for (const child of children) {
    result.push(...sanitizeNode(child));
  }
  return result;
};

const sanitizeNode = (node: HastNode): HastNode[] => {
  if (node.type === 'root') {
    return [{ ...node, children: sanitizeChildren(node.children) }];
  }
  if (node.type === 'text') {
    return [node];
  }
  if (node.type !== 'element' || !node.tagName) {
    return [];
  }

  const tag = node.tagName.toLowerCase();
  // Preserve GFM disabled task-list checkboxes while stripping all attributes/events.
  if (
    tag === 'input' &&
    node.properties?.type === 'checkbox' &&
    Boolean(node.properties?.disabled)
  ) {
    return [
      {
        type: 'element',
        tagName: 'input',
        properties: {
          type: 'checkbox',
          disabled: true,
          ...(node.properties.checked ? { checked: true } : {}),
        },
        children: [],
      },
    ];
  }
  if (DROP_SUBTREE_TAGS.has(tag)) {
    return [];
  }
  if (!ALLOWED_TAGS.has(tag)) {
    return sanitizeChildren(node.children);
  }
  if (
    tag === 'a' &&
    node.properties?.href !== undefined &&
    !isSafeUrl(node.properties.href, SAFE_HREF_SCHEMES)
  ) {
    return sanitizeChildren(node.children);
  }
  if (
    tag === 'img' &&
    (node.properties?.src === undefined ||
      !isSafeUrl(node.properties.src, SAFE_SRC_SCHEMES))
  ) {
    return [];
  }

  return [
    {
      ...node,
      tagName: tag,
      properties: sanitizeProperties(tag, node.properties),
      children: sanitizeChildren(node.children),
    },
  ];
};

/**
 * Rehype plugin that sanitizes raw HTML parsed by rehype-raw using an allowlist
 * of safe formatting tags and URL schemes while preserving `<mark>` highlights.
 */
export const rehypeSanitizeMarkdown = () => (tree: HastNode) => {
  const [sanitized] = sanitizeNode(tree);
  return sanitized || { type: 'root', children: [] };
};
