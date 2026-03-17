import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "LocalFlux",
  description: "A local-first, self-hosted multiplayer quiz engine. Zero cloud. Zero latency.",

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Get Started', link: '/guide/get-started' },
      { text: 'Guide', link: '/guide/what-is-localflux' },
    ],

    sidebar: [
      {
        text: 'Start Here',
        items: [
          { text: 'Get Started', link: '/guide/get-started' },
          { text: 'What is LocalFlux?', link: '/guide/what-is-localflux' },
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Architecture', link: '/guide/architecture' },
          { text: 'Deck Schema', link: '/guide/deck-schema' },
          { text: 'Testing', link: '/guide/testing' },
        ]
      },
      {
        text: 'Roadmap',
        items: [
          { text: 'VIP Bouncer', link: '/guide/vip-bounce' },
          { text: 'Difficulty Engine', link: '/guide/difficulty-engine' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Unknownbeliek/localflux' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'LocalFlux — FOSS Hack 2026'
    }
  }
})
