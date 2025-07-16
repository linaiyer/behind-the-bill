export const APP_VERSION = '1.0.0';
export const APP_NAME = 'Behind the Bill';
export const APP_DESCRIPTION = 'AI-powered political news analysis and context';

export function getAppInfo() {
  return {
    name: APP_NAME,
    version: APP_VERSION,
    description: APP_DESCRIPTION,
    buildDate: new Date().toLocaleDateString(),
  };
}

export function getAboutText() {
  return `${APP_NAME} v${APP_VERSION}

${APP_DESCRIPTION}

Features:
• AI-powered term highlighting
• Comprehensive political context
• Legislative impact simulation
• Personalized news feed
• Political chat assistance

Built with React Native and powered by OpenAI.`;
}

export function getPrivacyPolicyText() {
  return `Privacy Policy

Your privacy is important to us. We collect minimal data necessary to provide personalized political news and analysis.

Data We Collect:
• Account information (email, name)
• Reading preferences and interests
• Article reading history (stored locally)
• Optional OpenAI API key (encrypted)

Data We Don't Collect:
• Personal identifying information beyond email
• Location data
• Browsing history outside the app
• Political affiliations or voting records

Data Usage:
• Personalizing your news feed
• Improving AI recommendations
• Providing relevant political context
• Enhancing app functionality

Your data is never sold or shared with third parties except as required to provide core app functionality (e.g., news APIs).

Contact us at lina@codefornonprofit.org for questions.`;
}

export function getSupportText() {
  return `Help & Support

Need assistance? We're here to help!

Common Issues:
• AI highlighting not working: Check your OpenAI API key in Settings > AI Highlighting
• Articles not loading: Check your internet connection
• Context not generating: Ensure you have a valid OpenAI API key or use local fallback

Contact Options:
• Email: lina@codefornonprofit.org
• In-app feedback: Use the feedback option in Settings

For technical issues:
• Restart the app if you experience any problems
• Check your internet connection for news loading issues
• Ensure you have the latest version of the app

Report bugs or suggest features by emailing us directly.`;
}