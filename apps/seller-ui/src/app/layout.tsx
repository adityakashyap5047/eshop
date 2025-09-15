import './global.css';
import Providers from './provider';
import { Poppins } from 'next/font/google';

export const metadata = {
  title: 'Eshop - Seller',
  description: 'Your one-stop online shopping destination for quality products at great prices. Browse thousands of items across electronics, fashion, home goods, and more with fast shipping and secure checkout.',
}

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800']
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-slate-900 font-sans antialiased ${poppins.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
