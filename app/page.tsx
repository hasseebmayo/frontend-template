'use client';
import { Typography } from '@/components/ui/typography';

export default function Home() {
  return (
    <div className="grid w-full grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Typography as="h1">Hello</Typography>
    </div>
  );
}
