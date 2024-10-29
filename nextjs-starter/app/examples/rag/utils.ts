import { Citation, Document } from "@/baml_client/types";

export const createWikipediaLink = (link: string, citedText: string) => {
    const encodedText = encodeURIComponent(
      citedText.replace(/\s+/g, " ").trim()
    );
    return `${link}#:~:text=${encodedText}`;
  };


export const getCitationContext = (citation: Pick<Citation, 'documentTitle' | 'relevantTextFromDocument'>, documents: Document[]) => {
    const document = documents.find(
      (d) => d.title.toLowerCase() === citation.documentTitle.toLowerCase()
    );
    if (!document) return null;

    const citedText = citation.relevantTextFromDocument;
    const fullText = document.text;

    const lowerFullText = fullText.toLowerCase();
    const lowerCitedText = citedText.toLowerCase();
    console.log(citation);
    console.log(citedText);
    console.log(fullText);

    let citationIndex = lowerFullText.indexOf(lowerCitedText);

    if (citationIndex !== -1) {
      return createContext(fullText, citedText, citationIndex, document);
    }
    console.warn("citation not found, trying to strip----------------------");

    // If not found, strip citation numbers from fullText and try again
    const strippedFullText = lowerFullText.replace(/\[\d+\]/g, "");
    const strippedCitedText = lowerCitedText.replace(/\[\d+\]/g, "");
    const strippedIndex = strippedFullText.indexOf(strippedCitedText);

    if (strippedIndex !== -1) {
      return createContext(
        strippedFullText,
        strippedCitedText,
        strippedIndex,
        document
      );
    }
    console.log(strippedFullText);
    console.log(strippedCitedText);
    console.log(strippedIndex);

    console.error("Citation not found in document text", {
      citation,
      strippedCitedText,
      doc: document.title,
    });
    return null;
  };

  const createContext = (
    text: string,
    citedText: string,
    index: number,
    document: Document
  ) => {
    const startIndex = Math.max(0, index - 200);
    const endIndex = Math.min(text.length, index + citedText.length + 200);

    return {
      before: text.slice(startIndex, index),
      cited: citedText,
      after: text.slice(index + citedText.length, endIndex),
      title: document.title,
      link: document.link,
    };
  };