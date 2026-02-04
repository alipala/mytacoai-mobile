# i18n Implementation Guide

## Overview

MyTaco AI now supports 7 languages with automatic device language detection and user-selectable language preferences.

**Supported Languages:**
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Dutch (nl)
- Portuguese (pt)
- Turkish (tr)

## How It Works

1. **Auto-Detection**: App detects device language on first launch
2. **Persistence**: User's language choice is saved to AsyncStorage
3. **Real-Time Updates**: App updates immediately when language changes
4. **Fallback**: Defaults to English if device language is unsupported

## Basic Usage

### 1. Import the Hook

```typescript
import { useTranslation } from 'react-i18next';
```

### 2. Use in Components

```typescript
function MyComponent() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('auth.login.button_signin')}</Text>
      <Text>{t('dashboard.greeting.morning')}</Text>
    </View>
  );
}
```

### 3. With Interpolation (Dynamic Values)

```typescript
function GreetingComponent({ userName }) {
  const { t } = useTranslation();

  return (
    <Text>{t('dashboard.greeting.welcome', { name: userName })}</Text>
  );
}
```

### 4. Pluralization

```typescript
function SessionCounter({ count }) {
  const { t } = useTranslation();

  return (
    <Text>
      {count === 1
        ? t('units.sessions')
        : t('units.sessions_plural', { count })
      }
    </Text>
  );
}
```

## Translation Key Structure

All translations are organized in nested JSON structure:

```
en.json
├── auth
│   ├── login
│   │   ├── tab_signin: "Login"
│   │   ├── button_signin: "Sign In"
│   │   └── error_invalid_email: "Please enter a valid email"
│   └── forgot_password
│       └── title: "Reset Password"
├── dashboard
│   ├── tabs
│   │   ├── learn: "Learn"
│   │   └── profile: "Profile"
│   └── greeting
│       ├── morning: "Good morning"
│       └── afternoon: "Good afternoon"
└── ...
```

## Common Patterns

### Tab Labels

```typescript
<Tab.Screen
  name="Dashboard"
  options={{
    tabBarLabel: t('dashboard.tabs.learn'),
  }}
/>
```

### Button Text

```typescript
<TouchableOpacity onPress={handleSubmit}>
  <Text>{t('buttons.submit')}</Text>
</TouchableOpacity>
```

### Error Messages

```typescript
try {
  await loginUser(email, password);
} catch (error) {
  Alert.alert(
    t('modals.error.title'),
    t('auth.login.error_invalid_credentials')
  );
}
```

### Empty States

```typescript
{sessions.length === 0 && (
  <View>
    <Text>{t('empty_states.no_sessions')}</Text>
  </View>
)}
```

## Changing Language

### Programmatically

```typescript
import { changeLanguage } from '../i18n/config';

// Change to Spanish
await changeLanguage('es');
```

### Using the Language Selector Component

```typescript
import { LanguageSelector } from '../components/LanguageSelector';

function SettingsScreen() {
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  return (
    <View>
      <TouchableOpacity onPress={() => setShowLanguageSelector(true)}>
        <Text>Change Language</Text>
      </TouchableOpacity>

      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />
    </View>
  );
}
```

## Adding New Translations

### 1. Add to English File First (Master Template)

Edit `/src/locales/en.json`:

```json
{
  "my_new_feature": {
    "title": "My New Feature",
    "description": "Description of my feature",
    "button_action": "Take Action"
  }
}
```

### 2. Add to All Other Language Files

Translate the same keys in:
- `/src/locales/es.json`
- `/src/locales/fr.json`
- `/src/locales/de.json`
- `/src/locales/nl.json`
- `/src/locales/pt.json`
- `/src/locales/tr.json`

### 3. Use in Components

```typescript
const { t } = useTranslation();

<Text>{t('my_new_feature.title')}</Text>
```

## Best Practices

### 1. Always Use Translation Keys

❌ **Bad:**
```typescript
<Text>Login</Text>
```

✅ **Good:**
```typescript
<Text>{t('auth.login.tab_signin')}</Text>
```

### 2. Use Descriptive Keys

❌ **Bad:**
```json
{ "btn1": "Submit" }
```

✅ **Good:**
```json
{ "buttons.submit": "Submit" }
```

### 3. Group Related Keys

✅ **Good:**
```json
{
  "auth": {
    "login": { ... },
    "signup": { ... },
    "forgot_password": { ... }
  }
}
```

### 4. Keep Placeholders Consistent

```json
{
  "en": {
    "greeting": "Hello, {{name}}!"
  },
  "es": {
    "greeting": "¡Hola, {{name}}!"
  }
}
```

### 5. Test All Languages

- Test language switching in the app
- Verify UI doesn't break with longer text (German, Dutch)
- Check RTL support if adding Arabic/Hebrew later

## Debugging

### Check Current Language

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { i18n } = useTranslation();

  console.log('Current language:', i18n.language);
}
```

### List All Available Languages

```typescript
import { SUPPORTED_LANGUAGES } from '../i18n/config';

console.log('Supported languages:', SUPPORTED_LANGUAGES);
```

### Force Language (for Testing)

```typescript
import { changeLanguage } from '../i18n/config';

// Test Spanish translations
await changeLanguage('es');
```

## Common Issues

### Issue: Translation Not Showing

**Solution:** Check if key exists in translation file

```typescript
// Add fallback
{t('my.key') || 'Fallback Text'}
```

### Issue: Placeholder Not Replacing

**Solution:** Pass values correctly

```typescript
// ❌ Wrong
t('greeting.hello', userName)

// ✅ Correct
t('greeting.hello', { name: userName })
```

### Issue: Language Not Persisting

**Solution:** Use `changeLanguage()` function, not `i18n.changeLanguage()` directly

```typescript
// ❌ Wrong (no persistence)
i18n.changeLanguage('es')

// ✅ Correct (saves to AsyncStorage)
await changeLanguage('es')
```

## File Structure

```
src/
├── i18n/
│   ├── config.ts          # i18n configuration
│   └── README.md          # This file
├── locales/
│   ├── en.json            # English (master)
│   ├── es.json            # Spanish
│   ├── fr.json            # French
│   ├── de.json            # German
│   ├── nl.json            # Dutch
│   ├── pt.json            # Portuguese
│   └── tr.json            # Turkish
└── components/
    └── LanguageSelector.tsx  # Language picker UI
```

## Next Steps

1. Replace all hardcoded strings with `t()` calls
2. Test language switching in all screens
3. Add more languages as needed (expand `SUPPORTED_LANGUAGES`)
4. Consider adding language-specific date/time formatting
5. Consider adding language-specific number formatting

## Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [Expo Localization](https://docs.expo.dev/versions/latest/sdk/localization/)
