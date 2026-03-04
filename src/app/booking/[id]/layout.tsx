export async function generateStaticParams() {
  return [{ id: '1' }]
}

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
