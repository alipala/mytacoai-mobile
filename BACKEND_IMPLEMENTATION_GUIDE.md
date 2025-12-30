# Backend Implementation Guide: Heart System for Language Learning App

**For: Backend Coding Agent**
**From: Mobile App Team**
**Branch:** `claude/improve-challenges-heart-system-GWf2O`
**Repository:** alipala/mytacoai-mobile

---

## 🎯 WHAT YOU NEED TO BUILD

The mobile app has a **fully functional heart/focus system** (like Duolingo) running locally with AsyncStorage. Your job is to:

1. **Build 4 API endpoints** to persist heart state to MongoDB
2. **Replicate the business logic** from mobile (daily reset, gradual refill, streak shields)
3. **Integrate with Stripe** to manage subscription tiers
4. **Replace AsyncStorage calls** with your API endpoints

**Tech Stack:**
- FastAPI (Python)
- MongoDB
- Stripe (subscription management)
- JWT Authentication

---

## 📱 WHAT MOBILE APP ALREADY BUILT

The mobile team has **completely implemented** the heart system locally. Here's what exists:

### Core Features (All Working)
✅ **6 Challenge Types** with separate heart pools:
- `error_spotting`
- `swipe_fix`
- `micro_quiz`
- `smart_flashcard`
- `native_check`
- `brain_tickler`

✅ **Subscription Tiers:**
- `free`: 5 hearts, 3-hour refill
- `fluency_builder`: 10 hearts, 2-hour refill
- `language_mastery`: Unlimited hearts

✅ **Streak Shield System:**
- 3 correct answers in a row = shield active
- Shield blocks next wrong answer (no heart loss)
- Shield consumed on wrong answer, streak resets

✅ **Daily Reset:**
- All hearts refill to max at midnight (user timezone)
- Last reset timestamp tracked

✅ **Gradual Refill:**
- 1 heart refills every interval (3hrs free, 2hrs fluency builder)
- Multiple hearts refill if enough time passed

✅ **Challenge Screen Integrations:**
- Heart consumption on wrong answers
- Streak tracking on correct answers
- Shield usage
- "Out of Hearts" modal
- Heart loss animations
- Refill timer UI

### Mobile Code Files (Reference)
```
src/contexts/FocusContext.tsx          - Complete heart management logic
src/types/focus.ts                     - Type definitions & constants
src/components/HeartDisplay.tsx        - Heart UI with refill timer
src/components/HeartLossAnimation.tsx  - Broken heart animation
src/components/OutOfHeartsModal.tsx    - Out of hearts modal
src/components/StreakShieldIndicator.tsx - Shield status UI
```

---

## 🗄️ DATA STRUCTURE YOU NEED TO PERSIST

The mobile app currently stores this in AsyncStorage. You need to persist it in **MongoDB**.

### MongoDB Schema: `user_focus_states` Collection

```javascript
{
  _id: ObjectId("..."),
  user_id: "user_abc123",  // Reference to users collection
  subscription_tier: "free",  // "free" | "fluency_builder" | "language_mastery"

  // 6 separate challenge type pools
  error_spotting: {
    current: 5,
    max: 5,
    last_refill: ISODate("2025-01-15T10:30:00Z")
  },
  swipe_fix: {
    current: 5,
    max: 5,
    last_refill: ISODate("2025-01-15T10:30:00Z")
  },
  micro_quiz: {
    current: 3,  // User lost 2 hearts
    max: 5,
    last_refill: ISODate("2025-01-15T12:00:00Z")
  },
  smart_flashcard: {
    current: 5,
    max: 5,
    last_refill: ISODate("2025-01-15T10:30:00Z")
  },
  native_check: {
    current: 5,
    max: 5,
    last_refill: ISODate("2025-01-15T10:30:00Z")
  },
  brain_tickler: {
    current: 0,  // User ran out of hearts
    max: 5,
    last_refill: ISODate("2025-01-15T09:00:00Z")
  },

  // Shield/Streak state
  shield: {
    is_active: true,
    correct_answers_streak: 3,
    required_streak: 3
  },

  // Daily reset tracking
  last_daily_reset: ISODate("2025-01-15T00:00:00Z"),
  user_timezone: "America/New_York",

  // Timestamps
  created_at: ISODate("2025-01-10T08:00:00Z"),
  updated_at: ISODate("2025-01-15T12:30:00Z")
}
```

---

## ⚙️ SUBSCRIPTION TIER CONFIGURATIONS

Replicate these exact values from mobile app:

```python
# Backend constants (src/types/focus.ts equivalent)

FOCUS_CONFIGS = {
    "free": {
        "max_hearts": 5,
        "refill_interval_ms": 10800000,  # 3 hours
        "refill_interval_hours": 3,
        "unlimited_hearts": False
    },
    "fluency_builder": {
        "max_hearts": 10,
        "refill_interval_ms": 7200000,  # 2 hours
        "refill_interval_hours": 2,
        "unlimited_hearts": False
    },
    "language_mastery": {
        "max_hearts": float('inf'),  # Unlimited
        "refill_interval_ms": None,
        "refill_interval_hours": None,
        "unlimited_hearts": True
    }
}

CHALLENGE_TYPES = [
    "error_spotting",
    "swipe_fix",
    "micro_quiz",
    "smart_flashcard",
    "native_check",
    "brain_tickler"
]

SHIELD_CONFIG = {
    "required_streak": 3
}
```

---

## 🔌 API ENDPOINTS TO BUILD

### 1. **GET /api/focus/state**

Get current focus state for authenticated user.

**Request:**
```http
GET /api/focus/state
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "subscription_tier": "free",
  "error_spotting": {
    "current": 5,
    "max": 5,
    "last_refill": "2025-01-15T10:30:00Z"
  },
  "swipe_fix": { "current": 5, "max": 5, "last_refill": "2025-01-15T10:30:00Z" },
  "micro_quiz": { "current": 3, "max": 5, "last_refill": "2025-01-15T12:00:00Z" },
  "smart_flashcard": { "current": 5, "max": 5, "last_refill": "2025-01-15T10:30:00Z" },
  "native_check": { "current": 5, "max": 5, "last_refill": "2025-01-15T10:30:00Z" },
  "brain_tickler": { "current": 0, "max": 5, "last_refill": "2025-01-15T09:00:00Z" },
  "shield": {
    "is_active": true,
    "correct_answers_streak": 3,
    "required_streak": 3
  },
  "last_daily_reset": "2025-01-15T00:00:00Z",
  "user_timezone": "America/New_York"
}
```

**Business Logic:**
- Check if daily reset needed (midnight passed in user timezone)
- Check if gradual refill needed (time since last_refill > interval)
- Return updated state

---

### 2. **POST /api/focus/consume**

Consume a heart when user answers wrong.

**Request:**
```http
POST /api/focus/consume
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "challenge_type": "micro_quiz",
  "use_shield": false
}
```

**Response (Success - Heart Consumed):**
```json
{
  "success": true,
  "remaining_hearts": 4,
  "shield_used": false,
  "shield_active": false,
  "should_show_modal": false,
  "alternative_challenges": []
}
```

**Response (Success - Shield Used):**
```json
{
  "success": true,
  "remaining_hearts": 5,
  "shield_used": true,
  "shield_active": false,
  "should_show_modal": false,
  "alternative_challenges": []
}
```

**Response (Failed - Out of Hearts):**
```json
{
  "success": false,
  "remaining_hearts": 0,
  "shield_used": false,
  "shield_active": false,
  "should_show_modal": true,
  "alternative_challenges": ["swipe_fix", "smart_flashcard"]
}
```

**Business Logic:**
```python
def consume_heart(user_id: str, challenge_type: str, use_shield: bool):
    # 1. Get user focus state
    state = get_user_focus_state(user_id)

    # 2. Check daily reset
    check_daily_reset(state)

    # 3. Check gradual refill
    check_and_refill_hearts(state, challenge_type)

    # 4. Check if unlimited hearts (premium)
    if state.subscription_tier == "language_mastery":
        return {"success": True, "remaining_hearts": float('inf'), ...}

    # 5. Use shield if active and requested
    if use_shield and state.shield.is_active:
        state.shield.is_active = False
        state.shield.correct_answers_streak = 0
        save_state(state)
        return {"success": True, "shield_used": True, ...}

    # 6. Check if hearts available
    pool = state[challenge_type]
    if pool.current <= 0:
        alternatives = get_alternative_challenges(state)
        return {
            "success": False,
            "should_show_modal": True,
            "alternative_challenges": alternatives
        }

    # 7. Consume heart
    pool.current -= 1
    save_state(state)

    return {
        "success": True,
        "remaining_hearts": pool.current,
        "shield_used": False
    }
```

---

### 3. **POST /api/focus/streak/increment**

Increment streak when user answers correctly.

**Request:**
```http
POST /api/focus/streak/increment
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "correct_answers_streak": 3,
  "shield_activated": true,
  "shield_active": true
}
```

**Business Logic:**
```python
def increment_streak(user_id: str):
    state = get_user_focus_state(user_id)

    # Unlimited hearts users don't use shields
    if state.subscription_tier == "language_mastery":
        return {"correct_answers_streak": 0, "shield_activated": False}

    state.shield.correct_answers_streak += 1

    # Activate shield at required streak
    if state.shield.correct_answers_streak >= SHIELD_CONFIG["required_streak"]:
        shield_activated = not state.shield.is_active
        state.shield.is_active = True
    else:
        shield_activated = False

    save_state(state)

    return {
        "correct_answers_streak": state.shield.correct_answers_streak,
        "shield_activated": shield_activated,
        "shield_active": state.shield.is_active
    }
```

---

### 4. **POST /api/focus/streak/reset**

Reset streak when user answers wrong.

**Request:**
```http
POST /api/focus/streak/reset
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "correct_answers_streak": 0,
  "shield_active": false
}
```

**Business Logic:**
```python
def reset_streak(user_id: str):
    state = get_user_focus_state(user_id)

    state.shield.correct_answers_streak = 0
    # Shield remains active until consumed

    save_state(state)

    return {
        "correct_answers_streak": 0,
        "shield_active": state.shield.is_active
    }
```

---

## 🧮 BUSINESS LOGIC IMPLEMENTATION

### Daily Reset (Midnight in User Timezone)

```python
from datetime import datetime
import pytz

def check_daily_reset(user_focus_state):
    """Check if midnight passed in user's timezone and reset all hearts."""

    user_tz = pytz.timezone(user_focus_state.user_timezone or "UTC")
    now = datetime.now(user_tz)
    last_reset = user_focus_state.last_daily_reset.astimezone(user_tz)

    # Check if date changed
    if now.date() > last_reset.date():
        config = FOCUS_CONFIGS[user_focus_state.subscription_tier]

        # Reset ALL 6 challenge type pools to max
        for challenge_type in CHALLENGE_TYPES:
            pool = user_focus_state[challenge_type]
            pool.current = config["max_hearts"]
            pool.last_refill = now

        user_focus_state.last_daily_reset = now
        return True

    return False
```

### Gradual Refill (1 heart per interval)

```python
def check_and_refill_hearts(user_focus_state, challenge_type):
    """Refill hearts based on time elapsed since last refill."""

    # Unlimited hearts don't refill
    if user_focus_state.subscription_tier == "language_mastery":
        return

    config = FOCUS_CONFIGS[user_focus_state.subscription_tier]
    pool = user_focus_state[challenge_type]

    # Already at max
    if pool.current >= pool.max:
        return

    now = datetime.now(pytz.UTC)
    time_since_refill = (now - pool.last_refill).total_seconds() * 1000  # ms
    refill_interval = config["refill_interval_ms"]

    # Calculate how many hearts to refill
    hearts_to_refill = int(time_since_refill / refill_interval)

    if hearts_to_refill > 0:
        pool.current = min(pool.current + hearts_to_refill, pool.max)
        pool.last_refill = now
```

### Get Alternative Challenges (When Out of Hearts)

```python
def get_alternative_challenges(user_focus_state):
    """Return challenge types that still have hearts available."""

    alternatives = []

    for challenge_type in CHALLENGE_TYPES:
        pool = user_focus_state[challenge_type]
        if pool.current > 0:
            alternatives.append(challenge_type)

    return alternatives
```

---

## 💳 STRIPE INTEGRATION

### Webhook: `customer.subscription.updated`

When user upgrades/downgrades subscription:

```python
@app.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)

    if event.type == "customer.subscription.updated":
        subscription = event.data.object
        customer_id = subscription.customer

        # Get user by Stripe customer ID
        user = get_user_by_stripe_customer_id(customer_id)

        # Map Stripe price ID to tier
        tier_mapping = {
            "price_fluency_builder_monthly": "fluency_builder",
            "price_language_mastery_monthly": "language_mastery"
        }

        new_tier = tier_mapping.get(subscription.items.data[0].price.id, "free")

        # Update user's focus state
        update_subscription_tier(user.id, new_tier)

    return {"status": "success"}


def update_subscription_tier(user_id: str, new_tier: str):
    """Update subscription tier and adjust heart pools accordingly."""

    state = get_user_focus_state(user_id)
    old_tier = state.subscription_tier
    state.subscription_tier = new_tier

    new_config = FOCUS_CONFIGS[new_tier]

    # Update max hearts for all pools
    for challenge_type in CHALLENGE_TYPES:
        pool = state[challenge_type]

        if new_tier == "language_mastery":
            # Unlimited hearts
            pool.max = float('inf')
            pool.current = float('inf')
        else:
            # Update max
            pool.max = new_config["max_hearts"]

            # If upgrading, give hearts immediately up to new max
            if pool.current < pool.max:
                pool.current = pool.max

    save_state(state)
```

---

## 🆕 INITIAL SETUP FOR NEW USERS

When a new user signs up, initialize their focus state:

```python
def initialize_focus_state(user_id: str, timezone: str = "UTC"):
    """Create initial focus state for new user."""

    now = datetime.now(pytz.UTC)

    initial_state = {
        "user_id": user_id,
        "subscription_tier": "free",
        "error_spotting": {"current": 5, "max": 5, "last_refill": now},
        "swipe_fix": {"current": 5, "max": 5, "last_refill": now},
        "micro_quiz": {"current": 5, "max": 5, "last_refill": now},
        "smart_flashcard": {"current": 5, "max": 5, "last_refill": now},
        "native_check": {"current": 5, "max": 5, "last_refill": now},
        "brain_tickler": {"current": 5, "max": 5, "last_refill": now},
        "shield": {
            "is_active": False,
            "correct_answers_streak": 0,
            "required_streak": 3
        },
        "last_daily_reset": now,
        "user_timezone": timezone,
        "created_at": now,
        "updated_at": now
    }

    db.user_focus_states.insert_one(initial_state)
```

---

## 🧪 TESTING SCENARIOS

### Test Case 1: Daily Reset
```
1. User has 2/5 hearts at 11:59 PM
2. Midnight passes in user's timezone
3. Call GET /api/focus/state
4. Expected: All pools reset to 5/5 hearts
```

### Test Case 2: Gradual Refill
```
1. User has 3/5 hearts (free tier, 3hr refill)
2. Wait 3 hours
3. Call GET /api/focus/state
4. Expected: 4/5 hearts
5. Wait another 3 hours
6. Call GET /api/focus/state
7. Expected: 5/5 hearts
```

### Test Case 3: Shield Activation
```
1. User answers 3 questions correctly
2. Call POST /api/focus/streak/increment (3 times)
3. Expected: shield_activated=true on 3rd call
4. User answers wrong
5. Call POST /api/focus/consume with use_shield=true
6. Expected: shield_used=true, hearts unchanged
```

### Test Case 4: Out of Hearts
```
1. User has 1/5 hearts in micro_quiz
2. User has 5/5 hearts in other challenges
3. Call POST /api/focus/consume for micro_quiz
4. Expected: success=false, alternative_challenges=["error_spotting", ...]
```

### Test Case 5: Subscription Upgrade
```
1. User has 3/5 hearts (free tier)
2. User upgrades to fluency_builder
3. Stripe webhook fires
4. Call GET /api/focus/state
5. Expected: max=10, current=10 (instant refill on upgrade)
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Core Setup
- [ ] Create MongoDB collection `user_focus_states`
- [ ] Create Pydantic models for focus state
- [ ] Implement `initialize_focus_state()` for new users
- [ ] Add JWT authentication middleware

### Phase 2: Business Logic
- [ ] Implement `check_daily_reset()`
- [ ] Implement `check_and_refill_hearts()`
- [ ] Implement `get_alternative_challenges()`

### Phase 3: API Endpoints
- [ ] Build `GET /api/focus/state`
- [ ] Build `POST /api/focus/consume`
- [ ] Build `POST /api/focus/streak/increment`
- [ ] Build `POST /api/focus/streak/reset`

### Phase 4: Stripe Integration
- [ ] Set up Stripe webhook endpoint
- [ ] Handle `customer.subscription.updated` event
- [ ] Implement `update_subscription_tier()`
- [ ] Test subscription tier changes

### Phase 5: Testing
- [ ] Write unit tests for business logic
- [ ] Write integration tests for API endpoints
- [ ] Test timezone handling (daily reset)
- [ ] Test gradual refill logic
- [ ] Test shield mechanics
- [ ] Load testing for concurrent requests

### Phase 6: Mobile Integration
- [ ] Replace AsyncStorage calls with API calls in mobile app
- [ ] Handle offline/online sync
- [ ] Error handling and retries

---

## 🚀 DEPLOYMENT NOTES

**Environment Variables Needed:**
```
MONGODB_URI=mongodb://...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=...
```

**MongoDB Indexes:**
```javascript
db.user_focus_states.createIndex({ user_id: 1 }, { unique: true })
db.user_focus_states.createIndex({ subscription_tier: 1 })
```

**Rate Limiting:**
- Implement rate limiting on consume endpoint (prevent abuse)
- Max 10 requests/minute per user

---

## 📞 QUESTIONS?

If anything is unclear, reference the mobile code:
- **Repository:** alipala/mytacoai-mobile
- **Branch:** `claude/improve-challenges-heart-system-GWf2O`
- **Main file:** `src/contexts/FocusContext.tsx`

The mobile app is **100% functional locally**. You just need to persist the same data to MongoDB and expose APIs.

---

**THAT'S IT. BUILD THE 4 API ENDPOINTS + STRIPE WEBHOOKS. DONE.**
