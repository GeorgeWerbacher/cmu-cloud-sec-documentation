import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'
import dynamic from 'next/dynamic'

// Dynamically import AuthNav with SSR disabled to prevent hydration issues
const AuthNav = dynamic(() => import('./components/AuthNav').then(mod => ({ default: mod.AuthNav })), { ssr: false })

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
  darkMode: true,
  navbar: {
    extraContent: <AuthNav />
  }
}

export default config
