'use server'

export type NonNullableQuery = {
  category: "packaging" | "processing";
  phrase: string;
};

export type Classification = {
  selected_category: string;
  selected_category_id: string;
  parent_category: string | null;
  parent_category_id: string | null;
  main_category: string;
  main_category_id: string;
};

export type SearchResult = {
  query: string;
  classifications: Classification[];
  suggestions: string[];
};

export async function searchProsource(phrase: string): Promise<SearchResult> {
  const response = await fetch(
    `https://www.prosource.org/__ai/search?phrase=${encodeURIComponent(phrase)}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      next: {
        revalidate: 86400 // 24 hours in seconds
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch from Prosource: ${response.statusText}`);
  }

  return response.json();
} 