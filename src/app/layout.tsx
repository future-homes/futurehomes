import type { Metadata } from 'next'
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
        alt: 'Future Homes',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Future Homes - Find Your Perfect Rental Property',
    description: 'Discover the best rental properties in Kerala',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
