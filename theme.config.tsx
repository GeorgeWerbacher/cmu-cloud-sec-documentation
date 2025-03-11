import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>Cloud Security Course</span>,
  project: {
    link: 'https://github.com/GeorgeWerbacher/cmu-cloud-sec-documentation',
  },
  docsRepositoryBase: 'https://github.com/GeorgeWerbacher/cmu-cloud-sec-documentation',
  footer: {
    text: 'CMU Cloud Security Course Documentation © 2025',
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Cloud Security Course'
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Cloud Security Course Documentation and Resources" />
    </>
  ),
  darkMode: true
}

export default config
