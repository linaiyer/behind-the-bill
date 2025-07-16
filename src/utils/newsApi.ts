import { cleanNewsText } from './htmlEntityDecoder';

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
    console.log('fetchNewsArticles called with:', { interests, search });
    let url;
    // US political keywords
    const usPoliticalKeywords = [
      'us politics', 'united states politics', 'american government', 'us congress', 'us senate', 'us house', 'biden', 'trump', 'us election', 'us policy', 'us bill', 'us legislation', 'us vote', 'democrat', 'republican', 'supreme court', 'white house', 'washington', 'capitol hill', 'federal government', 'state government', 'governor', 'mayor', 'us law', 'us administration', 'us president', 'us political', 'us campaign', 'us justice', 'us regulatory', 'us department', 'us agency', 'us supreme court', 'us constitution', 'us reform', 'us act', 'us program', 'us party', 'us committee', 'us state', 'us city', 'us policy', 'us politics news', 'us political news'
    ];
    // If no interests and no search, fetch US political news
    if (interests.length === 0 && (!search || search.trim().length === 0)) {
      const politicalQuery = usPoliticalKeywords.slice(0, 5).join(' OR ');
      url = `${BASE_URL}?q=${encodeURIComponent(politicalQuery)}&language=en&sortBy=publishedAt&pageSize=30&apiKey=${NEWS_API_KEY}`;
    } else {
      let query = '';
      if (interests.length > 0) {
        query = interests.join(' OR ');
      }
      if (search && search.trim().length > 0) {
        query = query ? `${search} OR ${query}` : search;
      }
      const selectedPoliticalKeywords = usPoliticalKeywords.slice(0, 3).join(' OR ');
      query = query ? `(${query}) AND (${selectedPoliticalKeywords})` : selectedPoliticalKeywords;
      url = `${BASE_URL}?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=30&apiKey=${NEWS_API_KEY}`;
    }
    
    console.log('Fetching from URL:', url);
    const res = await fetch(url);
    const data = await res.json();
    console.log('API Response status:', res.status, 'Data status:', data.status);
    console.log('Raw articles count:', data.articles?.length || 0);
    
    if (data.status === 'ok' && Array.isArray(data.articles)) {
      const processedArticles = data.articles.map((article: any) => ({
        ...article,
        title: cleanNewsText(article.title || ''),
        description: cleanNewsText(article.description || ''),
        content: cleanNewsText(article.content || '')
      }));
      // Filter for US political articles
      const filteredArticles = processedArticles.filter((article: any) => {
        const titleAndDescription = `${article.title} ${article.description || ''}`.toLowerCase();
        return usPoliticalKeywords.some(keyword => (
          titleAndDescription.includes(keyword.replace('us ', '').toLowerCase()) ||
          titleAndDescription.includes('united states') ||
          titleAndDescription.includes('america') ||
          titleAndDescription.includes('washington') ||
          titleAndDescription.includes('capitol hill')
        ));
      });
      console.log('Filtered articles count:', filteredArticles.length);
      console.log('Processed articles count:', processedArticles.length);
      
      const finalArticles = filteredArticles.length > 0 ? filteredArticles : processedArticles;
      
      // If we still have no articles, return fallback
      if (finalArticles.length === 0) {
        console.log('No articles found, returning fallback articles');
        return getFallbackArticles();
      }
      
      return finalArticles;
    } else {
      console.log('API Error or no articles:', data);
      return getFallbackArticles();
    }
  } catch (e) {
    console.error('fetchNewsArticles error:', e);
    // Return fallback mock articles if API fails
    return getFallbackArticles();
  }
}

// Fallback articles in case API fails
function getFallbackArticles(): NewsArticle[] {
  const timestamp = Date.now();
  return [
    {
      source: { id: "fallback", name: "Political News" },
      author: "News Team",
      title: "Congress Debates Infrastructure Spending Bill",
      description: "Lawmakers on Capitol Hill are engaged in heated discussions over the proposed infrastructure spending package, with both parties presenting different visions for America's future.",
      url: `https://example.com/congress-infrastructure-${timestamp}`,
      urlToImage: null,
      publishedAt: new Date().toISOString(),
      content: "Congressional leaders continue negotiations on infrastructure spending..."
    },
    {
      source: { id: "fallback", name: "Washington Post" },
      author: "Political Reporter",
      title: "Supreme Court Reviews Key Constitutional Case",
      description: "The nation's highest court is set to hear arguments in a landmark case that could reshape federal oversight powers.",
      url: `https://example.com/supreme-court-case-${timestamp + 1}`,
      urlToImage: null,
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      content: "Supreme Court justices will review constitutional questions..."
    },
    {
      source: { id: "fallback", name: "Reuters" },
      author: "News Staff",
      title: "White House Announces New Policy Initiative",
      description: "Administration officials unveiled a comprehensive plan addressing key domestic priorities ahead of the upcoming legislative session.",
      url: `https://example.com/white-house-policy-${timestamp + 2}`,
      urlToImage: null,
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      content: "The White House announced new policy measures..."
    },
    {
      source: { id: "fallback", name: "Associated Press" },
      author: "AP News",
      title: "State Governors Meet to Discuss Federal Relations",
      description: "A bipartisan group of governors gathered to address the evolving relationship between state and federal governments on key issues.",
      url: `https://example.com/governors-meeting-${timestamp + 3}`,
      urlToImage: null,
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      content: "State governors from across the nation convened..."
    },
    {
      source: { id: "fallback", name: "CNN Politics" },
      author: "Political Team",
      title: "House Committee Advances Regulatory Reform Bill",
      description: "The House oversight committee moved forward with legislation aimed at streamlining federal regulatory processes.",
      url: `https://example.com/regulatory-reform-${timestamp + 4}`,
      urlToImage: null,
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      content: "House committee members voted to advance regulatory reform..."
    }
  ];
}

export async function fetchFullArticleContent(articleUrl: string): Promise<string | null> {
  try {
    const response = await fetch(articleUrl);
    let html = await response.text();
    
    // Remove script and style tags completely first
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    html = html.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');
    
    // Remove common ad/tracking containers
    html = html.replace(/<div[^>]*(?:class|id)=["'][^"']*(?:ad|advertisement|disqus|comment|social|share|tracking|analytics)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
    
    // Enhanced content extraction with better cleaning
    const contentMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
    if (contentMatch) {
      const cleanedParagraphs = contentMatch
        .map(p => {
          // Use comprehensive HTML entity decoder and text cleaner
          return cleanNewsText(p);
        })
        .filter(p => {
          // Filter out unwanted content
          if (p.length < 30) return false; // Too short
          if (p.length > 1000) return false; // Probably not a paragraph
          
          // Filter out common ad/navigation text and code
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
          
          // Filter out code and technical content
          const codePatterns = [
            /\b(var|let|const|function)\s+\w+/i, // JavaScript declarations
            /\bthis\.\w+\.\w+/i, // this.property.method patterns
            /https?:\/\/[^\s]+/i, // URLs
            /\bdisqus_config\b/i, // Disqus specific
            /\bgtag\b|\banalytics\b|\btracking\b/i, // Analytics code
            /\{[^}]*\}/i, // Object literals
            /\[[^\]]*\]/i, // Array literals
            /\w+\(\s*\)/i, // Function calls
            /\w+\s*:\s*[\w\d]+/i, // Property: value pairs
            /\/[\/\w.-]+\.(js|css|php|html)/i, // File paths
            /\b0x[0-9a-f]+\b/i, // Hex numbers
            /\b[a-f0-9]{8,}\b/i // Long hex strings
          ];
          
          return !adPatterns.some(pattern => pattern.test(p)) && 
                 !codePatterns.some(pattern => pattern.test(p));
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