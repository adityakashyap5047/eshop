import './global.css';
import Providers from './provider';

export const metadata = {
  title: 'Eshop - Seller',
  description: 'Your one-stop online shopping destination for quality products at great prices. Browse thousands of items across electronics, fashion, home goods, and more with fast shipping and secure checkout.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
