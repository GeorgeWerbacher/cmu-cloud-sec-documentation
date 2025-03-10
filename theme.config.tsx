import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>Cloud Security Course</span>,
  project: {
    link: 'https://github.com/GeorgeWerbacher/cmu-cloud-sec-documentation',
  },
  // Removed chat configuration as we're using a custom floating chat component
  docsRepositoryBase: 'https://github.com/GeorgeWerbacher/cmu-cloud-sec-documentation',
  footer: {
    text: 'CMU Cloud Security Course Documentation © 2025',
  },
  sidebar: {
    titleComponent({ title, type }) {
      if (type === 'separator') {
        return <span className="cursor-default">{title}</span>
      }
      return <>{title}</>
    },
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
}

export default config
