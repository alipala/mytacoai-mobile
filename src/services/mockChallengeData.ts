/**
 * Mock Challenge Data Generator
 * Generates personalized challenge data based on user's CEFR level
 * For prototyping the Explore tab before backend implementation
 */

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type ChallengeType =
  | 'error_spotting'
  | 'swipe_fix'
  | 'micro_quiz'
  | 'smart_flashcard'
  | 'native_check'
  | 'brain_tickler';

export interface ChallengeBase {
  id: string;
  type: ChallengeType;
  title: string;
  emoji: string;
  description: string;
  cefrLevel: CEFRLevel;
  estimatedSeconds: number;
  completed?: boolean;
}

export interface ErrorSpottingChallenge extends ChallengeBase {
  type: 'error_spotting';
  sentence: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation: string;
  correctedSentence: string;
}

export interface SwipeFixChallenge extends ChallengeBase {
  type: 'swipe_fix';
  concept: string;
  examples: Array<{
    text: string;
    isCorrect: boolean;
    explanation: string;
  }>;
}

export interface MicroQuizChallenge extends ChallengeBase {
  type: 'micro_quiz';
  question: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation: string;
}

export interface SmartFlashcardChallenge extends ChallengeBase {
  type: 'smart_flashcard';
  word: string;
  context: string;
  explanation: string;
  exampleSentence: string;
}

export interface NativeCheckChallenge extends ChallengeBase {
  type: 'native_check';
  sentence: string;
  isNatural: boolean;
  correctedVersion?: string;
  explanation: string;
}

export interface BrainTicklerChallenge extends ChallengeBase {
  type: 'brain_tickler';
  question: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  timeLimit: number; // in seconds
  explanation: string;
}

export type Challenge =
  | ErrorSpottingChallenge
  | SwipeFixChallenge
  | MicroQuizChallenge
  | SmartFlashcardChallenge
  | NativeCheckChallenge
  | BrainTicklerChallenge;

// Mock data by CEFR level
const errorSpottingByLevel: Record<CEFRLevel, ErrorSpottingChallenge[]> = {
  A1: [
    {
      id: 'es_a1_1',
      type: 'error_spotting',
      title: 'Spot the Mistake',
      emoji: '🧩',
      description: 'Can you find what\'s wrong?',
      cefrLevel: 'A1',
      estimatedSeconds: 10,
      sentence: 'I go to school yesterday.',
      options: [
        { id: 'opt1', text: 'I go', isCorrect: true },
        { id: 'opt2', text: 'to school', isCorrect: false },
        { id: 'opt3', text: 'yesterday', isCorrect: false },
      ],
      explanation: 'Use "went" for past actions, not "go"',
      correctedSentence: 'I went to school yesterday.',
    },
    {
      id: 'es_a1_2',
      type: 'error_spotting',
      title: 'Spot the Mistake',
      emoji: '🧩',
      description: 'Find the error',
      cefrLevel: 'A1',
      estimatedSeconds: 10,
      sentence: 'She have a blue car.',
      options: [
        { id: 'opt1', text: 'She have', isCorrect: true },
        { id: 'opt2', text: 'a blue', isCorrect: false },
        { id: 'opt3', text: 'car', isCorrect: false },
      ],
      explanation: 'Use "has" with she/he/it, not "have"',
      correctedSentence: 'She has a blue car.',
    },
  ],
  A2: [
    {
      id: 'es_a2_1',
      type: 'error_spotting',
      title: 'Spot the Mistake',
      emoji: '🧩',
      description: 'What\'s wrong here?',
      cefrLevel: 'A2',
      estimatedSeconds: 10,
      sentence: 'I am living here since 2020.',
      options: [
        { id: 'opt1', text: 'I am living', isCorrect: true },
        { id: 'opt2', text: 'here', isCorrect: false },
        { id: 'opt3', text: 'since 2020', isCorrect: false },
      ],
      explanation: 'Use "have been living" with "since"',
      correctedSentence: 'I have been living here since 2020.',
    },
  ],
  B1: [
    {
      id: 'es_b1_1',
      type: 'error_spotting',
      title: 'Spot the Mistake',
      emoji: '🧩',
      description: 'Can you spot the error?',
      cefrLevel: 'B1',
      estimatedSeconds: 12,
      sentence: 'If I would have time, I would help you.',
      options: [
        { id: 'opt1', text: 'If I would have', isCorrect: true },
        { id: 'opt2', text: 'time', isCorrect: false },
        { id: 'opt3', text: 'would help you', isCorrect: false },
      ],
      explanation: 'Use "had" in the if-clause, not "would have"',
      correctedSentence: 'If I had time, I would help you.',
    },
  ],
  B2: [
    {
      id: 'es_b2_1',
      type: 'error_spotting',
      title: 'Spot the Mistake',
      emoji: '🧩',
      description: 'Find the subtle error',
      cefrLevel: 'B2',
      estimatedSeconds: 15,
      sentence: 'Despite of the rain, we went hiking.',
      options: [
        { id: 'opt1', text: 'Despite of', isCorrect: true },
        { id: 'opt2', text: 'the rain', isCorrect: false },
        { id: 'opt3', text: 'went hiking', isCorrect: false },
      ],
      explanation: 'Use "Despite" without "of" or use "In spite of"',
      correctedSentence: 'Despite the rain, we went hiking.',
    },
  ],
  C1: [
    {
      id: 'es_c1_1',
      type: 'error_spotting',
      title: 'Spot the Mistake',
      emoji: '🧩',
      description: 'Catch the subtle mistake',
      cefrLevel: 'C1',
      estimatedSeconds: 15,
      sentence: 'The data suggests that climate change is accelerating.',
      options: [
        { id: 'opt1', text: 'The data suggests', isCorrect: true },
        { id: 'opt2', text: 'climate change', isCorrect: false },
        { id: 'opt3', text: 'is accelerating', isCorrect: false },
      ],
      explanation: '"Data" is often plural in formal writing - use "suggest"',
      correctedSentence: 'The data suggest that climate change is accelerating.',
    },
  ],
  C2: [
    {
      id: 'es_c2_1',
      type: 'error_spotting',
      title: 'Spot the Mistake',
      emoji: '🧩',
      description: 'Advanced error detection',
      cefrLevel: 'C2',
      estimatedSeconds: 18,
      sentence: 'She was reticent to share her opinion on the matter.',
      options: [
        { id: 'opt1', text: 'reticent to', isCorrect: true },
        { id: 'opt2', text: 'share her opinion', isCorrect: false },
        { id: 'opt3', text: 'on the matter', isCorrect: false },
      ],
      explanation: '"Reticent" means unwilling to speak. Use "reluctant to" for unwillingness to do something',
      correctedSentence: 'She was reluctant to share her opinion on the matter.',
    },
  ],
};

const swipeFixByLevel: Record<CEFRLevel, SwipeFixChallenge[]> = {
  A1: [
    {
      id: 'sf_a1_1',
      type: 'swipe_fix',
      title: 'You Struggled With This',
      emoji: '🔄',
      description: 'Swipe to compare',
      cefrLevel: 'A1',
      estimatedSeconds: 12,
      concept: 'Using "a" vs "an"',
      examples: [
        {
          text: 'I have a apple',
          isCorrect: false,
          explanation: 'Use "an" before vowel sounds',
        },
        {
          text: 'I have an apple',
          isCorrect: true,
          explanation: 'Perfect! "An" comes before words starting with vowel sounds',
        },
      ],
    },
  ],
  A2: [
    {
      id: 'sf_a2_1',
      type: 'swipe_fix',
      title: 'You Struggled With This',
      emoji: '🔄',
      description: 'Compare correct vs incorrect',
      cefrLevel: 'A2',
      estimatedSeconds: 12,
      concept: 'Much vs Many',
      examples: [
        {
          text: 'How much books do you have?',
          isCorrect: false,
          explanation: 'Use "many" with countable items',
        },
        {
          text: 'How many books do you have?',
          isCorrect: true,
          explanation: 'Correct! "Many" is for things you can count',
        },
      ],
    },
  ],
  B1: [
    {
      id: 'sf_b1_1',
      type: 'swipe_fix',
      title: 'You Struggled With This',
      emoji: '🔄',
      description: 'Swipe to learn the difference',
      cefrLevel: 'B1',
      estimatedSeconds: 15,
      concept: 'Make vs Do',
      examples: [
        {
          text: 'I need to make my homework',
          isCorrect: false,
          explanation: 'Use "do" with homework, not "make"',
        },
        {
          text: 'I need to do my homework',
          isCorrect: true,
          explanation: 'Perfect! We "do" homework, exercises, and tasks',
        },
      ],
    },
  ],
  B2: [
    {
      id: 'sf_b2_1',
      type: 'swipe_fix',
      title: 'You Struggled With This',
      emoji: '🔄',
      description: 'Compare the nuance',
      cefrLevel: 'B2',
      estimatedSeconds: 15,
      concept: 'Affect vs Effect',
      examples: [
        {
          text: 'The weather will affect the game',
          isCorrect: true,
          explanation: '"Affect" is usually a verb meaning to influence',
        },
        {
          text: 'The weather will have an effect on the game',
          isCorrect: true,
          explanation: '"Effect" is usually a noun meaning the result of a change',
        },
      ],
    },
  ],
  C1: [
    {
      id: 'sf_c1_1',
      type: 'swipe_fix',
      title: 'You Struggled With This',
      emoji: '🔄',
      description: 'Subtle distinction',
      cefrLevel: 'C1',
      estimatedSeconds: 18,
      concept: 'Imply vs Infer',
      examples: [
        {
          text: 'The speaker implied that changes were coming',
          isCorrect: true,
          explanation: '"Imply" means to suggest indirectly (speaker\'s action)',
        },
        {
          text: 'The audience inferred that changes were coming',
          isCorrect: true,
          explanation: '"Infer" means to conclude from evidence (listener\'s action)',
        },
      ],
    },
  ],
  C2: [
    {
      id: 'sf_c2_1',
      type: 'swipe_fix',
      title: 'You Struggled With This',
      emoji: '🔄',
      description: 'Advanced nuance',
      cefrLevel: 'C2',
      estimatedSeconds: 20,
      concept: 'Disinterested vs Uninterested',
      examples: [
        {
          text: 'He was uninterested in the proposal',
          isCorrect: true,
          explanation: '"Uninterested" means not interested or bored',
        },
        {
          text: 'A judge must be disinterested',
          isCorrect: true,
          explanation: '"Disinterested" means impartial, without bias',
        },
      ],
    },
  ],
};

const microQuizByLevel: Record<CEFRLevel, MicroQuizChallenge[]> = {
  A1: [
    {
      id: 'mq_a1_1',
      type: 'micro_quiz',
      title: 'Quick Quiz',
      emoji: '⚡',
      description: 'Fast decision time',
      cefrLevel: 'A1',
      estimatedSeconds: 8,
      question: 'Which is correct?',
      options: [
        { id: 'opt1', text: 'I am go to school', isCorrect: false },
        { id: 'opt2', text: 'I going to school', isCorrect: false },
        { id: 'opt3', text: 'I go to school', isCorrect: true },
      ],
      explanation: 'Use "go" with "I" in simple present',
    },
  ],
  A2: [
    {
      id: 'mq_a2_1',
      type: 'micro_quiz',
      title: 'Quick Quiz',
      emoji: '⚡',
      description: 'Choose the right one',
      cefrLevel: 'A2',
      estimatedSeconds: 10,
      question: 'Complete: "I ____ there yesterday."',
      options: [
        { id: 'opt1', text: 'go', isCorrect: false },
        { id: 'opt2', text: 'went', isCorrect: true },
        { id: 'opt3', text: 'going', isCorrect: false },
      ],
      explanation: '"Went" is the past tense of "go"',
    },
  ],
  B1: [
    {
      id: 'mq_b1_1',
      type: 'micro_quiz',
      title: 'Quick Quiz',
      emoji: '⚡',
      description: 'Choose wisely',
      cefrLevel: 'B1',
      estimatedSeconds: 10,
      question: 'Which preposition fits? "I\'m interested ___ learning Spanish."',
      options: [
        { id: 'opt1', text: 'in', isCorrect: true },
        { id: 'opt2', text: 'on', isCorrect: false },
        { id: 'opt3', text: 'at', isCorrect: false },
      ],
      explanation: 'We use "interested in" for hobbies and activities',
    },
  ],
  B2: [
    {
      id: 'mq_b2_1',
      type: 'micro_quiz',
      title: 'Quick Quiz',
      emoji: '⚡',
      description: 'Make the right choice',
      cefrLevel: 'B2',
      estimatedSeconds: 12,
      question: 'Choose the most natural phrase:',
      options: [
        { id: 'opt1', text: 'I am agree with you', isCorrect: false },
        { id: 'opt2', text: 'I agree with you', isCorrect: true },
        { id: 'opt3', text: 'I am agreeing with you', isCorrect: false },
      ],
      explanation: '"Agree" is a state, not an action. Don\'t use continuous form',
    },
  ],
  C1: [
    {
      id: 'mq_c1_1',
      type: 'micro_quiz',
      title: 'Quick Quiz',
      emoji: '⚡',
      description: 'Advanced choice',
      cefrLevel: 'C1',
      estimatedSeconds: 12,
      question: 'Which sounds most natural?',
      options: [
        { id: 'opt1', text: 'The meeting was very productive', isCorrect: false },
        { id: 'opt2', text: 'The meeting proved highly productive', isCorrect: true },
        { id: 'opt3', text: 'The meeting was much productive', isCorrect: false },
      ],
      explanation: '"Proved highly" is more formal and sophisticated than "very"',
    },
  ],
  C2: [
    {
      id: 'mq_c2_1',
      type: 'micro_quiz',
      title: 'Quick Quiz',
      emoji: '⚡',
      description: 'Expert decision',
      cefrLevel: 'C2',
      estimatedSeconds: 15,
      question: 'Select the most precise usage:',
      options: [
        { id: 'opt1', text: 'The proposal was turned down', isCorrect: false },
        { id: 'opt2', text: 'The proposal was rejected', isCorrect: false },
        { id: 'opt3', text: 'The proposal was summarily dismissed', isCorrect: true },
      ],
      explanation: '"Summarily dismissed" conveys abruptness and finality with precision',
    },
  ],
};

const flashcardByLevel: Record<CEFRLevel, SmartFlashcardChallenge[]> = {
  A1: [
    {
      id: 'fc_a1_1',
      type: 'smart_flashcard',
      title: 'Smart Flashcard',
      emoji: '📚',
      description: 'From your practice',
      cefrLevel: 'A1',
      estimatedSeconds: 10,
      word: 'breakfast',
      context: 'Daily meals',
      explanation: 'The first meal of the day, usually eaten in the morning',
      exampleSentence: 'I always eat breakfast before going to work.',
    },
  ],
  A2: [
    {
      id: 'fc_a2_1',
      type: 'smart_flashcard',
      title: 'Smart Flashcard',
      emoji: '📚',
      description: 'Review this word',
      cefrLevel: 'A2',
      estimatedSeconds: 10,
      word: 'although',
      context: 'Connecting ideas',
      explanation: 'Used to introduce a contrast or unexpected information',
      exampleSentence: 'Although it was raining, we decided to go for a walk.',
    },
  ],
  B1: [
    {
      id: 'fc_b1_1',
      type: 'smart_flashcard',
      title: 'Smart Flashcard',
      emoji: '📚',
      description: 'Word you misused',
      cefrLevel: 'B1',
      estimatedSeconds: 12,
      word: 'get used to',
      context: 'Expressing habits',
      explanation: 'To become familiar with something over time (+ noun/gerund)',
      exampleSentence: 'I\'m getting used to waking up early for work.',
    },
  ],
  B2: [
    {
      id: 'fc_b2_1',
      type: 'smart_flashcard',
      title: 'Smart Flashcard',
      emoji: '📚',
      description: 'Tricky phrase',
      cefrLevel: 'B2',
      estimatedSeconds: 15,
      word: 'take for granted',
      context: 'Idiomatic expressions',
      explanation: 'To fail to appreciate something because you\'re too familiar with it',
      exampleSentence: 'We often take our health for granted until we get sick.',
    },
  ],
  C1: [
    {
      id: 'fc_c1_1',
      type: 'smart_flashcard',
      title: 'Smart Flashcard',
      emoji: '📚',
      description: 'Advanced usage',
      cefrLevel: 'C1',
      estimatedSeconds: 15,
      word: 'nuanced',
      context: 'Sophisticated description',
      explanation: 'Characterized by subtle shades of meaning or expression',
      exampleSentence: 'Her nuanced understanding of the issue impressed the committee.',
    },
  ],
  C2: [
    {
      id: 'fc_c2_1',
      type: 'smart_flashcard',
      title: 'Smart Flashcard',
      emoji: '📚',
      description: 'Expert-level term',
      cefrLevel: 'C2',
      estimatedSeconds: 18,
      word: 'ubiquitous',
      context: 'Formal vocabulary',
      explanation: 'Present, appearing, or found everywhere',
      exampleSentence: 'Smartphones have become ubiquitous in modern society.',
    },
  ],
};

const nativeCheckByLevel: Record<CEFRLevel, NativeCheckChallenge[]> = {
  A1: [
    {
      id: 'nc_a1_1',
      type: 'native_check',
      title: 'Would a Native Say This?',
      emoji: '🧠',
      description: 'Natural or not?',
      cefrLevel: 'A1',
      estimatedSeconds: 10,
      sentence: 'I am have a car.',
      isNatural: false,
      correctedVersion: 'I have a car.',
      explanation: 'Don\'t use "am" with "have" for possession',
    },
  ],
  A2: [
    {
      id: 'nc_a2_1',
      type: 'native_check',
      title: 'Would a Native Say This?',
      emoji: '🧠',
      description: 'Sounds right?',
      cefrLevel: 'A2',
      estimatedSeconds: 10,
      sentence: 'I am going to the cinema tonight.',
      isNatural: true,
      explanation: 'Perfect! This is exactly how natives express future plans',
    },
  ],
  B1: [
    {
      id: 'nc_b1_1',
      type: 'native_check',
      title: 'Would a Native Say This?',
      emoji: '🧠',
      description: 'Natural phrasing?',
      cefrLevel: 'B1',
      estimatedSeconds: 12,
      sentence: 'I did a travel to Spain last summer.',
      isNatural: false,
      correctedVersion: 'I traveled to Spain last summer.',
      explanation: '"Travel" is usually a verb in this context, not "do a travel"',
    },
  ],
  B2: [
    {
      id: 'nc_b2_1',
      type: 'native_check',
      title: 'Would a Native Say This?',
      emoji: '🧠',
      description: 'Does this sound natural?',
      cefrLevel: 'B2',
      estimatedSeconds: 12,
      sentence: 'I\'m looking forward to meet you.',
      isNatural: false,
      correctedVersion: 'I\'m looking forward to meeting you.',
      explanation: 'Use gerund (-ing) after "looking forward to", not infinitive',
    },
  ],
  C1: [
    {
      id: 'nc_c1_1',
      type: 'native_check',
      title: 'Would a Native Say This?',
      emoji: '🧠',
      description: 'Native-like?',
      cefrLevel: 'C1',
      estimatedSeconds: 15,
      sentence: 'The findings underscore the need for immediate action.',
      isNatural: true,
      explanation: 'Excellent! This is sophisticated and natural academic English',
    },
  ],
  C2: [
    {
      id: 'nc_c2_1',
      type: 'native_check',
      title: 'Would a Native Say This?',
      emoji: '🧠',
      description: 'Expert check',
      cefrLevel: 'C2',
      estimatedSeconds: 15,
      sentence: 'The data was analyzed meticulously.',
      isNatural: false,
      correctedVersion: 'The data were analyzed meticulously.',
      explanation: 'In formal writing, "data" is often treated as plural',
    },
  ],
};

const brainTicklerByLevel: Record<CEFRLevel, BrainTicklerChallenge[]> = {
  A1: [
    {
      id: 'bt_a1_1',
      type: 'brain_tickler',
      title: '10-Second Challenge',
      emoji: '⏱️',
      description: 'Beat the clock!',
      cefrLevel: 'A1',
      estimatedSeconds: 10,
      timeLimit: 10,
      question: 'Choose the plural of "child":',
      options: [
        { id: 'opt1', text: 'childs', isCorrect: false },
        { id: 'opt2', text: 'children', isCorrect: true },
        { id: 'opt3', text: 'childrens', isCorrect: false },
      ],
      explanation: '"Children" is the irregular plural of "child"',
    },
  ],
  A2: [
    {
      id: 'bt_a2_1',
      type: 'brain_tickler',
      title: '10-Second Challenge',
      emoji: '⏱️',
      description: 'Quick thinking!',
      cefrLevel: 'A2',
      estimatedSeconds: 10,
      timeLimit: 10,
      question: 'Which is the past of "buy"?',
      options: [
        { id: 'opt1', text: 'buyed', isCorrect: false },
        { id: 'opt2', text: 'bought', isCorrect: true },
        { id: 'opt3', text: 'buied', isCorrect: false },
      ],
      explanation: '"Bought" is the irregular past tense of "buy"',
    },
  ],
  B1: [
    {
      id: 'bt_b1_1',
      type: 'brain_tickler',
      title: '10-Second Challenge',
      emoji: '⏱️',
      description: 'Fast decision!',
      cefrLevel: 'B1',
      estimatedSeconds: 10,
      timeLimit: 10,
      question: 'Complete: "I wish I ___ rich."',
      options: [
        { id: 'opt1', text: 'am', isCorrect: false },
        { id: 'opt2', text: 'were', isCorrect: true },
        { id: 'opt3', text: 'will be', isCorrect: false },
      ],
      explanation: 'Use "were" (not "was") for hypothetical wishes',
    },
  ],
  B2: [
    {
      id: 'bt_b2_1',
      type: 'brain_tickler',
      title: '10-Second Challenge',
      emoji: '⏱️',
      description: 'Race against time!',
      cefrLevel: 'B2',
      estimatedSeconds: 10,
      timeLimit: 10,
      question: 'Which sentence is passive?',
      options: [
        { id: 'opt1', text: 'She wrote the report', isCorrect: false },
        { id: 'opt2', text: 'The report was written', isCorrect: true },
        { id: 'opt3', text: 'She is writing now', isCorrect: false },
      ],
      explanation: 'Passive voice uses "be" + past participle',
    },
  ],
  C1: [
    {
      id: 'bt_c1_1',
      type: 'brain_tickler',
      title: '10-Second Challenge',
      emoji: '⏱️',
      description: 'Think fast!',
      cefrLevel: 'C1',
      estimatedSeconds: 10,
      timeLimit: 10,
      question: 'Which is a causative structure?',
      options: [
        { id: 'opt1', text: 'I cut my hair', isCorrect: false },
        { id: 'opt2', text: 'I had my hair cut', isCorrect: true },
        { id: 'opt3', text: 'I was cutting hair', isCorrect: false },
      ],
      explanation: '"Have something done" shows someone else performed the action',
    },
  ],
  C2: [
    {
      id: 'bt_c2_1',
      type: 'brain_tickler',
      title: '10-Second Challenge',
      emoji: '⏱️',
      description: 'Expert speed test!',
      cefrLevel: 'C2',
      estimatedSeconds: 10,
      timeLimit: 10,
      question: 'Identify the subjunctive mood:',
      options: [
        { id: 'opt1', text: 'If I was rich...', isCorrect: false },
        { id: 'opt2', text: 'I suggest that he leave', isCorrect: true },
        { id: 'opt3', text: 'He might come', isCorrect: false },
      ],
      explanation: 'Subjunctive uses base form after suggest/demand/insist',
    },
  ],
};

/**
 * Get daily challenges for a user based on their CEFR level
 * Returns 3-6 varied challenges
 */
export function getDailyChallenges(cefrLevel: CEFRLevel = 'B1'): Challenge[] {
  const challenges: Challenge[] = [];

  // Always include one of each type (6 total)
  // Randomly select from available challenges for the level
  const errorSpotting = getRandomItem(errorSpottingByLevel[cefrLevel]);
  const swipeFix = getRandomItem(swipeFixByLevel[cefrLevel]);
  const microQuiz = getRandomItem(microQuizByLevel[cefrLevel]);
  const flashcard = getRandomItem(flashcardByLevel[cefrLevel]);
  const nativeCheck = getRandomItem(nativeCheckByLevel[cefrLevel]);
  const brainTickler = getRandomItem(brainTicklerByLevel[cefrLevel]);

  if (errorSpotting) challenges.push(errorSpotting);
  if (swipeFix) challenges.push(swipeFix);
  if (microQuiz) challenges.push(microQuiz);
  if (flashcard) challenges.push(flashcard);
  if (nativeCheck) challenges.push(nativeCheck);
  if (brainTickler) challenges.push(brainTickler);

  // Shuffle to vary order each day
  return shuffleArray(challenges);
}

/**
 * Get a specific challenge by ID
 */
export function getChallengeById(id: string): Challenge | null {
  const allChallenges = [
    ...Object.values(errorSpottingByLevel).flat(),
    ...Object.values(swipeFixByLevel).flat(),
    ...Object.values(microQuizByLevel).flat(),
    ...Object.values(flashcardByLevel).flat(),
    ...Object.values(nativeCheckByLevel).flat(),
    ...Object.values(brainTicklerByLevel).flat(),
  ];

  return allChallenges.find((c) => c.id === id) || null;
}

// Utility functions
function getRandomItem<T>(array: T[]): T | null {
  if (array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
