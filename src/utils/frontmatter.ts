import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

type MarkdownTree = Parameters<typeof toString>[0];
type RemarkFile = {
  data?: {
    astro?: {
      frontmatter?: {
        readingTime?: number;
      };
    };
  };
};
type HtmlNode = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HtmlNode[];
};

export const readingTimeRemarkPlugin = () => {
  return function (tree, file) {
    const textOnPage = toString(tree);
    const readingTime = Math.ceil(getReadingTime(textOnPage).minutes);

    if (typeof file?.data?.astro?.frontmatter !== 'undefined') {
      file.data.astro.frontmatter.readingTime = readingTime;
    }
  } satisfies (tree: MarkdownTree, file: RemarkFile) => void;
};

export const responsiveTablesRehypePlugin = () => {
  return function (tree) {
    if (!tree.children) return;

    for (let i = 0; i < tree.children.length; i++) {
      const child = tree.children[i];

      if (child.type === 'element' && child.tagName === 'table') {
        tree.children[i] = {
          type: 'element',
          tagName: 'div',
          properties: {
            style: 'overflow:auto',
          },
          children: [child],
        };

        i++;
      }
    }
  } satisfies (tree: HtmlNode) => void;
};
