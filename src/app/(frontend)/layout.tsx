import React from 'react'
import './globals.css'

export const metadata = {
  description: 'Оригинальные расчёски Tangle Teezer и резинки Invisibobble',
  title: 'My-Tangle',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="ru">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
