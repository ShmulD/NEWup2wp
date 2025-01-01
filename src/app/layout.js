import './globals.css'

export const metadata = {
  title: 'מערכת העלאת מאמרים',
  description: 'העלאת מאמרים לאתרי וורדפרס',
}

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
