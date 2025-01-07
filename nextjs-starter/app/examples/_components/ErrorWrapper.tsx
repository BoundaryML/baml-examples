import type React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AlertCircle } from "lucide-react"

export const ErrorWrapper = ({ children, error }: { children: React.ReactNode; error: string }) => {
  if (!error) return children;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1">
            {children}
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-red-500 text-white">
          <p>{error}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
