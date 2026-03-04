export async function generateStaticParams() {
  return [{ id: '1' }]
}

export default function BookingConfirmLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
