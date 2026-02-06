/**
 * Script to find all hardcoded strings in major screens
 * This helps identify which strings need to be replaced with t() calls
 */

const fs = require('fs');
const path = require('path');

const screenPaths = [
  './src/screens/Dashboard/DashboardScreen.tsx',
  './src/screens/Profile/ProfileScreen.tsx',
  './src/screens/Auth/LoginScreen.tsx',
  './src/screens/Practice/ConversationScreen.tsx',
  './src/screens/Explore/ExploreScreenRedesigned.tsx',
  './src/screens/News/NewsListScreen.tsx',
];

// Regex to find strings in JSX (between quotes in Text components, etc.)
const stringRegex = /<Text[^>]*>([^<{]+)<\/Text>|placeholder=["']([^"']+)["']|title=["']([^"']+)["']/g;

console.log('🔍 Searching for hardcoded strings in major screens...\n');

screenPaths.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = [];
    let match;

    while ((match = stringRegex.exec(content)) !== null) {
      const text = match[1] || match[2] || match[3];
      if (text && text.trim() && !text.includes('{{') && !text.includes('t(')) {
        matches.push(text.trim());
      }
    }

    if (matches.length > 0) {
      console.log(`📄 ${path.basename(filePath)}: ${matches.length} strings found`);
      const unique = [...new Set(matches)].slice(0, 10);
      unique.forEach(str => console.log(`   - "${str}"`));
      if (matches.length > 10) {
        console.log(`   ... and ${matches.length - 10} more\n`);
      }
    }
  } catch (error) {
    console.log(`❌ Error reading ${filePath}: ${error.message}`);
  }
});

console.log('\n✅ Scan complete!');
