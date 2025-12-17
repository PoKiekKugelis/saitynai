import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "PhotoGallery - Professional Photo Management",
  description: "Manage your photoshoots and photo collections professionally",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Providers>
          <Header />
          <main style={{
            flex: 1,
            maxWidth: '1400px',
            width: '100%',
            margin: '0 auto',
            padding: '2rem'
          }}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
