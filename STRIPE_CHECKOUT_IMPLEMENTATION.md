# Stripe Checkout Implementation for MyTaco AI Mobile

## Overview
This document describes the implementation of the Stripe checkout system for registered users in the MyTaco AI mobile app.

## Flow Steps
1. **Registered user logs in** - User authenticates via the login screen
2. **Dashboard shows subscription banner** - If user has a free/trial plan (try_learn), they see a notification banner
3. **User clicks "Upgrade" button** - Opens the pricing modal with plan options
4. **User selects a plan** - Can toggle between monthly and annual billing
5. **User clicks "Start Free Trial"** - Redirects to Stripe checkout in browser
6. **User completes payment** - Returns to the app and sees success screen

## Components Created

### 1. SubscriptionBanner Component
**Location**: `src/components/SubscriptionBanner.tsx`

A beautiful gradient banner that appears at the top of the Dashboard for free/trial users.

**Props**:
- `plan`: Current subscription plan name
- `sessionsRemaining`: Number of sessions remaining
- `onUpgradePress`: Callback when upgrade button is pressed
- `onDismiss`: Optional callback to dismiss the banner

**Features**:
- Only shows for `try_learn` plan users
- Gradient background with icon
- Dismissible with X button
- Haptic feedback on iOS

### 2. PricingModal Component
**Location**: `src/components/PricingModal.tsx`

A full-screen modal displaying available subscription plans with monthly/annual toggle.

**Props**:
- `visible`: Boolean to show/hide modal
- `onClose`: Callback to close modal
- `onSelectPlan`: Callback when a plan is selected (planId, period)

**Features**:
- Two plans: Fluency Builder & Language Mastery
- Toggle between monthly/annual pricing
- Shows savings for annual plans
- Detailed feature lists for each plan
- Popular badge for recommended plan
- iOS-style modal presentation

### 3. CheckoutScreen
**Location**: `src/screens/Subscription/CheckoutScreen.tsx`

Handles the creation of Stripe checkout session and redirects to Stripe.

**Route Params**:
- `planId`: The selected plan ID (fluency_builder or team_mastery)
- `period`: Billing period (monthly or annual)

**Flow**:
1. Gets price ID based on plan and period
2. Creates checkout session via API
3. Opens Stripe checkout URL in browser
4. Returns to dashboard after opening URL

**Error Handling**:
- Shows error screen if checkout fails
- Retry button to attempt again
- Back button to return to dashboard

### 4. CheckoutSuccessScreen
**Location**: `src/screens/Subscription/CheckoutSuccessScreen.tsx`

Success screen shown after completing Stripe checkout.

**Features**:
- Success animation with checkmark
- Lists activated benefits
- Continue button to return to dashboard
- Trial information reminder

## Navigation Updates

### App.js Changes
Added new routes to the Stack Navigator:
```javascript
<Stack.Screen name="Checkout" component={CheckoutScreen} />
<Stack.Screen name="CheckoutSuccess" component={CheckoutSuccessScreen} />
```

### Navigation Flow
1. Dashboard → Pricing Modal (shown as modal)
2. Pricing Modal → Checkout Screen (via navigation)
3. Checkout Screen → External Stripe URL
4. Return → Dashboard or CheckoutSuccess

## Dashboard Integration

### Changes to DashboardScreen.tsx
1. **Imports**: Added SubscriptionBanner, PricingModal, and StripeService
2. **State**: Added subscription status, pricing modal visibility, and banner dismiss state
3. **Data Loading**: Fetches subscription status along with learning plans
4. **Handlers**:
   - `handleUpgradePress()`: Opens pricing modal
   - `handleDismissBanner()`: Dismisses the banner
   - `handleSelectPlan()`: Navigates to checkout with plan details
5. **Rendering**:
   - Shows SubscriptionBanner when user has try_learn plan
   - Includes PricingModal at component level
   - Banner appears in both normal and empty states

## API Integration

### Endpoints Used
1. **GET** `/api/stripe/subscription-status`
   - Gets user's current subscription details
   - Returns plan, limits, trial info

2. **POST** `/api/stripe/create-checkout-session`
   - Creates a new Stripe checkout session
   - Body: `{ price_id, success_url, cancel_url, guest_checkout }`
   - Returns: `{ url }` - Stripe checkout URL

### Price ID Mapping
Located in `CheckoutScreen.tsx`:
```typescript
const PRICE_IDS = {
  fluency_builder: {
    monthly: 'price_1RdxNjJcquSiYwWN2XQMwwYW',
    annual: 'price_fluency_builder_annual',
  },
  team_mastery: {
    monthly: 'price_team_mastery_monthly',
    annual: 'price_team_mastery_annual',
  },
};
```

**Note**: You need to update the annual and team_mastery price IDs with your actual Stripe price IDs.

## Deep Linking Configuration

For returning from Stripe checkout, the app uses deep links:
- Success: `mytacoai://checkout-success`
- Cancel: `mytacoai://checkout-cancel`

### To Configure Deep Links:
1. **iOS**: Update `Info.plist` with URL schemes
2. **Android**: Update `AndroidManifest.xml` with intent filters

Example for app.json:
```json
{
  "expo": {
    "scheme": "mytacoai"
  }
}
```

## Testing Instructions

### 1. Test with Free/Trial User
1. Login with a user that has `try_learn` plan
2. Verify subscription banner appears on Dashboard
3. Click "Upgrade" button
4. Verify pricing modal opens

### 2. Test Plan Selection
1. Toggle between Monthly and Annual
2. Verify prices update correctly
3. Verify savings badge appears for annual
4. Select "Start Free Trial" on Fluency Builder

### 3. Test Checkout Flow
1. Verify loading screen appears
2. App should open Stripe checkout in browser
3. Complete test payment (use Stripe test card: 4242 4242 4242 4242)
4. App should return to dashboard

### 4. Test Error Handling
1. Turn off internet connection
2. Try to start checkout
3. Verify error screen appears
4. Verify "Try Again" button works

## Stripe Test Cards
- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **Requires authentication**: 4000 0025 0000 3155

Use any future expiry date and any CVC.

## Environment Variables Required
Make sure your backend has these configured:
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- Price IDs for all plan/period combinations

## Files Modified
1. `App.js` - Added navigation routes
2. `src/screens/Dashboard/DashboardScreen.tsx` - Integrated subscription UI

## Files Created
1. `src/components/SubscriptionBanner.tsx`
2. `src/components/PricingModal.tsx`
3. `src/screens/Subscription/CheckoutScreen.tsx`
4. `src/screens/Subscription/CheckoutSuccessScreen.tsx`
5. `src/screens/Subscription/index.ts`

## Next Steps
1. Update Stripe price IDs in `CheckoutScreen.tsx`
2. Configure deep linking in app.json/Info.plist
3. Test with real Stripe test mode
4. Handle webhook events on backend
5. Add analytics tracking for conversion funnel
6. Implement subscription management screen (cancel, upgrade, downgrade)

## Known Limitations
1. Deep linking setup required for full flow completion
2. Success screen currently navigates via timeout, should use deep link
3. Annual and team_mastery price IDs need to be configured
4. Subscription status refresh after purchase needs implementation

## Troubleshooting

### Banner not showing
- Check if user has `try_learn` plan
- Check if `subscriptionStatus` is loaded
- Check if banner was dismissed

### Checkout fails
- Verify auth token is valid
- Check backend API is accessible
- Verify price IDs match Stripe dashboard

### Deep links not working
- Verify app.json has correct scheme
- Rebuild app after changing deep link config
- Check URL scheme matches in Stripe success/cancel URLs
