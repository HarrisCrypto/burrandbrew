import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Guides',
      href: getPermalink('/guides'),
    },
    {
      text: 'Comparisons',
      href: getPermalink('/comparisons'),
    },
    {
      text: 'About',
      href: getPermalink('/about'),
    },
  ],
  actions: [{ text: 'Start brewing', href: getPermalink('/guides') }],
};

export const footerData = {
  links: [
    {
      title: 'Learn',
      links: [
        { text: 'All guides', href: getPermalink('/guides') },
        { text: 'Comparisons', href: getPermalink('/comparisons') },
        { text: 'Brewing how-tos', href: getPermalink('/guides') },
      ],
    },
    {
      title: 'Site',
      links: [
        { text: 'About', href: getPermalink('/about') },
        { text: 'Gear I use', href: getPermalink('/guides/gear-i-use') },
        { text: 'Affiliate disclosure', href: getPermalink('/affiliate-disclosure') },
        { text: 'Privacy policy', href: getPermalink('/privacy') },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Affiliate disclosure', href: getPermalink('/affiliate-disclosure') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [],
  footNote: `
    © 2026 Burr & Brew · Honest guides for home coffee and espresso.
  `,
};
