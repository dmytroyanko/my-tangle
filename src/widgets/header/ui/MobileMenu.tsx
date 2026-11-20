'use client'

import { MenuIcon } from 'lucide-react'
import { useState, type MouseEvent, type ReactNode } from 'react'

import { Button } from '@/shared/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/ui/sheet'

type Props = {
  title: string
  openLabel: string
  closeLabel: string
  children: ReactNode
}

// Burger menu below xl. The content is rendered on the server and passed in as children.
export function MobileMenu({ title, openLabel, closeLabel, children }: Props) {
  const [open, setOpen] = useState(false)

  // Close after following any link inside the menu.
  const closeOnLink = (event: MouseEvent) => {
    if ((event.target as HTMLElement).closest('a')) setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="-ml-2 xl:hidden" aria-label={openLabel}>
          <MenuIcon className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" closeLabel={closeLabel} className="w-[min(22rem,100vw)] gap-0 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg">{title}</SheetTitle>
        </SheetHeader>
        <div onClick={closeOnLink} className="flex flex-col gap-6 px-4 pb-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}
