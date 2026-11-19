import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">My-Tangle</h1>
      <p className="text-muted-foreground">
        Оригинальные расчёски Tangle Teezer. Новый сайт в разработке.
      </p>
      <Button asChild>
        <Link href="/admin">Админка</Link>
      </Button>
    </div>
  )
}
