const NEWS_API_KEY = '2a272c740b9042168bdd186e16f408f9';
const BASE_URL = 'https://newsapi.org/v2/everything';

export interface NewsArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export async function fetchNewsArticles(interests: string[], search?: string): Promise<NewsArticle[]> {
  try {
    // Combine interests and search into a single query string
    let query = interests.join(' OR ');
    if (search && search.trim().length > 0) {
      query = `${search} OR ${query}`;
    }
    const url = `${BASE_URL}?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=30&apiKey=${NEWS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'ok' && Array.isArray(data.articles)) {
      return data.articles;
    }
    return [];
  } catch (e) {
    console.error('Failed to fetch news:', e);
    return [];
  }
} 