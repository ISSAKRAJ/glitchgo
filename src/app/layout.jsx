import './globals.css';
import AiAssistant from '../components/ui/AiAssistant';

export const metadata = {
  title: {
    default: 'AdminZero — AI Database Firewall by GlitchGo',
    template: '%s | AdminZero by GlitchGo',
  },
  description:
    'AdminZero is a Cloud API database security gateway that intercepts and blocks dangerous SQL injections from AI agents before they reach your database. Integrates effortlessly via REST API.',
  keywords: [
    'AI database security',
    'SQL injection prevention',
    'AI agent firewall',
    'database firewall',
    'LangChain security',
    'AST query firewall',
    'AdminZero',
    'GlitchGo',
    'Cloud API Gateway',
    'PostgreSQL security',
    'LLM database protection',
  ],
  authors: [{ name: 'GlitchGo', url: 'https://glitchgo.tech' }],
  creator: 'GlitchGo',
  publisher: 'GlitchGo',
  metadataBase: new URL('https://glitchgo.tech'),

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://glitchgo.tech',
    siteName: 'AdminZero by GlitchGo',
    title: 'AdminZero — AI Database Firewall',
    description:
      'Stop AI agents from destroying your database. AdminZero intercepts every SQL query in under 4ms — locally, privately, and offline.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AdminZero — AI Database Firewall by GlitchGo',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'AdminZero — AI Database Firewall by GlitchGo',
    description:
      'The firewall that thinks before your AI does. Block SQL injections locally in under 4ms.',
    images: ['/og-image.png'],
    creator: '@glitchgotech',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },

  category: 'technology',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#040404" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="min-h-screen bg-dark-bg text-white antialiased selection:bg-brand-blue/30 overflow-x-hidden">
        {children}
        <AiAssistant />
      </body>
    </html>
  );
}
