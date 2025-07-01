import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '앤플랫폼 - 스마트한 통신 솔루션',
  description: '안벤데뿔과 함께하는 스마트한 통신 서비스, 최적의 요금제로 더 나은 통신 환경을 경험하세요.',
  keywords: ['통신', '인터넷', '모바일', '요금제', '앤플랫폼'],
  authors: [{ name: '앤플랫폼' }],
  openGraph: {
    title: '앤플랫폼 - 스마트한 통신 솔루션',
    description: '안벤데뿔과 함께하는 스마트한 통신 서비스',
    type: 'website',
    locale: 'ko_KR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
} 