export async function generateStaticParams() {
  return [{ id: '1' }]
}

export default function TechnicalCheckLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
