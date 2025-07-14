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
    let url;
    
    // Political keywords to ensure we get political news
    const politicalKeywords = [
      'politics', 'government', 'congress', 'senate', 'house', 'biden', 'trump', 
      'election', 'campaign', 'policy', 'bill', 'legislation', 'vote', 'democrat', 
      'republican', 'political', 'federal', 'state government', 'governor', 'mayor',
      'supreme court', 'justice', 'law', 'regulatory', 'administration'
    ];
    
    // If no interests and no search, fetch political news
    if (interests.length === 0 && (!search || search.trim().length === 0)) {
      // Use political keywords to get political news
      const politicalQuery = politicalKeywords.slice(0, 5).join(' OR '); // Use first 5 to stay within URL limits
      url = `${BASE_URL}?q=${encodeURIComponent(politicalQuery)}&language=en&sortBy=publishedAt&pageSize=30&apiKey=${NEWS_API_KEY}`;
    } else {
      // Combine interests, search, and political keywords
      let query = '';
      
      // Add user interests
      if (interests.length > 0) {
        query = interests.join(' OR ');
      }
      
      // Add search terms
      if (search && search.trim().length > 0) {
        query = query ? `${search} OR ${query}` : search;
      }
      
      // Ensure political context by adding political keywords
      const selectedPoliticalKeywords = politicalKeywords.slice(0, 3).join(' OR ');
      query = query ? `(${query}) AND (${selectedPoliticalKeywords})` : selectedPoliticalKeywords;
      
      url = `${BASE_URL}?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=30&apiKey=${NEWS_API_KEY}`;
    }
    
    console.log('Fetching political news from URL:', url);
    
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'ok' && Array.isArray(data.articles)) {
      // Additional filtering to ensure articles are political in nature
      const filteredArticles = data.articles.filter(article => {
        const titleAndDescription = `${article.title} ${article.description || ''}`.toLowerCase();
        return politicalKeywords.some(keyword => titleAndDescription.includes(keyword.toLowerCase()));
      });
      
      return filteredArticles.length > 0 ? filteredArticles : data.articles; // Fallback to all articles if filtering is too restrictive
    }
    return [];
  } catch (e) {
    console.error('Failed to fetch news:', e);
    return [];
  }
}

export async function fetchFullArticleContent(articleUrl: string): Promise<string | null> {
  try {
    const response = await fetch(articleUrl);
    const html = await response.text();
    
    // Enhanced content extraction with better cleaning
    const contentMatch = html.match(/<p[^>]*>(.*?)<\/p>/gis);
    if (contentMatch) {
      const cleanedParagraphs = contentMatch
        .map(p => {
          // Remove all HTML tags
          let cleaned = p.replace(/<[^>]*>/g, '');
          
          // Decode HTML entities
          cleaned = cleaned
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .replace(/&mdash;/g, '—')
            .replace(/&ndash;/g, '–')
            .replace(/&hellip;/g, '...');
          
          // Remove extra whitespace and normalize
          cleaned = cleaned.replace(/\s+/g, ' ').trim();
          
          return cleaned;
        })
        .filter(p => {
          // Filter out unwanted content
          if (p.length < 30) return false; // Too short
          if (p.length > 1000) return false; // Probably not a paragraph
          
          // Filter out common ad/navigation text
          const adPatterns = [
            /^\s*(advertisement|sponsored|related|more from|read more|click here|subscribe|newsletter|follow us|share this|trending|popular|recommended)\s*$/i,
            /^\s*(cookies?|privacy policy|terms of service|contact us|about us|support|help)\s*$/i,
            /^\s*\d+\s*(comment|share|like|view|read)\s*$/i,
            /^\s*(facebook|twitter|instagram|linkedin|youtube|social)\s*$/i,
            /^\s*(loading|please wait|error|404|not found)\s*$/i,
            /^\s*\$\d+/i, // Price indicators
            /^\s*\d+\/\d+\/\d+\s*$/i, // Just dates
            /^\s*by\s+\w+\s*$/i, // Just "by Author"
            /^\s*(home|news|sports|entertainment|politics|business|technology|health|lifestyle|opinion|weather)\s*$/i,
            /^\s*menu\s*$/i,
            /^\s*search\s*$/i,
            /^\s*(sign in|log in|register|account)\s*$/i
          ];
          
          return !adPatterns.some(pattern => pattern.test(p));
        })
        .filter(p => {
          // Additional content quality checks
          const words = p.split(/\s+/);
          
          // Must have reasonable word count
          if (words.length < 8 || words.length > 200) return false;
          
          // Must contain mostly letters (not just numbers/symbols)
          const letterCount = (p.match(/[a-zA-Z]/g) || []).length;
          const letterRatio = letterCount / p.length;
          if (letterRatio < 0.6) return false;
          
          // Filter out paragraphs that are mostly uppercase (likely headers/ads)
          const uppercaseCount = (p.match(/[A-Z]/g) || []).length;
          const uppercaseRatio = uppercaseCount / letterCount;
          if (uppercaseRatio > 0.7) return false;
          
          // Must contain some common article words
          const articleWords = /\b(the|and|or|but|in|on|at|to|for|of|with|by|from|up|about|into|through|during|before|after|above|below|between|among|around|while|since|until|because|although|however|therefore|thus|moreover|furthermore|nevertheless|meanwhile|consequently|accordingly)\b/gi;
          const commonWordMatches = (p.match(articleWords) || []).length;
          if (commonWordMatches < Math.max(2, words.length * 0.05)) return false;
          
          return true;
        })
        .slice(0, 15); // Take first 15 quality paragraphs
      
      if (cleanedParagraphs.length === 0) return null;
      
      // Join with proper paragraph spacing
      return cleanedParagraphs.join('\n\n');
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch full article content:', error);
    return null;
  }
} 