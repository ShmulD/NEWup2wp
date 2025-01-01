import './globals.css';

export const metadata = {
  title: 'מערכת העלאת מאמרים לוורדפרס',
  description: 'מערכת להעלאת מאמרי Word לאתרי וורדפרס מרובים',
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}