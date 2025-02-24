'use client';

import { BarChart, ExternalLink, FileText, MessageCircle, Utensils } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { buttonVariants } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from './ui/badge';

// Function to generate a consistent color based on the tag string
export function getTagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 90%)`;
}

export const items = [
  {
    title: 'Resume Parser',
    description: 'Efficiently parse and analyze resumes',
    url: '/examples/resume-parser',
    tags: ['streaming', 'structured outputs'],
    icon: FileText,
  },
  {
    title: 'Q&A Engine',
    description: 'Intelligent Q&A system with RAG',
    url: '/examples/rag',
    tags: ['streaming', 'RAG', 'hallucination detection'],
    icon: MessageCircle,
  },
  {
    title: 'Book Analyzer',
    description: 'Analyze books with real-time streaming charts',
    url: '/examples/book-analyzer',
    tags: ['streaming', 'graphs'],
    icon: BarChart,
  },
  {
    title: 'Recipe Generator',
    description: '',
    url: '/examples/get-recipe',
    tags: ['streaming', 'generative UIs'],
    icon: Utensils,
  },
];

export const useSelectedItem = () => {
  const pathname = usePathname();

  const selected = useMemo(() => {
    return items.find((item) => item.url === pathname);
  }, [pathname]);

  return selected;
};

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <Sidebar>
        <SidebarContent className='bg-primary-foreground'>
          <SidebarHeader className='p-4'>
            <div className='flex items-center space-x-2'>
              <Image alt='baml-logo' src='/baml.png' width={32} height={32} />
              <span className='text-lg font-bold'>BAML Examples</span>
            </div>
          </SidebarHeader>
          <SidebarHeader>
            <Link
              href='https://docs.boundaryml.com'
              target='_blank'
              rel='noopener noreferrer'
              className={buttonVariants({ variant: 'outline' })}
            >
              <ExternalLink className='mr-2 h-4 w-4' />
              BAML Documentation
            </Link>
          </SidebarHeader>
          <SidebarGroup>
            <SidebarGroupLabel className={cn('px-4 py-2')}>What is BAML?</SidebarGroupLabel>
            <SidebarGroupContent>
              {
                <div className='px-4 py-2 text-sm text-muted-foreground'>
                  <p className='mb-2'>
                    <strong>BAML</strong> is a prompting language that prioritizes <strong>type-safety</strong> and an
                    exceptional <strong>developer experience</strong>.
                  </p>
                  <p>
                    It simplifies making great UX (e.g. streaming) by reducing <strong>boilerplate</strong> code, while
                    ensuring high <strong>accuracy</strong> and <strong>consistency</strong> with LLMs.
                  </p>
                </div>
              }
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>NextJS Demos</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className='gap-4'>
                {items.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <Tooltip key={item.title} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className={cn(
                              'flex items-start space-x-4 rounded-lg px-4 py-2 hover:bg-muted group',
                              isActive && 'bg-muted',
                            )}
                          >
                            <Link href={item.url} className='flex flex-col w-full items-start h-full'>
                              <div className='flex flex-row items-center'>
                                <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                                <span className={cn('ml-3', isActive && 'font-medium')}>{item.title}</span>
                              </div>
                              <div className='flex flex-wrap gap-2 gap-y-1'>
                                {item.tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant='secondary'
                                    style={{
                                      backgroundColor: getTagColor(tag),
                                      opacity: 0.5,
                                    }}
                                    className={`text-xs font-medium capitalize py-0.5`}
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </TooltipTrigger>
                      <TooltipContent side='right' className='max-w-[200px]'>
                        <p className='font-semibold'>{item.title}</p>
                        <p className='text-sm text-muted-foreground'>{item.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </TooltipProvider>
  );
}
