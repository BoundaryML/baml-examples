import React from 'react';

// Define types for ANSI style and segment.
interface AnsiStyles {
  color: string | null;
  backgroundColor: string | null;
  // You can extend this with additional properties (e.g., fontWeight) if needed.
}

interface Segment {
  text: string;
  styles: AnsiStyles;
}

interface AnsiColorTextProps {
  text: string;
}

// Basic and bright color maps for foreground and background.
const basicColorMap: Record<string, string> = {
  '30': 'black',
  '31': 'red',
  '32': 'green',
  '33': 'yellow',
  '34': 'blue',
  '35': 'magenta',
  '36': 'cyan',
  '37': 'white',
};

const basicBackgroundColorMap: Record<string, string> = {
  '40': 'black',
  '41': 'red',
  '42': 'green',
  '43': 'yellow',
  '44': 'blue',
  '45': 'magenta',
  '46': 'cyan',
  '47': 'white',
};

const brightColorMap: Record<string, string> = {
  '90': 'gray',
  '91': 'lightcoral',
  '92': 'lightgreen',
  '93': 'lightyellow',
  '94': 'lightblue',
  '95': 'violet',
  '96': 'lightcyan',
  '97': 'white',
};

const brightBackgroundColorMap: Record<string, string> = {
  '100': 'gray',
  '101': 'lightcoral',
  '102': 'lightgreen',
  '103': 'lightyellow',
  '104': 'lightblue',
  '105': 'violet',
  '106': 'lightcyan',
  '107': 'white',
};

// Helper to convert RGB components to a hex string.
const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number): string => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return '#' + toHex(r) + toHex(g) + toHex(b);
};

// Helper to convert an ANSI 256 color number (0-255) to a hex string.
const ansi256ToHex = (n: number | string): string => {
  const num = typeof n === 'string' ? parseInt(n, 10) : n;
  if (num < 16) {
    // Standard colors.
    const standardColors = [
      '#000000', '#800000', '#008000', '#808000',
      '#000080', '#800080', '#008080', '#c0c0c0',
      '#808080', '#ff0000', '#00ff00', '#ffff00',
      '#0000ff', '#ff00ff', '#00ffff', '#ffffff'
    ];
    return standardColors[num];
  } else if (num >= 16 && num <= 231) {
    // 6x6x6 color cube.
    const nVal = num - 16;
    const r = Math.floor(nVal / 36);
    const g = Math.floor((nVal % 36) / 6);
    const b = nVal % 6;
    const conv = (c: number): number => [0, 95, 135, 175, 215, 255][c];
    return rgbToHex(conv(r), conv(g), conv(b));
  } else if (num >= 232 && num <= 255) {
    // Grayscale ramp.
    const gray = 8 + (num - 232) * 10;
    return rgbToHex(gray, gray, gray);
  }
  return '#000000'; // fallback
};

// Parse the ANSI string into segments with styles.
// This regex matches any SGR sequence: \x1b[ ... m
const parseAnsiString = (text: string): Segment[] => {
  const regex = /\x1b\[([\d;]+)m/g;
  const segments: Segment[] = [];
  let lastIndex = 0;
  let currentStyles: AnsiStyles = { color: null, backgroundColor: null };

  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    // Push text preceding the escape sequence.
    if (match.index > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, match.index),
        styles: { ...currentStyles },
      });
    }

    // Process the SGR parameters.
    const codes = match[1].split(';').map(Number);
    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];

      // Reset all styles.
      if (code === 0) {
        currentStyles = { color: null, backgroundColor: null };
      }
      // You can add handling for bold (code 1), underline (code 4), etc. here.

      // Extended color codes for foreground/background.
      else if (code === 38 || code === 48) {
        // Check if it's a 256-color or truecolor sequence.
        if (codes[i + 1] === 5 && i + 2 < codes.length) {
          // 256-color: [38;5;{n}] or [48;5;{n}]
          const colorValue = codes[i + 2];
          if (code === 38) {
            currentStyles.color = ansi256ToHex(colorValue);
          } else {
            currentStyles.backgroundColor = ansi256ToHex(colorValue);
          }
          i += 2; // Skip the next two parameters.
        } else if (codes[i + 1] === 2 && i + 4 < codes.length) {
          // Truecolor: [38;2;R;G;B] or [48;2;R;G;B]
          const r = codes[i + 2];
          const g = codes[i + 3];
          const b = codes[i + 4];
          const rgb = `rgb(${r}, ${g}, ${b})`;
          if (code === 38) {
            currentStyles.color = rgb;
          } else {
            currentStyles.backgroundColor = rgb;
          }
          i += 4; // Skip the next four parameters.
        }
      }
      // Basic foreground colors.
      else if (code >= 30 && code <= 37) {
        currentStyles.color = basicColorMap[code.toString()];
      }
      // Basic background colors.
      else if (code >= 40 && code <= 47) {
        currentStyles.backgroundColor = basicBackgroundColorMap[code.toString()];
      }
      // Bright foreground colors.
      else if (code >= 90 && code <= 97) {
        currentStyles.color = brightColorMap[code.toString()];
      }
      // Bright background colors.
      else if (code >= 100 && code <= 107) {
        currentStyles.backgroundColor = brightBackgroundColorMap[code.toString()];
      }
    }

    lastIndex = regex.lastIndex;
  }

  // Append any remaining text.
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      styles: { ...currentStyles },
    });
  }
  return segments;
};

// The React component that renders the colored text.
const AnsiColorText: React.FC<AnsiColorTextProps> = ({ text }) => {
  const segments = parseAnsiString(text);
  return (
    <span>
      {segments.map((seg, index) => (
        <span key={index} style={seg.styles}>
          {seg.text}
        </span>
      ))}
    </span>
  );
};

export default AnsiColorText;
