// Test the highlighting patterns
import { aiHighlightingService } from '../aiHighlightingService';

// Test function to verify our patterns work
export async function testHighlightingPatterns() {
  console.log('Testing AI Highlighting Patterns...');
  
  const testText = `
  The Rights and Endorsements Act was discussed by the House Energy and Commerce Committee today. 
  Senator Johnson spoke about H.R. 1234 and the Infrastructure Investment and Jobs Act.
  The Department of Health and Human Services issued new guidelines, while the EPA announced regulations.
  The Ways and Means Committee will review the tax legislation next week.
  Medicare and Social Security programs were also mentioned in the hearing.
  The Federal Reserve and Supreme Court were referenced in the debate.
  `;
  
  try {
    const results = await aiHighlightingService.highlightPoliticalTerms(testText);
    
    console.log(`\nTest Text:\n${testText}`);
    console.log(`\nFound ${results.length} highlighted terms:\n`);
    
    results.forEach((term, index) => {
      console.log(`${index + 1}. "${term.fullPhrase}"`);
      console.log(`   Category: ${term.category}`);
      console.log(`   Relevance: ${term.relevanceScore}/10`);
      console.log(`   Position: ${term.startIndex}-${term.endIndex}`);
      console.log(`   Explanation: ${term.explanation}\n`);
    });
    
    // Check if our specific examples are found
    const foundTerms = results.map(r => r.fullPhrase.toLowerCase());
    const expectedTerms = [
      'rights and endorsements act',
      'house energy and commerce committee',
      'infrastructure investment and jobs act',
      'department of health and human services',
      'ways and means committee'
    ];
    
    console.log('Expected Terms Check:');
    expectedTerms.forEach(expected => {
      const found = foundTerms.some(found => found.includes(expected));
      console.log(`✓ ${expected}: ${found ? 'FOUND' : 'MISSING'}`);
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Export for potential use
export { testHighlightingPatterns as default };