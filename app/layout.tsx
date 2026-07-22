import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Promptify - Espaço de Trabalho',
  description: 'Gerenciador inteligente e repositório de prompts para IA',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-background text-on-background font-sans antialiased h-screen overflow-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

