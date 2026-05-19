import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: '首页',
      href: getPermalink('/'),
    },
    {
      text: '文章',
      href: getBlogPermalink(),
    },
    {
      text: '关于',
      href: getPermalink('/about'),
    },
  ],
  actions: [],
};

export const footerData = {
  links: [],
  secondaryLinks: [],
  socialLinks: [
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
    { ariaLabel: 'Email', icon: 'tabler:mail', href: 'mailto:dszdsxc19@gmail.com' },
    { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/dszdsxc19' },
  ],
  footNote: `
    © Terry · 写作即思考，编程即创造
  `,
};
