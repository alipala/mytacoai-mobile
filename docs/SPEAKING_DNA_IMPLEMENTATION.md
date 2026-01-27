# Speaking DNA - Implementation Guide

## Executive Summary

Speaking DNA is MyTaco AI's killer feature that creates a unique "speaking fingerprint" for each user. Unlike generic progress tracking, Speaking DNA captures who you are as a speaker - your rhythm, confidence patterns, vocabulary style, and emotional journey. This enables the AI Language Coach to truly know each learner and provide personalized guidance across all session types.

**Why Speaking DNA is a Killer Feature:**
- **Unique Identity**: No other app creates a personalized speaking fingerprint
- **Cross-Session Memory**: AI coach remembers and adapts across all session types
- **Breakthrough Detection**: Celebrates meaningful moments, not just streaks
- **Shareable**: DNA cards create viral social sharing opportunities
- **Deeply Personal**: Makes users feel truly understood by their AI coach

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MOBILE APP (React Native)                        │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │ Learning Session│  │Freestyle Session│  │    News Session         │  │
│  │                 │  │                 │  │                         │  │
│  │ - Guided topics │  │ - Free talk     │  │ - Article discussion    │  │
│  │ - Structured    │  │ - User-driven   │  │ - Current events        │  │
│  └────────┬────────┘  └────────┬────────┘  └────────────┬────────────┘  │
│           │                    │                        │               │
│           └────────────────────┼────────────────────────┘               │
│                                ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              Session Metrics Collector (All Sessions)            │   │
│  │  - Response timestamps (for latency calculation)                 │   │
│  │  - User transcript chunks                                        │   │
│  │  - Filler word detection                                         │   │
│  │  - Self-correction tracking                                      │   │
│  │  - Challenge acceptance/decline                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                │                                        │
│  ┌─────────────────────────────┼───────────────────────────────────┐   │
│  │         Speaking Assessment │(60-second baseline)               │   │
│  │  - Audio sent as base64     │                                   │   │
│  │  - Acoustic analysis        ▼                                   │   │
│  │  - DNA baseline creation ───┴───────────────────────────────┐   │   │
│  └─────────────────────────────────────────────────────────────┼───┘   │
│                                                                │        │
│  ┌─────────────────────────────────────────────────────────────┼───┐   │
│  │                   Speaking DNA Screen                       │   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │   │   │
│  │  │ DNA Helix   │  │ Evolution   │  │ Breakthrough        │ │   │   │
│  │  │ Visualization│  │ Timeline    │  │ Moments Gallery     │ │   │   │
│  │  │             │  │             │  │                     │ │   │   │
│  │  │ 6 Strands:  │  │ Weekly      │  │ "First complex      │ │   │   │
│  │  │ - Rhythm    │  │ snapshots   │  │  sentence!"         │ │   │   │
│  │  │ - Confidence│  │ showing     │  │ "Conquered past     │ │   │   │
│  │  │ - Vocabulary│  │ evolution   │  │  tense!"            │ │   │   │
│  │  │ - Accuracy  │  │             │  │ "10-min streak!"    │ │   │   │
│  │  │ - Learning  │  │             │  │                     │ │   │   │
│  │  │ - Emotional │  │             │  │                     │ │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ │   │   │
│  │                                                             │   │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │   │
│  │  │              Shareable DNA Card                      │   │   │   │
│  │  │  "My Dutch Speaking DNA" - unique visual identity    │   │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │   │
│  └─────────────────────────────────────────────────────────────┘   │   │
└────────────────────────────────────────────────────────────────────┼───┘
                                                                     │
                              API Calls                              │
                                                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (FastAPI)                               │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Speaking DNA Service                          │   │
│  │                                                                  │   │
│  │  analyze_session_for_dna()                                      │   │
│  │  ├── Extract metrics from session data                          │   │
│  │  ├── Calculate strand updates (weighted moving average)         │   │
│  │  ├── Detect breakthroughs                                       │   │
│  │  └── Update DNA profile                                         │   │
│  │                                                                  │   │
│  │  build_coach_instructions()                                     │   │
│  │  ├── Load user's DNA profile                                    │   │
│  │  ├── Generate personalized coaching context                     │   │
│  │  └── Include recent breakthroughs & areas to encourage          │   │
│  │                                                                  │   │
│  │  analyze_audio_acoustics() [For Speaking Assessment only]       │   │
│  │  ├── Decode base64 audio                                        │   │
│  │  ├── Extract pitch, jitter, shimmer using Parselmouth           │   │
│  │  ├── Detect pauses using librosa                                │   │
│  │  └── Return acoustic metrics (no audio stored)                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                │                                        │
│                                ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              Prompt Builder Integration                          │   │
│  │                                                                  │   │
│  │  build_tutor_instructions() now includes:                       │   │
│  │  - DNA-based personality awareness                              │   │
│  │  - "This learner is a 'Thoughtful Pacer' who..."               │   │
│  │  - Recent breakthrough to celebrate                             │   │
│  │  - Specific areas where encouragement helps                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┬────┘
                                                                     │
                                                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         MONGODB                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────┐  ┌────────────────────┐  │
│  │speaking_dna_profiles│  │speaking_dna_    │  │speaking_           │  │
│  │                     │  │history          │  │breakthroughs       │  │
│  │ - user_id          │  │                 │  │                    │  │
│  │ - language         │  │ - Weekly        │  │ - Milestone        │  │
│  │ - dna_strands (6)  │  │   snapshots     │  │   moments          │  │
│  │ - overall_profile  │  │ - Evolution     │  │ - Timestamps       │  │
│  │ - last_updated     │  │   tracking      │  │ - Context          │  │
│  └─────────────────────┘  └─────────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## MongoDB Collections

### 1. speaking_dna_profiles

Stores the current DNA profile for each user per language.

```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId,           // Reference to users collection
  "language": "dutch",           // Target language

  "dna_strands": {
    "rhythm": {
      "type": "thoughtful_pacer",  // or "rapid_responder", "steady_speaker"
      "words_per_minute_avg": 85,
      "pause_duration_avg_ms": 1200,
      "consistency_score": 0.72,   // How consistent across sessions
      "description": "Takes time to formulate thoughts, speaks deliberately"
    },

    "confidence": {
      "level": "building",         // "hesitant", "building", "comfortable", "fluent"
      "score": 0.65,               // 0-1 scale
      "response_latency_avg_ms": 2500,
      "filler_rate_per_minute": 3.2,
      "trend": "improving",        // "declining", "stable", "improving"
      "description": "Growing more confident, especially in familiar topics"
    },

    "vocabulary": {
      "style": "safety_first",     // "adventurous", "safety_first", "balanced"
      "unique_words_per_session": 45,
      "new_word_attempt_rate": 0.15,  // How often tries new vocabulary
      "complexity_level": "intermediate",
      "description": "Prefers familiar words but occasionally experiments"
    },

    "accuracy": {
      "pattern": "perfectionist",  // "perfectionist", "risk_taker", "balanced"
      "grammar_accuracy": 0.78,
      "common_errors": ["verb_conjugation", "article_gender"],
      "improving_areas": ["past_tense"],
      "description": "High accuracy focus, sometimes hesitates to avoid mistakes"
    },

    "learning": {
      "type": "persistent",        // "explorer", "persistent", "cautious"
      "retry_rate": 0.85,          // How often retries after correction
      "challenge_acceptance": 0.60, // Rate of accepting harder challenges
      "description": "Learns through repetition, prefers mastery before moving on"
    },

    "emotional": {
      "pattern": "slow_warmer",    // "quick_starter", "slow_warmer", "consistent"
      "session_start_confidence": 0.55,
      "session_end_confidence": 0.75,
      "anxiety_triggers": ["new_topics", "time_pressure"],
      "description": "Needs warm-up time, gains confidence as session progresses"
    }
  },

  "overall_profile": {
    "speaker_archetype": "The Thoughtful Builder",
    "summary": "A deliberate learner who values accuracy and builds confidence through mastery. Responds well to encouragement and structured progression.",
    "coach_approach": "patient_encourager",  // Informs AI coaching style
    "strengths": ["persistence", "accuracy_focus", "self_correction"],
    "growth_areas": ["spontaneity", "risk_taking", "speed"]
  },

  "baseline_assessment": {
    "date": ISODate,
    "acoustic_metrics": {
      "pitch_mean": 145.2,
      "pitch_std": 23.5,
      "jitter": 0.012,
      "shimmer": 0.045,
      "pause_ratio": 0.25
    }
  },

  "sessions_analyzed": 24,
  "total_speaking_minutes": 87,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

**Indexes:**
```javascript
db.speaking_dna_profiles.createIndex({ "user_id": 1, "language": 1 }, { unique: true })
db.speaking_dna_profiles.createIndex({ "updated_at": -1 })
```

### 2. speaking_dna_history

Stores weekly snapshots for evolution tracking and visualization.

```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "language": "dutch",
  "week_start": ISODate("2024-01-15"),
  "week_number": 3,              // Week number since user started

  "strand_snapshots": {
    "rhythm": {
      "type": "thoughtful_pacer",
      "consistency_score": 0.68
    },
    "confidence": {
      "level": "building",
      "score": 0.62,
      "trend": "improving"
    },
    "vocabulary": {
      "style": "safety_first",
      "complexity_level": "intermediate"
    },
    "accuracy": {
      "pattern": "perfectionist",
      "grammar_accuracy": 0.75
    },
    "learning": {
      "type": "persistent",
      "challenge_acceptance": 0.55
    },
    "emotional": {
      "pattern": "slow_warmer",
      "session_end_confidence": 0.70
    }
  },

  "week_stats": {
    "sessions_completed": 2,
    "total_minutes": 10,
    "breakthroughs_count": 1
  },

  "created_at": ISODate
}
```

**Indexes:**
```javascript
db.speaking_dna_history.createIndex({ "user_id": 1, "language": 1, "week_start": -1 })
```

### 3. speaking_breakthroughs

Records meaningful breakthrough moments for celebration and motivation.

```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "language": "dutch",
  "session_id": ObjectId,

  "breakthrough_type": "confidence_jump",  // See types below
  "category": "confidence",                // Which DNA strand

  "title": "Confidence Breakthrough!",
  "description": "You spoke for 2 minutes without hesitation - your longest fluent stretch yet!",
  "emoji": "🚀",

  "metrics": {
    "before": { "fluent_stretch_seconds": 45 },
    "after": { "fluent_stretch_seconds": 120 },
    "improvement_percent": 167
  },

  "context": {
    "session_type": "freestyle",
    "topic": "weekend_plans",
    "trigger_sentence": "Ik ga dit weekend naar de markt met mijn familie"
  },

  "celebrated": false,           // Has user seen this?
  "shared": false,               // Has user shared this?
  "created_at": ISODate
}
```

**Breakthrough Types:**
- `confidence_jump` - Significant confidence score increase
- `fluency_streak` - Longest fluent speaking stretch
- `vocabulary_expansion` - Used X new words successfully
- `grammar_mastery` - Conquered a previously difficult grammar pattern
- `speed_improvement` - Speaking pace improved significantly
- `anxiety_overcome` - Successfully handled a known trigger
- `challenge_accepted` - Took on harder challenge and succeeded
- `consistency_milestone` - X sessions in a row with improvement

**Indexes:**
```javascript
db.speaking_breakthroughs.createIndex({ "user_id": 1, "language": 1, "created_at": -1 })
db.speaking_breakthroughs.createIndex({ "user_id": 1, "celebrated": 1 })
```

---

## Backend Implementation

### 1. speaking_dna_service.py

```python
"""
Speaking DNA Service
====================
Core service for analyzing speaking patterns and managing DNA profiles.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from bson import ObjectId
import numpy as np
import logging

from database import get_database

logger = logging.getLogger(__name__)


class SpeakingDNAService:
    """
    Manages Speaking DNA profiles, analysis, and coach instructions.
    """

    # DNA Strand Weights for different session types
    SESSION_WEIGHTS = {
        "learning": {
            "rhythm": 0.8,
            "confidence": 1.0,
            "vocabulary": 0.7,
            "accuracy": 1.0,
            "learning": 1.0,
            "emotional": 0.9
        },
        "freestyle": {
            "rhythm": 1.0,
            "confidence": 1.0,
            "vocabulary": 1.0,
            "accuracy": 0.7,
            "learning": 0.6,
            "emotional": 1.0
        },
        "news": {
            "rhythm": 0.9,
            "confidence": 0.9,
            "vocabulary": 1.0,
            "accuracy": 0.8,
            "learning": 0.7,
            "emotional": 0.8
        }
    }

    # Thresholds for breakthrough detection
    BREAKTHROUGH_THRESHOLDS = {
        "confidence_jump": 0.15,          # 15% confidence increase
        "fluency_streak_multiplier": 1.5,  # 50% longer than previous best
        "vocabulary_expansion": 10,        # 10 new words in session
        "speed_improvement": 0.20,         # 20% WPM increase
    }

    # Speaker archetypes based on DNA combination
    ARCHETYPES = {
        ("thoughtful_pacer", "perfectionist", "persistent"): {
            "name": "The Thoughtful Builder",
            "summary": "A deliberate learner who values accuracy and builds confidence through mastery.",
            "coach_approach": "patient_encourager"
        },
        ("rapid_responder", "risk_taker", "explorer"): {
            "name": "The Fearless Explorer",
            "summary": "An adventurous speaker who learns through experimentation and isn't afraid of mistakes.",
            "coach_approach": "challenge_provider"
        },
        ("steady_speaker", "balanced", "balanced"): {
            "name": "The Steady Progressor",
            "summary": "A balanced learner who makes consistent progress through regular practice.",
            "coach_approach": "balanced_guide"
        },
        # Add more archetypes as patterns emerge
    }

    def __init__(self):
        self.db = None

    async def _get_db(self):
        if self.db is None:
            self.db = await get_database()
        return self.db

    # =========================================================================
    # CORE ANALYSIS METHODS
    # =========================================================================

    async def analyze_session_for_dna(
        self,
        user_id: str,
        language: str,
        session_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze a completed session and update the user's DNA profile.

        Args:
            user_id: User's MongoDB ObjectId as string
            language: Target language code (e.g., "dutch", "spanish")
            session_data: Session data including transcripts, timestamps, etc.

        Returns:
            Dict with updated profile, detected breakthroughs, and coach notes
        """
        db = await self._get_db()
        user_oid = ObjectId(user_id)

        # Get existing profile or create new one
        existing_profile = await db.speaking_dna_profiles.find_one({
            "user_id": user_oid,
            "language": language
        })

        # Extract metrics from session
        session_metrics = self._extract_session_metrics(session_data)

        # Calculate strand updates
        updated_strands = self._calculate_strand_updates(
            existing_profile,
            session_metrics,
            session_data.get("session_type", "learning")
        )

        # Detect any breakthroughs
        breakthroughs = await self._detect_breakthroughs(
            user_id=user_id,
            language=language,
            existing_profile=existing_profile,
            new_strands=updated_strands,
            session_data=session_data
        )

        # Determine overall profile
        overall_profile = self._determine_overall_profile(updated_strands)

        # Update or create profile
        now = datetime.utcnow()
        sessions_analyzed = (existing_profile.get("sessions_analyzed", 0) if existing_profile else 0) + 1
        total_minutes = (existing_profile.get("total_speaking_minutes", 0) if existing_profile else 0) + session_metrics.get("session_duration_minutes", 5)

        profile_update = {
            "user_id": user_oid,
            "language": language,
            "dna_strands": updated_strands,
            "overall_profile": overall_profile,
            "sessions_analyzed": sessions_analyzed,
            "total_speaking_minutes": total_minutes,
            "updated_at": now
        }

        if existing_profile:
            await db.speaking_dna_profiles.update_one(
                {"_id": existing_profile["_id"]},
                {"$set": profile_update}
            )
        else:
            profile_update["created_at"] = now
            await db.speaking_dna_profiles.insert_one(profile_update)

        # Store breakthroughs
        if breakthroughs:
            await db.speaking_breakthroughs.insert_many(breakthroughs)

        return {
            "profile": profile_update,
            "breakthroughs": breakthroughs,
            "session_insights": self._generate_session_insights(session_metrics, updated_strands)
        }

    def _extract_session_metrics(self, session_data: Dict) -> Dict:
        """
        Extract quantifiable metrics from session data.

        Expected session_data structure:
        {
            "session_type": "learning" | "freestyle" | "news",
            "duration_seconds": 300,
            "user_turns": [
                {
                    "transcript": "Ik ga naar de winkel",
                    "start_time_ms": 12500,
                    "end_time_ms": 15200,
                    "ai_prompt_end_time_ms": 11000  # When AI finished speaking
                },
                ...
            ],
            "corrections_received": [...],
            "challenges_offered": 2,
            "challenges_accepted": 1,
            "topics_discussed": ["shopping", "directions"]
        }
        """
        user_turns = session_data.get("user_turns", [])

        if not user_turns:
            return self._get_default_metrics()

        # Calculate response latencies
        latencies = []
        for turn in user_turns:
            if turn.get("ai_prompt_end_time_ms") and turn.get("start_time_ms"):
                latency = turn["start_time_ms"] - turn["ai_prompt_end_time_ms"]
                if latency > 0:  # Valid latency
                    latencies.append(latency)

        # Calculate words per minute
        total_words = 0
        total_speaking_time_ms = 0
        all_words = []

        for turn in user_turns:
            transcript = turn.get("transcript", "")
            words = transcript.split()
            total_words += len(words)
            all_words.extend(words)

            if turn.get("start_time_ms") and turn.get("end_time_ms"):
                total_speaking_time_ms += turn["end_time_ms"] - turn["start_time_ms"]

        wpm = (total_words / (total_speaking_time_ms / 60000)) if total_speaking_time_ms > 0 else 0

        # Detect filler words (common across languages + language-specific)
        filler_patterns = [
            "uh", "um", "eh", "ah", "like", "you know",  # English
            "eh", "nou", "dus", "eigenlijk", "gewoon",   # Dutch
            "euh", "ben", "pues", "este", "o sea"        # Spanish
        ]
        filler_count = sum(
            1 for word in all_words
            if word.lower() in filler_patterns
        )
        filler_rate = (filler_count / (total_speaking_time_ms / 60000)) if total_speaking_time_ms > 0 else 0

        # Calculate unique vocabulary
        unique_words = set(word.lower() for word in all_words if len(word) > 2)

        # Self-corrections (simple heuristic: repeated phrases or "I mean")
        self_corrections = sum(
            1 for turn in user_turns
            if any(marker in turn.get("transcript", "").lower()
                   for marker in ["i mean", "sorry", "no wait", "ik bedoel"])
        )

        return {
            "session_duration_minutes": session_data.get("duration_seconds", 300) / 60,
            "response_latency_avg_ms": np.mean(latencies) if latencies else 2000,
            "response_latency_std_ms": np.std(latencies) if len(latencies) > 1 else 500,
            "words_per_minute": wpm,
            "total_words": total_words,
            "unique_words": len(unique_words),
            "filler_rate_per_minute": filler_rate,
            "self_corrections": self_corrections,
            "turns_count": len(user_turns),
            "challenges_offered": session_data.get("challenges_offered", 0),
            "challenges_accepted": session_data.get("challenges_accepted", 0),
            "corrections_received": len(session_data.get("corrections_received", []))
        }

    def _get_default_metrics(self) -> Dict:
        """Return default metrics for empty sessions."""
        return {
            "session_duration_minutes": 5,
            "response_latency_avg_ms": 2000,
            "response_latency_std_ms": 500,
            "words_per_minute": 80,
            "total_words": 50,
            "unique_words": 30,
            "filler_rate_per_minute": 2.0,
            "self_corrections": 1,
            "turns_count": 5,
            "challenges_offered": 0,
            "challenges_accepted": 0,
            "corrections_received": 0
        }

    def _calculate_strand_updates(
        self,
        existing_profile: Optional[Dict],
        session_metrics: Dict,
        session_type: str
    ) -> Dict:
        """
        Calculate updated DNA strands using weighted moving average.

        Uses exponential moving average to smooth updates while still
        being responsive to recent sessions.
        """
        weights = self.SESSION_WEIGHTS.get(session_type, self.SESSION_WEIGHTS["learning"])
        alpha = 0.3  # Learning rate for exponential moving average

        existing_strands = existing_profile.get("dna_strands", {}) if existing_profile else {}

        # Calculate each strand
        updated = {
            "rhythm": self._update_rhythm_strand(existing_strands.get("rhythm"), session_metrics, alpha, weights["rhythm"]),
            "confidence": self._update_confidence_strand(existing_strands.get("confidence"), session_metrics, alpha, weights["confidence"]),
            "vocabulary": self._update_vocabulary_strand(existing_strands.get("vocabulary"), session_metrics, alpha, weights["vocabulary"]),
            "accuracy": self._update_accuracy_strand(existing_strands.get("accuracy"), session_metrics, alpha, weights["accuracy"]),
            "learning": self._update_learning_strand(existing_strands.get("learning"), session_metrics, alpha, weights["learning"]),
            "emotional": self._update_emotional_strand(existing_strands.get("emotional"), session_metrics, alpha, weights["emotional"])
        }

        return updated

    def _update_rhythm_strand(self, existing: Optional[Dict], metrics: Dict, alpha: float, weight: float) -> Dict:
        """Update rhythm strand based on speaking pace and pauses."""
        wpm = metrics["words_per_minute"]

        # Determine rhythm type
        if wpm < 70:
            rhythm_type = "thoughtful_pacer"
            description = "Takes time to formulate thoughts, speaks deliberately"
        elif wpm > 120:
            rhythm_type = "rapid_responder"
            description = "Quick and spontaneous, comfortable with fast exchanges"
        else:
            rhythm_type = "steady_speaker"
            description = "Maintains a balanced, natural speaking pace"

        # Calculate consistency score based on standard deviation
        latency_std = metrics.get("response_latency_std_ms", 500)
        consistency = max(0, 1 - (latency_std / 2000))  # Lower std = higher consistency

        if existing:
            # Exponential moving average
            new_wpm = existing.get("words_per_minute_avg", wpm) * (1 - alpha * weight) + wpm * alpha * weight
            new_consistency = existing.get("consistency_score", consistency) * (1 - alpha * weight) + consistency * alpha * weight
        else:
            new_wpm = wpm
            new_consistency = consistency

        return {
            "type": rhythm_type,
            "words_per_minute_avg": round(new_wpm, 1),
            "pause_duration_avg_ms": round(metrics["response_latency_avg_ms"], 0),
            "consistency_score": round(new_consistency, 2),
            "description": description
        }

    def _update_confidence_strand(self, existing: Optional[Dict], metrics: Dict, alpha: float, weight: float) -> Dict:
        """Update confidence strand based on latency, fillers, and self-corrections."""
        # Calculate raw confidence score (0-1)
        latency_factor = max(0, 1 - (metrics["response_latency_avg_ms"] / 5000))  # <5s is good
        filler_factor = max(0, 1 - (metrics["filler_rate_per_minute"] / 10))  # <10/min is good
        correction_factor = max(0, 1 - (metrics["self_corrections"] / 5))  # <5 per session is good

        raw_score = (latency_factor * 0.4 + filler_factor * 0.3 + correction_factor * 0.3)

        # Determine level
        if raw_score < 0.3:
            level = "hesitant"
        elif raw_score < 0.5:
            level = "building"
        elif raw_score < 0.75:
            level = "comfortable"
        else:
            level = "fluent"

        # Determine trend
        if existing:
            old_score = existing.get("score", raw_score)
            if raw_score > old_score + 0.05:
                trend = "improving"
            elif raw_score < old_score - 0.05:
                trend = "declining"
            else:
                trend = "stable"

            new_score = old_score * (1 - alpha * weight) + raw_score * alpha * weight
            new_latency = existing.get("response_latency_avg_ms", metrics["response_latency_avg_ms"]) * (1 - alpha * weight) + metrics["response_latency_avg_ms"] * alpha * weight
            new_filler = existing.get("filler_rate_per_minute", metrics["filler_rate_per_minute"]) * (1 - alpha * weight) + metrics["filler_rate_per_minute"] * alpha * weight
        else:
            trend = "stable"
            new_score = raw_score
            new_latency = metrics["response_latency_avg_ms"]
            new_filler = metrics["filler_rate_per_minute"]

        # Generate description
        descriptions = {
            "hesitant": "Still building speaking comfort, benefits from extra encouragement",
            "building": "Growing more confident, especially in familiar topics",
            "comfortable": "Speaks with reasonable confidence in most situations",
            "fluent": "Confident and natural in conversation"
        }

        return {
            "level": level,
            "score": round(new_score, 2),
            "response_latency_avg_ms": round(new_latency, 0),
            "filler_rate_per_minute": round(new_filler, 1),
            "trend": trend,
            "description": descriptions[level]
        }

    def _update_vocabulary_strand(self, existing: Optional[Dict], metrics: Dict, alpha: float, weight: float) -> Dict:
        """Update vocabulary strand based on word variety and complexity."""
        unique_ratio = metrics["unique_words"] / max(metrics["total_words"], 1)

        # Determine vocabulary style
        if unique_ratio > 0.7:
            style = "adventurous"
            description = "Actively experiments with new vocabulary"
        elif unique_ratio < 0.4:
            style = "safety_first"
            description = "Prefers familiar words but occasionally experiments"
        else:
            style = "balanced"
            description = "Good mix of familiar and new vocabulary"

        # Determine complexity level (simplified - could use word frequency lists)
        avg_word_length = metrics["total_words"] / max(metrics["turns_count"], 1)
        if avg_word_length > 15:
            complexity = "advanced"
        elif avg_word_length > 8:
            complexity = "intermediate"
        else:
            complexity = "beginner"

        if existing:
            new_unique = existing.get("unique_words_per_session", metrics["unique_words"]) * (1 - alpha * weight) + metrics["unique_words"] * alpha * weight
        else:
            new_unique = metrics["unique_words"]

        return {
            "style": style,
            "unique_words_per_session": round(new_unique, 0),
            "new_word_attempt_rate": round(unique_ratio, 2),
            "complexity_level": complexity,
            "description": description
        }

    def _update_accuracy_strand(self, existing: Optional[Dict], metrics: Dict, alpha: float, weight: float) -> Dict:
        """Update accuracy strand based on corrections and self-monitoring."""
        corrections = metrics["corrections_received"]
        self_corrections = metrics["self_corrections"]
        turns = max(metrics["turns_count"], 1)

        # Accuracy rate (inverse of correction rate)
        external_error_rate = corrections / turns
        accuracy = max(0, 1 - external_error_rate)

        # Determine pattern
        if self_corrections > 2 and accuracy > 0.7:
            pattern = "perfectionist"
            description = "High accuracy focus, sometimes hesitates to avoid mistakes"
        elif self_corrections < 1 and accuracy < 0.6:
            pattern = "risk_taker"
            description = "Prioritizes fluency over accuracy, learns from mistakes"
        else:
            pattern = "balanced"
            description = "Good balance between accuracy and spontaneity"

        if existing:
            new_accuracy = existing.get("grammar_accuracy", accuracy) * (1 - alpha * weight) + accuracy * alpha * weight
            common_errors = existing.get("common_errors", [])
            improving_areas = existing.get("improving_areas", [])
        else:
            new_accuracy = accuracy
            common_errors = []
            improving_areas = []

        return {
            "pattern": pattern,
            "grammar_accuracy": round(new_accuracy, 2),
            "common_errors": common_errors,
            "improving_areas": improving_areas,
            "description": description
        }

    def _update_learning_strand(self, existing: Optional[Dict], metrics: Dict, alpha: float, weight: float) -> Dict:
        """Update learning strand based on challenge acceptance and retry behavior."""
        challenges_offered = max(metrics["challenges_offered"], 1)
        challenges_accepted = metrics["challenges_accepted"]
        challenge_rate = challenges_accepted / challenges_offered

        # Determine learning type
        if challenge_rate > 0.7:
            learning_type = "explorer"
            description = "Embraces challenges, learns through exploration"
        elif challenge_rate < 0.3:
            learning_type = "cautious"
            description = "Prefers gradual progression, builds strong foundations"
        else:
            learning_type = "persistent"
            description = "Learns through repetition, prefers mastery before moving on"

        # Estimate retry rate from self-corrections (simplified)
        retry_rate = min(1.0, metrics["self_corrections"] * 0.3 + 0.5)

        if existing:
            new_challenge_rate = existing.get("challenge_acceptance", challenge_rate) * (1 - alpha * weight) + challenge_rate * alpha * weight
            new_retry_rate = existing.get("retry_rate", retry_rate) * (1 - alpha * weight) + retry_rate * alpha * weight
        else:
            new_challenge_rate = challenge_rate
            new_retry_rate = retry_rate

        return {
            "type": learning_type,
            "retry_rate": round(new_retry_rate, 2),
            "challenge_acceptance": round(new_challenge_rate, 2),
            "description": description
        }

    def _update_emotional_strand(self, existing: Optional[Dict], metrics: Dict, alpha: float, weight: float) -> Dict:
        """Update emotional strand based on session patterns."""
        # This would ideally use within-session analysis
        # For now, use latency as proxy for emotional state

        latency = metrics["response_latency_avg_ms"]
        filler_rate = metrics["filler_rate_per_minute"]

        # Estimate start vs end confidence (would need actual timestamps)
        # Using simplified heuristic
        if existing:
            prev_end_confidence = existing.get("session_end_confidence", 0.6)
            # Assume we improve during session
            start_confidence = prev_end_confidence * 0.9
            end_confidence = prev_end_confidence + (0.1 if latency < 2000 else -0.05)
            end_confidence = max(0.3, min(0.95, end_confidence))
        else:
            start_confidence = 0.5
            end_confidence = 0.6

        # Determine emotional pattern
        improvement = end_confidence - start_confidence
        if improvement > 0.15:
            pattern = "slow_warmer"
            description = "Needs warm-up time, gains confidence as session progresses"
        elif improvement < 0.05:
            pattern = "consistent"
            description = "Maintains steady emotional state throughout sessions"
        else:
            pattern = "quick_starter"
            description = "Starts confident and maintains energy throughout"

        return {
            "pattern": pattern,
            "session_start_confidence": round(start_confidence, 2),
            "session_end_confidence": round(end_confidence, 2),
            "anxiety_triggers": existing.get("anxiety_triggers", []) if existing else [],
            "description": description
        }

    def _determine_overall_profile(self, strands: Dict) -> Dict:
        """Determine the overall speaker archetype from strand combination."""
        rhythm_type = strands["rhythm"]["type"]
        accuracy_pattern = strands["accuracy"]["pattern"]
        learning_type = strands["learning"]["type"]

        # Find matching archetype
        key = (rhythm_type, accuracy_pattern, learning_type)
        archetype = self.ARCHETYPES.get(key)

        if not archetype:
            # Default archetype if no exact match
            archetype = {
                "name": "The Unique Learner",
                "summary": "A distinctive learner with their own approach to language acquisition.",
                "coach_approach": "adaptive_guide"
            }

        # Determine strengths and growth areas
        strengths = []
        growth_areas = []

        if strands["confidence"]["score"] > 0.7:
            strengths.append("speaking_confidence")
        else:
            growth_areas.append("speaking_confidence")

        if strands["accuracy"]["grammar_accuracy"] > 0.75:
            strengths.append("accuracy_focus")
        else:
            growth_areas.append("grammar_accuracy")

        if strands["vocabulary"]["style"] == "adventurous":
            strengths.append("vocabulary_exploration")
        else:
            growth_areas.append("vocabulary_variety")

        if strands["learning"]["challenge_acceptance"] > 0.6:
            strengths.append("challenge_acceptance")
        else:
            growth_areas.append("taking_challenges")

        return {
            "speaker_archetype": archetype["name"],
            "summary": archetype["summary"],
            "coach_approach": archetype["coach_approach"],
            "strengths": strengths[:3],  # Top 3
            "growth_areas": growth_areas[:3]  # Top 3
        }

    # =========================================================================
    # BREAKTHROUGH DETECTION
    # =========================================================================

    async def _detect_breakthroughs(
        self,
        user_id: str,
        language: str,
        existing_profile: Optional[Dict],
        new_strands: Dict,
        session_data: Dict
    ) -> List[Dict]:
        """Detect any breakthrough moments from this session."""
        breakthroughs = []
        now = datetime.utcnow()
        user_oid = ObjectId(user_id)
        session_id = ObjectId(session_data.get("session_id", str(ObjectId())))

        if not existing_profile:
            # First session - no breakthroughs to detect yet
            return breakthroughs

        old_strands = existing_profile.get("dna_strands", {})

        # Check confidence jump
        old_confidence = old_strands.get("confidence", {}).get("score", 0)
        new_confidence = new_strands["confidence"]["score"]
        if new_confidence - old_confidence >= self.BREAKTHROUGH_THRESHOLDS["confidence_jump"]:
            breakthroughs.append({
                "user_id": user_oid,
                "language": language,
                "session_id": session_id,
                "breakthrough_type": "confidence_jump",
                "category": "confidence",
                "title": "Confidence Breakthrough!",
                "description": f"Your confidence score jumped from {int(old_confidence*100)}% to {int(new_confidence*100)}%!",
                "emoji": "🚀",
                "metrics": {
                    "before": {"score": old_confidence},
                    "after": {"score": new_confidence},
                    "improvement_percent": round((new_confidence - old_confidence) * 100, 1)
                },
                "context": {
                    "session_type": session_data.get("session_type", "learning"),
                    "topics": session_data.get("topics_discussed", [])
                },
                "celebrated": False,
                "shared": False,
                "created_at": now
            })

        # Check vocabulary expansion
        old_vocab = old_strands.get("vocabulary", {}).get("unique_words_per_session", 0)
        new_vocab = new_strands["vocabulary"]["unique_words_per_session"]
        if new_vocab - old_vocab >= self.BREAKTHROUGH_THRESHOLDS["vocabulary_expansion"]:
            breakthroughs.append({
                "user_id": user_oid,
                "language": language,
                "session_id": session_id,
                "breakthrough_type": "vocabulary_expansion",
                "category": "vocabulary",
                "title": "Vocabulary Explosion!",
                "description": f"You used {int(new_vocab - old_vocab)} more unique words than usual!",
                "emoji": "📚",
                "metrics": {
                    "before": {"unique_words": old_vocab},
                    "after": {"unique_words": new_vocab},
                    "improvement_percent": round(((new_vocab - old_vocab) / max(old_vocab, 1)) * 100, 1)
                },
                "context": {
                    "session_type": session_data.get("session_type", "learning")
                },
                "celebrated": False,
                "shared": False,
                "created_at": now
            })

        # Check challenge acceptance milestone
        old_challenge_rate = old_strands.get("learning", {}).get("challenge_acceptance", 0)
        new_challenge_rate = new_strands["learning"]["challenge_acceptance"]
        if old_challenge_rate < 0.5 and new_challenge_rate >= 0.5:
            breakthroughs.append({
                "user_id": user_oid,
                "language": language,
                "session_id": session_id,
                "breakthrough_type": "challenge_accepted",
                "category": "learning",
                "title": "Challenge Conqueror!",
                "description": "You're now accepting more than half of the challenges offered!",
                "emoji": "💪",
                "metrics": {
                    "before": {"challenge_rate": old_challenge_rate},
                    "after": {"challenge_rate": new_challenge_rate}
                },
                "context": {
                    "session_type": session_data.get("session_type", "learning")
                },
                "celebrated": False,
                "shared": False,
                "created_at": now
            })

        # Check confidence level upgrade
        old_level = old_strands.get("confidence", {}).get("level", "hesitant")
        new_level = new_strands["confidence"]["level"]
        level_order = ["hesitant", "building", "comfortable", "fluent"]
        if level_order.index(new_level) > level_order.index(old_level):
            breakthroughs.append({
                "user_id": user_oid,
                "language": language,
                "session_id": session_id,
                "breakthrough_type": "confidence_level_up",
                "category": "confidence",
                "title": f"Level Up: {new_level.title()}!",
                "description": f"You've graduated from '{old_level}' to '{new_level}' confidence level!",
                "emoji": "⬆️",
                "metrics": {
                    "before": {"level": old_level},
                    "after": {"level": new_level}
                },
                "context": {
                    "session_type": session_data.get("session_type", "learning")
                },
                "celebrated": False,
                "shared": False,
                "created_at": now
            })

        return breakthroughs

    def _generate_session_insights(self, metrics: Dict, strands: Dict) -> Dict:
        """Generate human-readable insights from the session."""
        insights = []

        # Speed insight
        wpm = metrics["words_per_minute"]
        if wpm > 100:
            insights.append("You spoke at a great conversational pace today!")
        elif wpm < 60:
            insights.append("You took your time to think through responses - that's perfectly fine!")

        # Confidence insight
        if strands["confidence"]["trend"] == "improving":
            insights.append("Your confidence is trending upward - keep it up!")

        # Vocabulary insight
        if strands["vocabulary"]["style"] == "adventurous":
            insights.append("You're experimenting with new vocabulary - great for growth!")

        return {
            "insights": insights,
            "highlight_stat": {
                "label": "Unique words used",
                "value": metrics["unique_words"]
            }
        }

    # =========================================================================
    # COACH INSTRUCTIONS
    # =========================================================================

    async def build_coach_instructions(
        self,
        user_id: str,
        language: str,
        session_type: str
    ) -> str:
        """
        Build personalized coaching instructions for the AI tutor.

        This is called at the start of each session to inject DNA-aware
        context into the tutor's system prompt.
        """
        db = await self._get_db()

        profile = await db.speaking_dna_profiles.find_one({
            "user_id": ObjectId(user_id),
            "language": language
        })

        if not profile:
            return self._get_default_coach_instructions(session_type)

        strands = profile.get("dna_strands", {})
        overall = profile.get("overall_profile", {})

        # Get recent uncelebrated breakthroughs
        recent_breakthroughs = await db.speaking_breakthroughs.find({
            "user_id": ObjectId(user_id),
            "language": language,
            "celebrated": False
        }).sort("created_at", -1).limit(3).to_list(3)

        # Build instructions
        instructions = f"""
## Learner Speaking DNA Profile

This learner is "{overall.get('speaker_archetype', 'a unique learner')}" - {overall.get('summary', '')}

### Key Characteristics:
- **Speaking Rhythm**: {strands.get('rhythm', {}).get('type', 'unknown')} - {strands.get('rhythm', {}).get('description', '')}
- **Confidence Level**: {strands.get('confidence', {}).get('level', 'building')} ({strands.get('confidence', {}).get('trend', 'stable')} trend)
- **Vocabulary Style**: {strands.get('vocabulary', {}).get('style', 'balanced')} - {strands.get('vocabulary', {}).get('description', '')}
- **Learning Type**: {strands.get('learning', {}).get('type', 'persistent')} - {strands.get('learning', {}).get('description', '')}
- **Emotional Pattern**: {strands.get('emotional', {}).get('pattern', 'consistent')} - {strands.get('emotional', {}).get('description', '')}

### Coaching Approach: {overall.get('coach_approach', 'balanced_guide')}
- Strengths to leverage: {', '.join(overall.get('strengths', ['consistency']))}
- Growth areas to gently encourage: {', '.join(overall.get('growth_areas', ['confidence']))}
"""

        # Add breakthrough celebration instructions
        if recent_breakthroughs:
            instructions += "\n### Recent Breakthroughs to Celebrate:\n"
            for bt in recent_breakthroughs:
                instructions += f"- {bt['emoji']} {bt['title']}: {bt['description']}\n"
            instructions += "\nMention one of these achievements early in the session to boost motivation!\n"

        # Add session-type specific guidance
        if session_type == "learning":
            instructions += """
### Learning Session Guidance:
- Follow the structured lesson plan
- Be patient with this learner's natural pace
- Offer challenges based on their challenge_acceptance rate
"""
        elif session_type == "freestyle":
            instructions += """
### Freestyle Session Guidance:
- Let the learner lead the conversation
- Encourage vocabulary experimentation based on their style
- Match their energy and pace
"""
        elif session_type == "news":
            instructions += """
### News Session Guidance:
- Help with complex vocabulary from the article
- Be patient as they formulate opinions
- Encourage them to express their thoughts even imperfectly
"""

        # Add anxiety awareness if applicable
        triggers = strands.get("emotional", {}).get("anxiety_triggers", [])
        if triggers:
            instructions += f"\n### Be Mindful Of:\nThis learner may feel anxious with: {', '.join(triggers)}. Approach these gently.\n"

        return instructions

    def _get_default_coach_instructions(self, session_type: str) -> str:
        """Default instructions for users without a DNA profile yet."""
        return f"""
## New Learner

This learner hasn't built their Speaking DNA profile yet. Use this session to:
- Assess their speaking confidence and pace
- Note their vocabulary comfort level
- Observe how they handle corrections
- Be encouraging and supportive as they're just starting their journey

Session type: {session_type}
"""

    # =========================================================================
    # PROFILE RETRIEVAL & EVOLUTION
    # =========================================================================

    async def get_dna_profile(self, user_id: str, language: str) -> Optional[Dict]:
        """Get the current DNA profile for a user."""
        db = await self._get_db()

        profile = await db.speaking_dna_profiles.find_one({
            "user_id": ObjectId(user_id),
            "language": language
        })

        if profile:
            profile["_id"] = str(profile["_id"])
            profile["user_id"] = str(profile["user_id"])

        return profile

    async def get_dna_evolution(
        self,
        user_id: str,
        language: str,
        weeks: int = 12
    ) -> List[Dict]:
        """Get DNA evolution history for visualization."""
        db = await self._get_db()

        history = await db.speaking_dna_history.find({
            "user_id": ObjectId(user_id),
            "language": language
        }).sort("week_start", -1).limit(weeks).to_list(weeks)

        # Convert ObjectIds to strings
        for entry in history:
            entry["_id"] = str(entry["_id"])
            entry["user_id"] = str(entry["user_id"])

        return list(reversed(history))  # Chronological order

    async def get_breakthroughs(
        self,
        user_id: str,
        language: str,
        limit: int = 20,
        uncelebrated_only: bool = False
    ) -> List[Dict]:
        """Get breakthrough moments for a user."""
        db = await self._get_db()

        query = {
            "user_id": ObjectId(user_id),
            "language": language
        }

        if uncelebrated_only:
            query["celebrated"] = False

        breakthroughs = await db.speaking_breakthroughs.find(query).sort(
            "created_at", -1
        ).limit(limit).to_list(limit)

        for bt in breakthroughs:
            bt["_id"] = str(bt["_id"])
            bt["user_id"] = str(bt["user_id"])
            bt["session_id"] = str(bt["session_id"])

        return breakthroughs

    async def mark_breakthrough_celebrated(self, breakthrough_id: str) -> bool:
        """Mark a breakthrough as celebrated."""
        db = await self._get_db()

        result = await db.speaking_breakthroughs.update_one(
            {"_id": ObjectId(breakthrough_id)},
            {"$set": {"celebrated": True}}
        )

        return result.modified_count > 0

    # =========================================================================
    # WEEKLY SNAPSHOT (Called by cron job)
    # =========================================================================

    async def create_weekly_snapshots(self):
        """
        Create weekly DNA snapshots for all active users.
        Should be called by a weekly cron job (e.g., Sunday midnight).
        """
        db = await self._get_db()

        # Get all profiles updated in the last week
        one_week_ago = datetime.utcnow() - timedelta(days=7)

        cursor = db.speaking_dna_profiles.find({
            "updated_at": {"$gte": one_week_ago}
        })

        week_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        week_start -= timedelta(days=week_start.weekday())  # Monday of current week

        snapshots_created = 0

        async for profile in cursor:
            # Check if snapshot already exists for this week
            existing = await db.speaking_dna_history.find_one({
                "user_id": profile["user_id"],
                "language": profile["language"],
                "week_start": week_start
            })

            if existing:
                continue

            # Count weeks since profile creation
            created = profile.get("created_at", datetime.utcnow())
            weeks_since_start = max(1, (week_start - created).days // 7 + 1)

            # Create snapshot
            snapshot = {
                "user_id": profile["user_id"],
                "language": profile["language"],
                "week_start": week_start,
                "week_number": weeks_since_start,
                "strand_snapshots": {
                    "rhythm": {
                        "type": profile["dna_strands"]["rhythm"]["type"],
                        "consistency_score": profile["dna_strands"]["rhythm"]["consistency_score"]
                    },
                    "confidence": {
                        "level": profile["dna_strands"]["confidence"]["level"],
                        "score": profile["dna_strands"]["confidence"]["score"],
                        "trend": profile["dna_strands"]["confidence"]["trend"]
                    },
                    "vocabulary": {
                        "style": profile["dna_strands"]["vocabulary"]["style"],
                        "complexity_level": profile["dna_strands"]["vocabulary"]["complexity_level"]
                    },
                    "accuracy": {
                        "pattern": profile["dna_strands"]["accuracy"]["pattern"],
                        "grammar_accuracy": profile["dna_strands"]["accuracy"]["grammar_accuracy"]
                    },
                    "learning": {
                        "type": profile["dna_strands"]["learning"]["type"],
                        "challenge_acceptance": profile["dna_strands"]["learning"]["challenge_acceptance"]
                    },
                    "emotional": {
                        "pattern": profile["dna_strands"]["emotional"]["pattern"],
                        "session_end_confidence": profile["dna_strands"]["emotional"]["session_end_confidence"]
                    }
                },
                "week_stats": {
                    "sessions_completed": profile.get("sessions_analyzed", 0),
                    "total_minutes": profile.get("total_speaking_minutes", 0)
                },
                "created_at": datetime.utcnow()
            }

            await db.speaking_dna_history.insert_one(snapshot)
            snapshots_created += 1

        logger.info(f"Created {snapshots_created} weekly DNA snapshots")
        return snapshots_created


# Singleton instance
speaking_dna_service = SpeakingDNAService()
```

### 2. speaking_dna_routes.py

```python
"""
Speaking DNA API Routes
=======================
REST endpoints for Speaking DNA feature.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime

from auth import get_current_user
from speaking_dna_service import speaking_dna_service

router = APIRouter(prefix="/api/speaking-dna", tags=["Speaking DNA"])


# ============================================================================
# Request/Response Models
# ============================================================================

class SessionDataInput(BaseModel):
    """Input model for session data to analyze."""
    session_id: str
    session_type: str = Field(..., pattern="^(learning|freestyle|news)$")
    duration_seconds: int = Field(..., ge=0)
    user_turns: List[Dict[str, Any]]
    corrections_received: List[Dict[str, Any]] = []
    challenges_offered: int = 0
    challenges_accepted: int = 0
    topics_discussed: List[str] = []


class AnalyzeSessionResponse(BaseModel):
    """Response after analyzing a session."""
    success: bool
    breakthroughs: List[Dict[str, Any]]
    session_insights: Dict[str, Any]


class DNAProfileResponse(BaseModel):
    """Full DNA profile response."""
    profile: Optional[Dict[str, Any]]
    has_profile: bool


class EvolutionResponse(BaseModel):
    """DNA evolution history response."""
    evolution: List[Dict[str, Any]]
    weeks_tracked: int


class BreakthroughsResponse(BaseModel):
    """Breakthroughs list response."""
    breakthroughs: List[Dict[str, Any]]
    total_count: int


class CoachInstructionsResponse(BaseModel):
    """Coach instructions response."""
    instructions: str
    has_profile: bool


# ============================================================================
# Endpoints
# ============================================================================

@router.post("/analyze-session", response_model=AnalyzeSessionResponse)
async def analyze_session(
    language: str,
    session_data: SessionDataInput,
    current_user: dict = Depends(get_current_user)
):
    """
    Analyze a completed session and update Speaking DNA profile.

    This endpoint should be called after each speaking session ends.
    It updates the user's DNA profile and detects any breakthroughs.
    """
    try:
        result = await speaking_dna_service.analyze_session_for_dna(
            user_id=str(current_user["_id"]),
            language=language,
            session_data=session_data.dict()
        )

        return AnalyzeSessionResponse(
            success=True,
            breakthroughs=result["breakthroughs"],
            session_insights=result["session_insights"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze session: {str(e)}"
        )


@router.get("/profile/{language}", response_model=DNAProfileResponse)
async def get_dna_profile(
    language: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get the user's current Speaking DNA profile for a language.

    Returns the full profile including all 6 DNA strands,
    overall archetype, strengths, and growth areas.
    """
    profile = await speaking_dna_service.get_dna_profile(
        user_id=str(current_user["_id"]),
        language=language
    )

    return DNAProfileResponse(
        profile=profile,
        has_profile=profile is not None
    )


@router.get("/evolution/{language}", response_model=EvolutionResponse)
async def get_dna_evolution(
    language: str,
    weeks: int = 12,
    current_user: dict = Depends(get_current_user)
):
    """
    Get the evolution history of Speaking DNA over time.

    Returns weekly snapshots for visualization in the
    evolution timeline chart.
    """
    evolution = await speaking_dna_service.get_dna_evolution(
        user_id=str(current_user["_id"]),
        language=language,
        weeks=weeks
    )

    return EvolutionResponse(
        evolution=evolution,
        weeks_tracked=len(evolution)
    )


@router.get("/breakthroughs/{language}", response_model=BreakthroughsResponse)
async def get_breakthroughs(
    language: str,
    limit: int = 20,
    uncelebrated_only: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """
    Get the user's breakthrough moments.

    Can filter to only uncelebrated breakthroughs for
    displaying celebration modals.
    """
    breakthroughs = await speaking_dna_service.get_breakthroughs(
        user_id=str(current_user["_id"]),
        language=language,
        limit=limit,
        uncelebrated_only=uncelebrated_only
    )

    return BreakthroughsResponse(
        breakthroughs=breakthroughs,
        total_count=len(breakthroughs)
    )


@router.post("/breakthroughs/{breakthrough_id}/celebrate")
async def celebrate_breakthrough(
    breakthrough_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Mark a breakthrough as celebrated.

    Called when the user dismisses a breakthrough celebration modal.
    """
    success = await speaking_dna_service.mark_breakthrough_celebrated(breakthrough_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Breakthrough not found"
        )

    return {"success": True}


@router.get("/coach-instructions/{language}", response_model=CoachInstructionsResponse)
async def get_coach_instructions(
    language: str,
    session_type: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get DNA-aware coaching instructions for the AI tutor.

    Called at the start of each session to personalize
    the AI coach's behavior based on the user's DNA profile.
    """
    instructions = await speaking_dna_service.build_coach_instructions(
        user_id=str(current_user["_id"]),
        language=language,
        session_type=session_type
    )

    profile = await speaking_dna_service.get_dna_profile(
        user_id=str(current_user["_id"]),
        language=language
    )

    return CoachInstructionsResponse(
        instructions=instructions,
        has_profile=profile is not None
    )
```

### 3. Integration with Existing Code

#### In `prompt_consolidation.py`:

Add this function and modify `build_tutor_instructions`:

```python
# At the top, add import
from speaking_dna_service import speaking_dna_service

# Add this helper function
async def get_dna_coach_context(user_id: str, language: str, session_type: str) -> str:
    """Get DNA-based coaching context for the tutor prompt."""
    try:
        return await speaking_dna_service.build_coach_instructions(
            user_id=user_id,
            language=language,
            session_type=session_type
        )
    except Exception as e:
        logger.warning(f"Failed to get DNA context: {e}")
        return ""

# Modify build_tutor_instructions to include DNA context
async def build_tutor_instructions(
    user_id: str,
    target_language: str,
    user_level: str,
    session_type: str = "learning",
    # ... other params
) -> str:
    """Build complete tutor instructions including DNA context."""

    # Existing instruction building...
    base_instructions = _build_base_instructions(...)

    # NEW: Add DNA-aware coaching context
    dna_context = await get_dna_coach_context(
        user_id=user_id,
        language=target_language,
        session_type=session_type
    )

    # Combine instructions
    full_instructions = f"""
{base_instructions}

{dna_context}
"""

    return full_instructions
```

#### In `main.py`:

Register the new routes:

```python
from speaking_dna_routes import router as speaking_dna_router

app.include_router(speaking_dna_router)
```

---

## Mobile Implementation

### 1. SpeakingDNAService.ts

```typescript
/**
 * Speaking DNA Service
 * ====================
 * Client service for Speaking DNA feature API calls.
 */

import { apiClient } from './apiClient';

// Types
export interface DNAStrand {
  type?: string;
  level?: string;
  style?: string;
  pattern?: string;
  score?: number;
  description: string;
  trend?: 'declining' | 'stable' | 'improving';
  words_per_minute_avg?: number;
  consistency_score?: number;
  grammar_accuracy?: number;
  challenge_acceptance?: number;
  session_end_confidence?: number;
}

export interface DNAStrands {
  rhythm: DNAStrand;
  confidence: DNAStrand;
  vocabulary: DNAStrand;
  accuracy: DNAStrand;
  learning: DNAStrand;
  emotional: DNAStrand;
}

export interface OverallProfile {
  speaker_archetype: string;
  summary: string;
  coach_approach: string;
  strengths: string[];
  growth_areas: string[];
}

export interface DNAProfile {
  _id: string;
  user_id: string;
  language: string;
  dna_strands: DNAStrands;
  overall_profile: OverallProfile;
  sessions_analyzed: number;
  total_speaking_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Breakthrough {
  _id: string;
  breakthrough_type: string;
  category: string;
  title: string;
  description: string;
  emoji: string;
  metrics: {
    before: Record<string, number>;
    after: Record<string, number>;
    improvement_percent?: number;
  };
  context: {
    session_type: string;
    topics?: string[];
  };
  celebrated: boolean;
  shared: boolean;
  created_at: string;
}

export interface EvolutionSnapshot {
  week_start: string;
  week_number: number;
  strand_snapshots: {
    rhythm: { type: string; consistency_score: number };
    confidence: { level: string; score: number; trend: string };
    vocabulary: { style: string; complexity_level: string };
    accuracy: { pattern: string; grammar_accuracy: number };
    learning: { type: string; challenge_acceptance: number };
    emotional: { pattern: string; session_end_confidence: number };
  };
  week_stats: {
    sessions_completed: number;
    total_minutes: number;
  };
}

export interface SessionTurn {
  transcript: string;
  start_time_ms: number;
  end_time_ms: number;
  ai_prompt_end_time_ms?: number;
}

export interface SessionAnalysisInput {
  session_id: string;
  session_type: 'learning' | 'freestyle' | 'news';
  duration_seconds: number;
  user_turns: SessionTurn[];
  corrections_received?: any[];
  challenges_offered?: number;
  challenges_accepted?: number;
  topics_discussed?: string[];
}

export interface SessionInsights {
  insights: string[];
  highlight_stat: {
    label: string;
    value: number;
  };
}

class SpeakingDNAService {
  /**
   * Get the user's DNA profile for a language
   */
  async getProfile(language: string): Promise<DNAProfile | null> {
    try {
      const response = await apiClient.get(`/api/speaking-dna/profile/${language}`);
      return response.data.profile;
    } catch (error) {
      console.error('Failed to get DNA profile:', error);
      return null;
    }
  }

  /**
   * Get DNA evolution history for visualization
   */
  async getEvolution(language: string, weeks: number = 12): Promise<EvolutionSnapshot[]> {
    try {
      const response = await apiClient.get(`/api/speaking-dna/evolution/${language}`, {
        params: { weeks }
      });
      return response.data.evolution;
    } catch (error) {
      console.error('Failed to get DNA evolution:', error);
      return [];
    }
  }

  /**
   * Get breakthrough moments
   */
  async getBreakthroughs(
    language: string,
    options: { limit?: number; uncelebratedOnly?: boolean } = {}
  ): Promise<Breakthrough[]> {
    try {
      const response = await apiClient.get(`/api/speaking-dna/breakthroughs/${language}`, {
        params: {
          limit: options.limit ?? 20,
          uncelebrated_only: options.uncelebratedOnly ?? false
        }
      });
      return response.data.breakthroughs;
    } catch (error) {
      console.error('Failed to get breakthroughs:', error);
      return [];
    }
  }

  /**
   * Mark a breakthrough as celebrated
   */
  async celebrateBreakthrough(breakthroughId: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/speaking-dna/breakthroughs/${breakthroughId}/celebrate`);
      return true;
    } catch (error) {
      console.error('Failed to celebrate breakthrough:', error);
      return false;
    }
  }

  /**
   * Analyze a completed session and update DNA
   */
  async analyzeSession(
    language: string,
    sessionData: SessionAnalysisInput
  ): Promise<{ breakthroughs: Breakthrough[]; insights: SessionInsights } | null> {
    try {
      const response = await apiClient.post(
        `/api/speaking-dna/analyze-session`,
        sessionData,
        { params: { language } }
      );
      return {
        breakthroughs: response.data.breakthroughs,
        insights: response.data.session_insights
      };
    } catch (error) {
      console.error('Failed to analyze session for DNA:', error);
      return null;
    }
  }

  /**
   * Get coach instructions for a session
   */
  async getCoachInstructions(language: string, sessionType: string): Promise<string> {
    try {
      const response = await apiClient.get(`/api/speaking-dna/coach-instructions/${language}`, {
        params: { session_type: sessionType }
      });
      return response.data.instructions;
    } catch (error) {
      console.error('Failed to get coach instructions:', error);
      return '';
    }
  }
}

export const speakingDNAService = new SpeakingDNAService();
```

### 2. Session Metrics Collection Hook

```typescript
/**
 * useSessionMetrics.ts
 * ====================
 * Hook to collect metrics during a speaking session for DNA analysis.
 */

import { useRef, useCallback } from 'react';
import { SessionTurn, SessionAnalysisInput } from '../services/SpeakingDNAService';

interface MetricsCollectorOptions {
  sessionId: string;
  sessionType: 'learning' | 'freestyle' | 'news';
}

export function useSessionMetrics({ sessionId, sessionType }: MetricsCollectorOptions) {
  const sessionStartTime = useRef<number>(Date.now());
  const userTurns = useRef<SessionTurn[]>([]);
  const corrections = useRef<any[]>([]);
  const challengesOffered = useRef<number>(0);
  const challengesAccepted = useRef<number>(0);
  const topics = useRef<string[]>([]);
  const lastAIPromptEndTime = useRef<number | null>(null);

  /**
   * Call when AI finishes speaking (user's turn to respond)
   */
  const markAIPromptEnd = useCallback(() => {
    lastAIPromptEndTime.current = Date.now();
  }, []);

  /**
   * Record a user's speech turn
   */
  const recordUserTurn = useCallback((
    transcript: string,
    startTimeMs: number,
    endTimeMs: number
  ) => {
    userTurns.current.push({
      transcript,
      start_time_ms: startTimeMs - sessionStartTime.current,
      end_time_ms: endTimeMs - sessionStartTime.current,
      ai_prompt_end_time_ms: lastAIPromptEndTime.current
        ? lastAIPromptEndTime.current - sessionStartTime.current
        : undefined
    });
    lastAIPromptEndTime.current = null;
  }, []);

  /**
   * Record when a correction is given to the user
   */
  const recordCorrection = useCallback((correction: any) => {
    corrections.current.push(correction);
  }, []);

  /**
   * Record when a challenge is offered
   */
  const recordChallengeOffered = useCallback(() => {
    challengesOffered.current += 1;
  }, []);

  /**
   * Record when user accepts a challenge
   */
  const recordChallengeAccepted = useCallback(() => {
    challengesAccepted.current += 1;
  }, []);

  /**
   * Add a topic discussed in the session
   */
  const addTopic = useCallback((topic: string) => {
    if (!topics.current.includes(topic)) {
      topics.current.push(topic);
    }
  }, []);

  /**
   * Get the complete session data for DNA analysis
   */
  const getSessionData = useCallback((): SessionAnalysisInput => {
    const durationSeconds = Math.round((Date.now() - sessionStartTime.current) / 1000);

    return {
      session_id: sessionId,
      session_type: sessionType,
      duration_seconds: durationSeconds,
      user_turns: userTurns.current,
      corrections_received: corrections.current,
      challenges_offered: challengesOffered.current,
      challenges_accepted: challengesAccepted.current,
      topics_discussed: topics.current
    };
  }, [sessionId, sessionType]);

  /**
   * Reset metrics (for new session)
   */
  const reset = useCallback(() => {
    sessionStartTime.current = Date.now();
    userTurns.current = [];
    corrections.current = [];
    challengesOffered.current = 0;
    challengesAccepted.current = 0;
    topics.current = [];
    lastAIPromptEndTime.current = null;
  }, []);

  return {
    markAIPromptEnd,
    recordUserTurn,
    recordCorrection,
    recordChallengeOffered,
    recordChallengeAccepted,
    addTopic,
    getSessionData,
    reset
  };
}
```

### 3. SpeakingDNAScreen.tsx

```tsx
/**
 * SpeakingDNAScreen.tsx
 * =====================
 * Main screen for displaying the user's Speaking DNA profile.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

import { speakingDNAService, DNAProfile, Breakthrough, EvolutionSnapshot } from '../services/SpeakingDNAService';
import { useLanguage } from '../contexts/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Strand colors for visualization
const STRAND_COLORS = {
  rhythm: '#FF6B6B',
  confidence: '#4ECDC4',
  vocabulary: '#45B7D1',
  accuracy: '#96CEB4',
  learning: '#FFEAA7',
  emotional: '#DDA0DD',
};

// Strand icons (use your icon library)
const STRAND_ICONS = {
  rhythm: '🎵',
  confidence: '💪',
  vocabulary: '📚',
  accuracy: '🎯',
  learning: '🧠',
  emotional: '💜',
};

export const SpeakingDNAScreen: React.FC = () => {
  const { targetLanguage } = useLanguage();
  const [profile, setProfile] = useState<DNAProfile | null>(null);
  const [evolution, setEvolution] = useState<EvolutionSnapshot[]>([]);
  const [breakthroughs, setBreakthroughs] = useState<Breakthrough[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'evolution' | 'breakthroughs'>('profile');

  // Animation values for DNA helix
  const helixRotation = useSharedValue(0);

  useEffect(() => {
    loadDNAData();
    // Animate helix
    helixRotation.value = withSequence(
      withSpring(360, { damping: 20 }),
    );
  }, [targetLanguage]);

  const loadDNAData = async () => {
    setLoading(true);
    try {
      const [profileData, evolutionData, breakthroughsData] = await Promise.all([
        speakingDNAService.getProfile(targetLanguage),
        speakingDNAService.getEvolution(targetLanguage, 12),
        speakingDNAService.getBreakthroughs(targetLanguage, { limit: 10 }),
      ]);

      setProfile(profileData);
      setEvolution(evolutionData);
      setBreakthroughs(breakthroughsData);
    } catch (error) {
      console.error('Failed to load DNA data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareDNA = useCallback(async () => {
    if (!profile) return;

    const shareMessage = `My Speaking DNA for ${targetLanguage}:\n` +
      `🧬 ${profile.overall_profile.speaker_archetype}\n` +
      `💪 Confidence: ${profile.dna_strands.confidence.level}\n` +
      `📚 Vocabulary: ${profile.dna_strands.vocabulary.style}\n` +
      `🎯 Accuracy: ${Math.round((profile.dna_strands.accuracy.grammar_accuracy || 0) * 100)}%\n\n` +
      `#MyTacoAI #SpeakingDNA`;

    try {
      await Share.share({ message: shareMessage });
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [profile, targetLanguage]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>Analyzing your Speaking DNA...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Your DNA Awaits</Text>
          <Text style={styles.emptyText}>
            Complete a few speaking sessions to build your unique Speaking DNA profile.
          </Text>
          <Text style={styles.emptyHint}>
            Your DNA will reveal your speaking rhythm, confidence patterns, and learning style.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Speaking DNA</Text>
          <TouchableOpacity onPress={handleShareDNA} style={styles.shareButton}>
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Archetype Card */}
        <View style={styles.archetypeCard}>
          <Text style={styles.archetypeLabel}>You are</Text>
          <Text style={styles.archetypeName}>{profile.overall_profile.speaker_archetype}</Text>
          <Text style={styles.archetypeSummary}>{profile.overall_profile.summary}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.sessions_analyzed}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.total_speaking_minutes}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {(['profile', 'evolution', 'breakthroughs'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content based on active tab */}
        {activeTab === 'profile' && (
          <DNAStrandsView strands={profile.dna_strands} />
        )}

        {activeTab === 'evolution' && (
          <EvolutionView evolution={evolution} />
        )}

        {activeTab === 'breakthroughs' && (
          <BreakthroughsView
            breakthroughs={breakthroughs}
            onCelebrate={async (id) => {
              await speakingDNAService.celebrateBreakthrough(id);
              setBreakthroughs(prev =>
                prev.map(b => b._id === id ? { ...b, celebrated: true } : b)
              );
            }}
          />
        )}

        {/* Strengths & Growth Areas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Strengths</Text>
          <View style={styles.tagContainer}>
            {profile.overall_profile.strengths.map((strength, index) => (
              <View key={index} style={styles.strengthTag}>
                <Text style={styles.strengthTagText}>
                  {strength.replace(/_/g, ' ')}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Growth Opportunities</Text>
          <View style={styles.tagContainer}>
            {profile.overall_profile.growth_areas.map((area, index) => (
              <View key={index} style={styles.growthTag}>
                <Text style={styles.growthTagText}>
                  {area.replace(/_/g, ' ')}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// DNA Strands visualization component
const DNAStrandsView: React.FC<{ strands: DNAProfile['dna_strands'] }> = ({ strands }) => {
  return (
    <View style={styles.strandsContainer}>
      {Object.entries(strands).map(([key, strand]) => (
        <View key={key} style={styles.strandCard}>
          <View style={styles.strandHeader}>
            <Text style={styles.strandIcon}>{STRAND_ICONS[key as keyof typeof STRAND_ICONS]}</Text>
            <Text style={styles.strandName}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
            <View
              style={[
                styles.strandIndicator,
                { backgroundColor: STRAND_COLORS[key as keyof typeof STRAND_COLORS] }
              ]}
            />
          </View>

          <Text style={styles.strandType}>
            {strand.type || strand.level || strand.style || strand.pattern || 'Unknown'}
          </Text>

          <Text style={styles.strandDescription}>{strand.description}</Text>

          {/* Trend indicator for confidence */}
          {strand.trend && (
            <View style={styles.trendContainer}>
              <Text style={[
                styles.trendText,
                strand.trend === 'improving' && styles.trendImproving,
                strand.trend === 'declining' && styles.trendDeclining,
              ]}>
                {strand.trend === 'improving' ? '↑' : strand.trend === 'declining' ? '↓' : '→'} {strand.trend}
              </Text>
            </View>
          )}

          {/* Score bar if available */}
          {strand.score !== undefined && (
            <View style={styles.scoreBarContainer}>
              <View
                style={[
                  styles.scoreBar,
                  {
                    width: `${strand.score * 100}%`,
                    backgroundColor: STRAND_COLORS[key as keyof typeof STRAND_COLORS]
                  }
                ]}
              />
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

// Evolution timeline component
const EvolutionView: React.FC<{ evolution: EvolutionSnapshot[] }> = ({ evolution }) => {
  if (evolution.length < 2) {
    return (
      <View style={styles.emptyEvolution}>
        <Text style={styles.emptyEvolutionText}>
          Keep practicing! Your evolution chart will appear after a few weeks of sessions.
        </Text>
      </View>
    );
  }

  const confidenceData = evolution.map(e => e.strand_snapshots.confidence.score);
  const labels = evolution.map(e => `W${e.week_number}`);

  return (
    <View style={styles.evolutionContainer}>
      <Text style={styles.evolutionTitle}>Confidence Evolution</Text>
      <LineChart
        data={{
          labels: labels.slice(-6), // Last 6 weeks
          datasets: [{
            data: confidenceData.slice(-6),
            color: () => STRAND_COLORS.confidence,
            strokeWidth: 2,
          }],
        }}
        width={SCREEN_WIDTH - 40}
        height={200}
        chartConfig={{
          backgroundColor: '#1a1a2e',
          backgroundGradientFrom: '#1a1a2e',
          backgroundGradientTo: '#16213e',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: STRAND_COLORS.confidence,
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

// Breakthroughs list component
const BreakthroughsView: React.FC<{
  breakthroughs: Breakthrough[];
  onCelebrate: (id: string) => void;
}> = ({ breakthroughs, onCelebrate }) => {
  if (breakthroughs.length === 0) {
    return (
      <View style={styles.emptyBreakthroughs}>
        <Text style={styles.emptyBreakthroughsText}>
          Your breakthrough moments will appear here. Keep practicing to unlock achievements!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.breakthroughsContainer}>
      {breakthroughs.map((breakthrough) => (
        <TouchableOpacity
          key={breakthrough._id}
          style={[
            styles.breakthroughCard,
            !breakthrough.celebrated && styles.breakthroughCardNew,
          ]}
          onPress={() => !breakthrough.celebrated && onCelebrate(breakthrough._id)}
        >
          <Text style={styles.breakthroughEmoji}>{breakthrough.emoji}</Text>
          <View style={styles.breakthroughContent}>
            <Text style={styles.breakthroughTitle}>{breakthrough.title}</Text>
            <Text style={styles.breakthroughDescription}>{breakthrough.description}</Text>
            <Text style={styles.breakthroughDate}>
              {new Date(breakthrough.created_at).toLocaleDateString()}
            </Text>
          </View>
          {!breakthrough.celebrated && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#8892b0',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ccd6f6',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#8892b0',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyHint: {
    fontSize: 14,
    color: '#64ffda',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ccd6f6',
  },
  shareButton: {
    backgroundColor: '#64ffda',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareButtonText: {
    color: '#0f0f23',
    fontWeight: '600',
  },
  archetypeCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#64ffda33',
  },
  archetypeLabel: {
    fontSize: 14,
    color: '#8892b0',
    marginBottom: 4,
  },
  archetypeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#64ffda',
    marginBottom: 8,
  },
  archetypeSummary: {
    fontSize: 14,
    color: '#ccd6f6',
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#8892b033',
    paddingTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ccd6f6',
  },
  statLabel: {
    fontSize: 12,
    color: '#8892b0',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#64ffda22',
  },
  tabText: {
    color: '#8892b0',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#64ffda',
  },
  strandsContainer: {
    gap: 12,
  },
  strandCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
  },
  strandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  strandIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  strandName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ccd6f6',
    flex: 1,
  },
  strandIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  strandType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64ffda',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  strandDescription: {
    fontSize: 13,
    color: '#8892b0',
    lineHeight: 18,
  },
  trendContainer: {
    marginTop: 8,
  },
  trendText: {
    fontSize: 12,
    color: '#8892b0',
    textTransform: 'capitalize',
  },
  trendImproving: {
    color: '#4ECDC4',
  },
  trendDeclining: {
    color: '#FF6B6B',
  },
  scoreBarContainer: {
    height: 4,
    backgroundColor: '#8892b033',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 2,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ccd6f6',
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  strengthTag: {
    backgroundColor: '#4ECDC433',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  strengthTagText: {
    color: '#4ECDC4',
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  growthTag: {
    backgroundColor: '#FFEAA733',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  growthTagText: {
    color: '#FFEAA7',
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  evolutionContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
  },
  evolutionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ccd6f6',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 12,
  },
  emptyEvolution: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyEvolutionText: {
    color: '#8892b0',
    textAlign: 'center',
  },
  breakthroughsContainer: {
    gap: 12,
  },
  breakthroughCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakthroughCardNew: {
    borderWidth: 1,
    borderColor: '#64ffda',
  },
  breakthroughEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  breakthroughContent: {
    flex: 1,
  },
  breakthroughTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ccd6f6',
    marginBottom: 4,
  },
  breakthroughDescription: {
    fontSize: 13,
    color: '#8892b0',
    marginBottom: 4,
  },
  breakthroughDate: {
    fontSize: 11,
    color: '#8892b066',
  },
  newBadge: {
    backgroundColor: '#64ffda',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newBadgeText: {
    color: '#0f0f23',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyBreakthroughs: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyBreakthroughsText: {
    color: '#8892b0',
    textAlign: 'center',
  },
});

export default SpeakingDNAScreen;
```

### 4. Integration with ConversationScreen

Add to your existing `ConversationScreen.tsx`:

```tsx
// Import the hook
import { useSessionMetrics } from '../hooks/useSessionMetrics';
import { speakingDNAService } from '../services/SpeakingDNAService';

// Inside the component:
const sessionMetrics = useSessionMetrics({
  sessionId: currentSessionId,
  sessionType: sessionType, // 'learning' | 'freestyle' | 'news'
});

// When AI finishes speaking:
const handleAIResponseComplete = () => {
  sessionMetrics.markAIPromptEnd();
  // ... existing code
};

// When user speech is transcribed:
const handleUserTranscript = (transcript: string, startMs: number, endMs: number) => {
  sessionMetrics.recordUserTurn(transcript, startMs, endMs);
  // ... existing code
};

// When a correction is given:
const handleCorrection = (correction: any) => {
  sessionMetrics.recordCorrection(correction);
  // ... existing code
};

// When session ends:
const handleSessionEnd = async () => {
  // Analyze session for DNA
  const sessionData = sessionMetrics.getSessionData();
  const result = await speakingDNAService.analyzeSession(
    targetLanguage,
    sessionData
  );

  if (result?.breakthroughs.length > 0) {
    // Show breakthrough celebration modal
    showBreakthroughCelebration(result.breakthroughs[0]);
  }

  // ... existing cleanup code
};
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
1. Create MongoDB collections with indexes
2. Implement `speaking_dna_service.py` core analysis methods
3. Add basic routes for profile retrieval
4. Test with mock session data

### Phase 2: Integration (Week 3-4)
1. Integrate with `prompt_consolidation.py` for coach instructions
2. Add session metrics collection hook to mobile
3. Call DNA analysis at end of each session
4. Implement basic mobile profile view

### Phase 3: Visualization (Week 5-6)
1. Build complete `SpeakingDNAScreen` with animations
2. Implement evolution timeline chart
3. Add breakthrough celebration modals
4. Create shareable DNA cards

### Phase 4: Polish (Week 7-8)
1. Add weekly snapshot cron job
2. Refine breakthrough detection thresholds
3. A/B test DNA-informed coaching
4. Gather user feedback and iterate

---

## Testing Strategy

### Backend Tests

```python
# test_speaking_dna_service.py

import pytest
from speaking_dna_service import SpeakingDNAService

@pytest.fixture
def service():
    return SpeakingDNAService()

@pytest.fixture
def sample_session_data():
    return {
        "session_id": "test123",
        "session_type": "learning",
        "duration_seconds": 300,
        "user_turns": [
            {
                "transcript": "Ik ga naar de winkel",
                "start_time_ms": 12500,
                "end_time_ms": 15200,
                "ai_prompt_end_time_ms": 11000
            },
            {
                "transcript": "Ik wil eh brood kopen",
                "start_time_ms": 20000,
                "end_time_ms": 23500,
                "ai_prompt_end_time_ms": 18000
            }
        ],
        "corrections_received": [],
        "challenges_offered": 2,
        "challenges_accepted": 1,
        "topics_discussed": ["shopping"]
    }

def test_extract_session_metrics(service, sample_session_data):
    metrics = service._extract_session_metrics(sample_session_data)

    assert metrics["session_duration_minutes"] == 5
    assert metrics["turns_count"] == 2
    assert metrics["filler_rate_per_minute"] > 0  # "eh" detected
    assert metrics["challenges_offered"] == 2
    assert metrics["challenges_accepted"] == 1

def test_calculate_strand_updates_new_user(service, sample_session_data):
    metrics = service._extract_session_metrics(sample_session_data)
    strands = service._calculate_strand_updates(None, metrics, "learning")

    assert "rhythm" in strands
    assert "confidence" in strands
    assert strands["confidence"]["level"] in ["hesitant", "building", "comfortable", "fluent"]

def test_breakthrough_detection(service):
    # Test confidence jump detection
    old_profile = {
        "dna_strands": {
            "confidence": {"score": 0.5, "level": "building"}
        }
    }
    new_strands = {
        "confidence": {"score": 0.70, "level": "comfortable"}
    }

    # Should detect both score jump and level up
    breakthroughs = service._detect_breakthroughs(
        "user123", "dutch", old_profile, new_strands, {"session_id": "s1"}
    )

    assert len(breakthroughs) >= 1
```

### Mobile Tests

```typescript
// __tests__/SpeakingDNAService.test.ts

import { speakingDNAService } from '../services/SpeakingDNAService';

jest.mock('../services/apiClient');

describe('SpeakingDNAService', () => {
  it('should return null for new user without profile', async () => {
    const profile = await speakingDNAService.getProfile('dutch');
    expect(profile).toBeNull();
  });

  it('should correctly format session data for analysis', async () => {
    const sessionData = {
      session_id: 'test123',
      session_type: 'learning' as const,
      duration_seconds: 300,
      user_turns: [{
        transcript: 'Test',
        start_time_ms: 1000,
        end_time_ms: 2000,
      }],
    };

    // Verify structure
    expect(sessionData.session_type).toBe('learning');
    expect(sessionData.user_turns).toHaveLength(1);
  });
});
```

---

## Migration for Existing Users

For users who have existing session history, run a one-time migration:

```python
# migrate_existing_users_to_dna.py

async def migrate_existing_users():
    """
    One-time migration to create DNA profiles for existing users
    based on their session history.
    """
    db = await get_database()

    # Get all users with session history
    users_with_sessions = await db.sessions.aggregate([
        {"$group": {
            "_id": {"user_id": "$user_id", "language": "$target_language"},
            "sessions": {"$push": "$$ROOT"},
            "count": {"$sum": 1}
        }},
        {"$match": {"count": {"$gte": 3}}}  # At least 3 sessions
    ]).to_list(None)

    service = SpeakingDNAService()
    migrated = 0

    for user_data in users_with_sessions:
        user_id = str(user_data["_id"]["user_id"])
        language = user_data["_id"]["language"]

        # Check if profile already exists
        existing = await db.speaking_dna_profiles.find_one({
            "user_id": ObjectId(user_id),
            "language": language
        })

        if existing:
            continue

        # Process each session to build profile
        for session in sorted(user_data["sessions"], key=lambda s: s["created_at"]):
            session_data = convert_legacy_session_to_dna_format(session)
            await service.analyze_session_for_dna(user_id, language, session_data)

        migrated += 1
        logger.info(f"Migrated user {user_id} for {language}")

    logger.info(f"Migration complete: {migrated} users migrated")

def convert_legacy_session_to_dna_format(session: dict) -> dict:
    """Convert existing session format to DNA analysis format."""
    # Adapt based on your existing session schema
    return {
        "session_id": str(session["_id"]),
        "session_type": session.get("type", "learning"),
        "duration_seconds": session.get("duration_seconds", 300),
        "user_turns": [
            {
                "transcript": turn.get("user_message", ""),
                "start_time_ms": turn.get("timestamp_ms", 0),
                "end_time_ms": turn.get("timestamp_ms", 0) + 3000,
            }
            for turn in session.get("conversation", [])
            if turn.get("role") == "user"
        ],
        "corrections_received": session.get("corrections", []),
        "challenges_offered": 0,
        "challenges_accepted": 0,
        "topics_discussed": session.get("topics", [])
    }
```

---

## Weekly Cron Job Setup

Add to your scheduler (e.g., APScheduler, Celery, or Railway cron):

```python
# scheduler.py

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from speaking_dna_service import speaking_dna_service

scheduler = AsyncIOScheduler()

@scheduler.scheduled_job('cron', day_of_week='sun', hour=0, minute=0)
async def weekly_dna_snapshots():
    """Create weekly DNA snapshots every Sunday at midnight."""
    try:
        count = await speaking_dna_service.create_weekly_snapshots()
        logger.info(f"Weekly DNA snapshots created: {count}")
    except Exception as e:
        logger.error(f"Failed to create weekly snapshots: {e}")

# Start scheduler
scheduler.start()
```

---

## Summary

This implementation guide provides everything needed to build the Speaking DNA feature:

1. **3 MongoDB Collections**: `speaking_dna_profiles`, `speaking_dna_history`, `speaking_breakthroughs`
2. **Backend Service**: Complete `speaking_dna_service.py` with all analysis methods
3. **API Routes**: Full REST API for DNA operations
4. **Mobile Service**: TypeScript client for API calls
5. **React Native Screen**: Complete UI with DNA visualization
6. **Integration Points**: How to connect with existing conversation and prompt systems
7. **Testing Strategy**: Unit tests for backend and mobile
8. **Migration Plan**: For existing users
9. **Cron Job**: Weekly snapshot automation

The feature is designed to be:
- **Non-intrusive**: Works with existing session flow
- **Cost-effective**: No audio storage, all analysis in-memory
- **Incremental**: Can be built in phases
- **Shareable**: DNA cards for viral growth

Good luck with implementation!
