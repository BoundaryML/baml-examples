'use client';

import { useSelectedItem } from '@/components/AppSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Github } from 'lucide-react';
import Link from 'next/link';

const getRepoUrl = (path: string) => {
  // Remove leading slash and 'examples' from the path
  const cleanPath = path.replace(/^\/examples\//, '');
  return `https://github.com/BoundaryML/baml-examples/tree/main/nextjs-starter/app/examples/${cleanPath}`;
};

export default function Header() {
  const selected = useSelectedItem();

  if (!selected) {
    return null;
  }

  return (
    <header className='sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0'>
        <div className='flex flex-1 items-center gap-6'>
          <div>
            <h1 className='text-2xl font-bold leading-tight tracking-tighter'>{selected.title}</h1>
            <p className='text-sm text-muted-foreground'>{selected.description}</p>
          </div>
          <div className='hidden md:flex'>
            <Separator orientation='vertical' className='mx-4 h-8' />
            <div className='flex flex-wrap items-center gap-2'>
              {selected.tags.map((tag) => (
                <Badge key={tag} variant='secondary' className='text-xs'>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <Button variant='outline' size='sm' asChild>
            <Link href={getRepoUrl(selected.url)} target='_blank' rel='noopener noreferrer'>
              <Github className='mr-2 h-4 w-4' />
              View Source
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
