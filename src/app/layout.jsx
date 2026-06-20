import './globals.css';

export const metadata = {
  title: 'GlitchGo - Professional Code Rescues & AI Automations',
  description: 'Emergency code debugging, legacy codebase rescues, and custom AI pipeline integrations.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-dark-bg text-white antialiased selection:bg-brand-blue/30 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
