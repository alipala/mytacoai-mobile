/**
 * useCharacterState Hook
 *
 * Manages Learning Companion character state and reactions
 * Handles state transitions based on user actions
 */

import { useState, useEffect, useCallback } from 'react';

export type CharacterState =
  | 'idle'
  | 'anticipation'
  | 'celebrate'
  | 'disappointed'
  | 'nervous'
  | 'legendary';

export interface CharacterStateConfig {
  onStateChange?: (state: CharacterState) => void;
  autoReturnToIdle?: boolean;
  idleDelay?: number; // ms before returning to idle
}

export function useCharacterState(config: CharacterStateConfig = {}) {
  const {
    onStateChange,
    autoReturnToIdle = true,
    idleDelay = 2000,
  } = config;

  const [characterState, setCharacterState] = useState<CharacterState>('idle');
  const [previousState, setPreviousState] = useState<CharacterState>('idle');

  /**
   * Update character state
   */
  const updateState = useCallback(
    (newState: CharacterState) => {
      setPreviousState(characterState);
      setCharacterState(newState);

      // Notify callback
      if (onStateChange) {
        onStateChange(newState);
      }

      // Auto-return to idle after animations complete (but not for disappointed - stays until Continue pressed)
      if (autoReturnToIdle && newState !== 'idle' && newState !== 'nervous' && newState !== 'disappointed') {
        setTimeout(() => {
          setCharacterState('idle');
        }, idleDelay);
      }
    },
    [characterState, onStateChange, autoReturnToIdle, idleDelay]
  );

  /**
   * Character reactions to user actions
   */
  const reactToAnswer = useCallback(
    (isCorrect: boolean) => {
      if (isCorrect) {
        updateState('celebrate');
      } else {
        updateState('disappointed');
      }
    },
    [updateState]
  );

  const reactToSelection = useCallback(() => {
    updateState('anticipation');
  }, [updateState]);

  const reactToTimeout = useCallback(() => {
    updateState('disappointed');
  }, [updateState]);

  const reactToComboMilestone = useCallback((combo: number) => {
    if (combo >= 10) {
      updateState('legendary');
    } else if (combo >= 5) {
      updateState('celebrate');
    }
  }, [updateState]);

  const showNervousness = useCallback(() => {
    updateState('nervous');
  }, [updateState]);

  const returnToIdle = useCallback(() => {
    updateState('idle');
  }, [updateState]);

  return {
    // Current state
    characterState,
    previousState,

    // State setters
    updateState,

    // Reaction helpers
    reactToAnswer,
    reactToSelection,
    reactToTimeout,
    reactToComboMilestone,
    showNervousness,
    returnToIdle,

    // State checks
    isIdle: characterState === 'idle',
    isCelebrating: characterState === 'celebrate' || characterState === 'legendary',
    isDisappointed: characterState === 'disappointed',
    isNervous: characterState === 'nervous',
  };
}
