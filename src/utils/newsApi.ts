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
      content: `Congressional leaders continue negotiations on infrastructure spending as the deadline for key legislation approaches. The proposed bill includes significant funding for roads, bridges, broadband expansion, and green energy initiatives across the United States.

House Speaker and Senate Majority Leader held a joint press conference yesterday to outline the key provisions of the legislation. The bill allocates $1.2 trillion over eight years for various infrastructure projects, with particular emphasis on modernizing the nation's aging transportation networks.

Republican leadership has expressed concerns about the scope and cost of the proposed legislation. Senator Johnson stated, "While we all agree that infrastructure investment is necessary, we must ensure fiscal responsibility and focus on truly essential projects that will benefit all Americans."

The legislation includes provisions for electric vehicle charging stations, high-speed rail connections between major metropolitan areas, and upgrading the electrical grid to handle renewable energy sources. Environmental groups have praised these elements as crucial steps toward addressing climate change.

Labor unions have thrown their support behind the bill, citing the potential for millions of new jobs in construction, manufacturing, and technology sectors. AFL-CIO President emphasized that the legislation would create good-paying union jobs while rebuilding America's infrastructure.

The White House has indicated strong support for the measure and is working closely with congressional leadership to secure the necessary votes for passage. President Biden is expected to make a major speech next week highlighting the economic benefits of the infrastructure investment.

Economists project that the infrastructure spending could boost GDP growth by 1.5% annually and create approximately 2.3 million jobs over the next five years. The Congressional Budget Office is currently analyzing the long-term fiscal impact of the proposed legislation.

The debate is expected to continue over the coming weeks as lawmakers seek to address concerns from various stakeholders while maintaining momentum for this significant investment in America's future.`
    },
    {
      source: { id: "fallback", name: "Washington Post" },
      author: "Political Reporter",
      title: "Supreme Court Reviews Key Constitutional Case",
      description: "The nation's highest court is set to hear arguments in a landmark case that could reshape federal oversight powers.",
      url: `https://example.com/supreme-court-case-${timestamp + 1}`,
      urlToImage: null,
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      content: `Supreme Court justices will review constitutional questions in a landmark case that could fundamentally alter the balance of power between federal agencies and the courts. The case, which centers on the scope of administrative authority, has drawn attention from legal scholars and constitutional experts nationwide.

The legal challenge stems from a dispute over federal agency rulemaking authority and whether agencies can interpret ambiguous statutory language without explicit congressional direction. This question goes to the heart of the administrative state and how federal regulations are created and enforced.

Chief Justice Roberts indicated during oral arguments that the Court is carefully considering the implications for existing precedent while evaluating the constitutional principles at stake. The case has generated amicus briefs from dozens of organizations representing various sectors of the economy.

Justice Thomas pressed attorneys on the historical foundations of administrative power, asking whether the founders intended for agencies to wield such broad interpretive authority. Legal experts suggest this line of questioning could signal a willingness to revisit long-standing judicial precedents.

The business community has shown significant interest in the outcome, with many corporations arguing that regulatory uncertainty hampers economic growth and investment. Environmental groups counter that limiting agency authority could undermine critical protections for public health and safety.

Constitutional law professors note that the case represents a potential inflection point in administrative law. Professor Smith of Harvard Law School observed, "This case could reshape how we understand the relationship between Congress, federal agencies, and the courts for decades to come."

The Department of Justice has defended the current framework, arguing that agencies possess specialized expertise necessary to implement complex regulatory schemes. Solicitor General emphasized that agencies remain accountable through various oversight mechanisms.

A decision is expected by the end of the current term, with implementation likely to have far-reaching consequences across multiple areas of federal regulation including environmental protection, financial oversight, and healthcare policy.`
    },
    {
      source: { id: "fallback", name: "Reuters" },
      author: "News Staff",
      title: "White House Announces New Policy Initiative",
      description: "Administration officials unveiled a comprehensive plan addressing key domestic priorities ahead of the upcoming legislative session.",
      url: `https://example.com/white-house-policy-${timestamp + 2}`,
      urlToImage: null,
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      content: `The White House announced new policy measures designed to address rising costs and strengthen economic opportunities for American families. The comprehensive initiative includes targeted tax relief, expanded healthcare access, and investments in workforce development programs.

Press Secretary outlined the three-pillar approach during today's briefing, emphasizing the administration's commitment to tackling affordability challenges while promoting long-term economic growth. The plan builds on previous legislative achievements while introducing new mechanisms for supporting middle-class families.

The first pillar focuses on reducing prescription drug costs through enhanced Medicare negotiation powers and expanded generic drug availability. Health officials estimate these measures could save consumers billions annually while maintaining incentives for pharmaceutical innovation.

Education and workforce development form the second major component, with proposed expansions to community college partnerships and apprenticeship programs. The Department of Labor will oversee implementation of new training initiatives targeting high-demand sectors including renewable energy and advanced manufacturing.

Tax policy changes constitute the third pillar, featuring enhanced child tax credits and small business deductions. Treasury officials indicate the measures are designed to provide immediate relief while maintaining fiscal responsibility through targeted revenue enhancements.

Republican lawmakers have expressed skepticism about the scope and funding mechanisms of the proposal. House Minority Leader stated, "While we support helping American families, we need to ensure these policies are sustainable and don't burden future generations with additional debt."

Business organizations have offered mixed reactions, with manufacturing groups praising workforce development aspects while expressing concerns about regulatory components. The Chamber of Commerce called for bipartisan dialogue to address implementation challenges.

The administration plans to work with congressional leadership on legislative pathways for the initiative, with initial committee hearings expected to begin next month. Implementation timelines vary by component, with some measures requiring immediate action while others involve longer-term planning horizons.`
    },
    {
      source: { id: "fallback", name: "Associated Press" },
      author: "AP News",
      title: "State Governors Meet to Discuss Federal Relations",
      description: "A bipartisan group of governors gathered to address the evolving relationship between state and federal governments on key issues.",
      url: `https://example.com/governors-meeting-${timestamp + 3}`,
      urlToImage: null,
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      content: `State governors from across the nation convened for their annual summit to address pressing issues of federalism and interstate cooperation. The three-day gathering focused on healthcare, infrastructure, and emergency response coordination between state and federal authorities.

Governor Martinez of New Mexico, serving as chair of the National Governors Association, emphasized the importance of collaborative approaches to solving complex policy challenges. "States serve as laboratories of democracy, and our experiences can inform effective federal policy," she stated during opening remarks.

Healthcare policy dominated much of the discussion, with governors sharing experiences from Medicaid expansion and state-based health insurance marketplaces. Several governors reported success with innovative programs that could serve as models for federal implementation.

Governor Thompson of Wisconsin highlighted his state's workforce development initiatives, particularly programs connecting unemployed workers with emerging technology sectors. "We've seen remarkable success in retraining programs that bridge the skills gap while supporting economic development," he noted.

Emergency management and disaster response coordination emerged as another key theme. Recent natural disasters have underscored the importance of seamless cooperation between federal agencies and state emergency management systems. Governors called for streamlined communication protocols and resource allocation mechanisms.

The bipartisan nature of the summit was evident in collaborative discussions about infrastructure needs. Republican and Democratic governors found common ground on the importance of federal investment in state transportation networks, broadband expansion, and water system upgrades.

Several governors announced new interstate compacts addressing regional challenges including water rights, transportation coordination, and shared economic development initiatives. These agreements demonstrate states' capacity for solving problems that cross jurisdictional boundaries.

Federal officials participating in the summit praised states' leadership on policy innovation while acknowledging areas where federal coordination could be improved. Deputy Secretary Johnson committed to enhanced consultation with states on regulatory development processes.

The summit concluded with a joint declaration emphasizing the importance of federal-state partnerships in addressing 21st-century challenges while respecting constitutional principles of federalism and state sovereignty.`
    },
    {
      source: { id: "fallback", name: "CNN Politics" },
      author: "Political Team",
      title: "House Committee Advances Regulatory Reform Bill",
      description: "The House oversight committee moved forward with legislation aimed at streamlining federal regulatory processes.",
      url: `https://example.com/regulatory-reform-${timestamp + 4}`,
      urlToImage: null,
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      content: `House committee members voted to advance regulatory reform legislation designed to increase transparency and efficiency in federal agency rulemaking processes. The bipartisan measure passed the oversight committee by a vote of 23-17, setting the stage for floor consideration.

The legislation requires agencies to conduct more comprehensive economic impact analyses before implementing new regulations, particularly those affecting small businesses and rural communities. Supporters argue these measures will prevent unnecessary regulatory burdens while maintaining essential protections.

Committee Chair Representative Davis emphasized that the bill strikes an appropriate balance between regulatory oversight and agency flexibility. "We want agencies to have the tools they need to protect Americans while ensuring they consider the real-world impacts of their decisions," Davis explained.

Ranking Member Representative Lee expressed concerns about potential delays in critical safety and environmental regulations. "While we support regulatory efficiency, we cannot allow this process to undermine protections that save lives and protect our environment," Lee stated during committee debate.

The bill includes provisions for enhanced public comment periods and requirements for agencies to respond to substantive comments from stakeholders. Small business advocates have praised these elements as crucial for ensuring diverse voices are heard in the regulatory process.

Environmental organizations have raised questions about the legislation's potential impact on climate and pollution regulations. Several groups argue that extended review processes could delay urgent action on environmental challenges facing communities nationwide.

Business groups across multiple sectors have endorsed the measure, citing the need for predictable and science-based regulatory frameworks. The National Association of Manufacturers highlighted the bill's provisions for regulatory cost-benefit analysis as particularly important for maintaining American competitiveness.

Federal agency officials have indicated willingness to work with Congress on regulatory efficiency while expressing concerns about unfunded mandates that could strain administrative resources. Office of Management and Budget representatives participated in committee hearings throughout the legislative development process.

The bill now moves to the House floor, where leadership has indicated it will be considered under regular order with opportunities for amendments. Senate counterparts have introduced similar legislation, suggesting potential for bicameral action on regulatory reform this session.`
    }
  ];
}

export async function fetchFullArticleContent(articleUrl: string): Promise<string | null> {
  try {
    // Check if this is a fallback article URL
    if (articleUrl.includes('example.com')) {
      console.log('Detected fallback article, content should be in the article object itself');
      // For fallback articles, the content is already in the article object
      // We return null here so the ArticleReaderScreen uses article.content
      return null;
    }
    
    console.log('Fetching full content from:', articleUrl);
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