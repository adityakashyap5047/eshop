import Header from '../shared/widgets/header/header';
import './global.css';
import { Poppins, Roboto, Oregano } from "next/font/google";
import Providers from './providers';
import Footer from '../shared/widgets/footer/footer';

export const metadata = {
  title: 'Eshop',
  description: 'Your one-stop online shopping destination for quality products at great prices. Browse thousands of items across electronics, fashion, home goods, and more with fast shipping and secure checkout.',
}

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: '--font-roboto'
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins'
})

const oregano = Oregano({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-oregano'
}) 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`flex flex-col min-h-screen ${roboto.variable} ${poppins.variable} ${oregano.variable}`}>
        <Providers>
          <Header />
          <main className='flex-1'>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
