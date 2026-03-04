export async function generateStaticParams() {
  return [{ id: '1' }]
}

export default function LiveSessionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
