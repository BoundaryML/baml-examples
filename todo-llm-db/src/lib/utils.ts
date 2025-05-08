import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { MessageToUser, AddItem, AdjustItem, GetWeather, Resume } from "../../baml_client/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type Tool = MessageToUser | AddItem | AdjustItem | GetWeather | Resume