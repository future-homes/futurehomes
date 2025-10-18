import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { AuthProvider } from '@/lib/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Future Homes - Find Your Perfect Rental Property in Kerala',
  description: 'Discover the best rental properties in Kerala. Browse apartments, houses, villas and commercial spaces in Kochi, Trivandrum, Kozhikode and more. No brokerage, direct owner contact.',
  keywords: ['rental properties kerala', 'apartments for rent kochi', 'houses for rent trivandrum', 'kerala real estate', 'property rental', 'rent house kerala', 'future homes'],
  authors: [{ name: 'Future Homes' }],
  
  // PWA Manifest
  manifest: '/manifest.json',
  
  // Icons Configuration
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
  },
  
  // Apple Web App Configuration
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Future Homes',
  },
  
  // Open Graph
  openGraph: {
    title: 'Future Homes - Find Your Perfect Rental Property',
    description: 'Discover the best rental properties in Kerala. No brokerage, direct owner contact.',
    url: 'https://futurehomes.com',
    siteName: 'Future Homes',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Future Homes - Property Listings',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Future Homes - Find Your Perfect Rental Property',
    description: 'Discover the best rental properties in Kerala',
    images: ['/og-image.jpg'],
  },
  
  // Robots
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
  
  // Additional Meta Tags
  category: 'Real Estate',
  applicationName: 'Future Homes',
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
}

// Viewport Configuration (Separate export for Next.js 14+)
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Future Homes" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-TileImage" content="/icon-512.png" />
        
        {/* Additional SEO */}
        <link rel="canonical" href="https://futurehomes.com" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="pt-20">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
