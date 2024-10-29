"use client";

import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { items, getTagColor } from "@/components/AppSidebar";
import { Badge } from "@/components/ui/badge";


export default function Home() {
  return (
    <div className="flex h-full flex-col items-center p-8 gap-y-8 overflow-y-auto">
      <div className="w-full max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Image alt="baml-logo" src="/baml.png" width={64} height={64} />
          <h1 className="font-bold text-4xl">BAML Examples</h1>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What is BAML?</CardTitle>
            <CardDescription>
              BAML is a structured prompting language that enables you to create dynamic and interactive prompts for your applications with type safety and real-time streaming capabilities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Explore the power of BAML through our interactive demos below. Each example showcases different aspects of BAML's capabilities in building AI-powered applications.
            </p>
            <Link
              href="https://docs.boundaryml.com"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline" })}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              BAML Documentation
            </Link>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-semibold mb-4">Interactive Demos</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={item.url}
                  className={buttonVariants({ variant: "default" })}
                >
                  Try Demo
                </Link>
              </CardContent>
              <CardFooter>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      style={{ backgroundColor: getTagColor(tag) }}
                      className={`text-xs font-medium capitalize`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}