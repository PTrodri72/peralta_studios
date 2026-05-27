export const metadata = {
  title: 'Peralta Studios - MTA Store',
  description: 'Licenciamento automático de resources MTA',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body style={{ margin: 0, backgroundColor: '#0e1118', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}