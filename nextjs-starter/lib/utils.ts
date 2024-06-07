import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sortJsonRecursive(obj: any): any {
  if (obj instanceof Array) {
    return obj.map(sortJsonRecursive);
  } else if (obj instanceof Object) {
    return Object.keys(obj)
      .sort()
      .reduce((result: any, key) => {
        result[key] = sortJsonRecursive(obj[key]);
        return result;
      }, {});
  }
  return obj;
}
