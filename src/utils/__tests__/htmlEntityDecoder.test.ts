// Test for HTML entity decoder
import { decodeHtmlEntities, cleanNewsText } from '../htmlEntityDecoder';

// Simple test function
function testHtmlDecoding() {
  console.log('Testing HTML Entity Decoder...');
  
  // Test numeric entities and code removal
  const testCases = [
    {
      input: 'The &#8220;Big Beautiful Bill&#8221; was passed today.',
      expected: 'The "Big Beautiful Bill" was passed today.',
      description: 'Numeric quote entities'
    },
    {
      input: 'Congress didn&#8217;t vote on the proposal.',
      expected: "Congress didn't vote on the proposal.",
      description: 'Numeric apostrophe entity'
    },
    {
      input: 'The bill &amp; amendments were &quot;controversial&quot;.',
      expected: 'The bill & amendments were "controversial".',
      description: 'Named entities'
    },
    {
      input: 'Budget deficit&mdash;$1.5 trillion&mdash;is concerning.',
      expected: 'Budget deficit—$1.5 trillion—is concerning.',
      description: 'Em dash entities'
    },
    {
      input: 'The president&rsquo;s speech was about healthcare&hellip;',
      expected: "The president's speech was about healthcare...",
      description: 'Mixed entities'
    },
    {
      input: 'The committee voted. var disqus_config = function() {this.page.url = "https://example.com"}; The bill passed.',
      expected: 'The committee voted. The bill passed.',
      description: 'JavaScript code removal'
    },
    {
      input: 'Important news here. function analytics() { gtag("event"); } More content.',
      expected: 'Important news here. More content.',
      description: 'JavaScript function removal'
    },
    {
      input: 'Political story. Check https://www.example.com/article for more. Continue reading.',
      expected: 'Political story. Check for more. Continue reading.',
      description: 'URL removal'
    }
  ];
  
  testCases.forEach((testCase, index) => {
    const result = decodeHtmlEntities(testCase.input);
    const cleanResult = cleanNewsText(testCase.input);
    
    console.log(`\nTest ${index + 1}: ${testCase.description}`);
    console.log(`Input: "${testCase.input}"`);
    console.log(`Decoded: "${result}"`);
    console.log(`Cleaned: "${cleanResult}"`);
    console.log(`Expected: "${testCase.expected}"`);
    console.log(`✓ Decode Pass: ${result === testCase.expected}`);
    console.log(`✓ Clean Pass: ${cleanResult === testCase.expected}`);
  });
  
  console.log('\nHTML Entity Decoder tests completed.');
}

// Export for potential use
export { testHtmlDecoding };