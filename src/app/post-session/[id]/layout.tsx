export async function generateStaticParams() {
  return [{ id: '1' }]
}

export default function PostSessionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
