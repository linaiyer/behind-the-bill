# Improved AI Highlighting Test

## Test Cases That Should Now Work:

### ✅ Your Specific Examples:
- **"Rights and Endorsements Act"** - Should be detected by formal legislation pattern
- **"House Energy and Commerce Committee"** - Should be detected by congressional committee pattern

### ✅ Additional Examples That Should Work:
- "Clean Air Act"
- "Americans with Disabilities Act" 
- "Senate Judiciary Committee"
- "Ways and Means Committee"
- "Department of Health and Human Services"
- "H.R. 1234"
- "Infrastructure Investment and Jobs Act"

### ❌ Examples That Should NOT Be Highlighted:
- Just "Committee" by itself
- Just "Act" by itself
- "Sports Committee" (too generic)
- "Monday Committee" (non-political)

## Pattern Improvements Made:

1. **Comprehensive Legislation Pattern**: Now catches ANY capitalized phrase ending in Act/Bill/Law/etc.
2. **Enhanced Committee Detection**: Improved regex to catch "House Energy and Commerce Committee" type patterns
3. **Smarter Filtering**: Added validation to reduce false positives while maintaining comprehensive detection
4. **Better OpenAI Prompt**: More aggressive instructions to find all political entities

## How It Works:

1. **Multiple Pattern Types**: Uses both broad patterns and specific high-value terms
2. **Context Analysis**: Considers surrounding text to boost relevance scores
3. **Quality Filtering**: Validates terms to ensure they're actually political
4. **Overlap Prevention**: Removes duplicate and overlapping highlights
5. **Relevance Scoring**: Only highlights terms scoring 7+ out of 10

The system should now catch the specific examples you mentioned while maintaining high quality and avoiding false positives!