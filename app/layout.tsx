import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: '#050507',
}

export const metadata: Metadata = {
  title: "MyQAssist — Générez vos cas de test en 60 secondes",
  description: "MyQAssist transforme vos spécifications fonctionnelles en exigences, cas de test et analyse de couverture grâce à l'IA. Essai gratuit, sans carte bancaire.",
  metadataBase: new URL('https://myqassist.fr'),
  openGraph: {
    title: "MyQAssist — Générez vos cas de test en 60 secondes",
    description: "Transformez vos spécifications fonctionnelles en exigences, cas de test et analyse de couverture grâce à l'IA.",
    url: 'https://myqassist.fr',
    siteName: 'MyQAssist',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "MyQAssist — Générez vos cas de test en 60 secondes",
    description: "Transformez vos spécifications fonctionnelles en exigences, cas de test et analyse de couverture grâce à l'IA.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
