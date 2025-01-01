import './globals.css'

export const metadata = {
  title: 'Up2WP System',
  description: 'Upload Articles to WordPress Sites',
}

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
