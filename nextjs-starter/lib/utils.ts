import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sortJsonRecursive(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortJsonRecursive).sort((a, b) => deepCompare(a, b));
  } else if (typeof obj === "object" && obj !== null) {
    const sortedObject = Object.keys(obj)
      .sort()
      .reduce((result: any, key) => {
        result[key] = sortJsonRecursive(obj[key]);
        return result;
      }, {});
    return sortedObject;
  }
  return obj;
}

function deepCompare(a: any, b: any): number {
  if (typeof a === "object" && typeof b === "object") {
    return compareObjects(a, b);
  } else if (typeof a !== "object" && typeof b !== "object") {
    return a.toString().localeCompare(b.toString());
  } else {
    return typeof a === "object" ? 1 : -1;
  }
}

function compareObjects(a: any, b: any): number {
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  const lengthComparison = aKeys.length - bKeys.length;
  if (lengthComparison !== 0) return lengthComparison;

  for (let i = 0; i < aKeys.length; i++) {
    const keyComparison = aKeys[i].localeCompare(bKeys[i]);
    if (keyComparison !== 0) return keyComparison;

    const valueComparison = deepCompare(a[aKeys[i]], b[bKeys[i]]);
    if (valueComparison !== 0) return valueComparison;
  }
  return 0;
}
