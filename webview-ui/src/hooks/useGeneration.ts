import { useCallback, useEffect, useState } from 'react';
import type {
  HostMessage,
  MessageService,
  ProgressUpdate,
  GenerationPayload,
} from '../services/messageService';

export type GenerationStatus = 'idle' | 'running' | 'success' | 'error';

export interface GenerationResult {
  success: boolean;
  projectPath: string;
  filesGenerated: number;
  extractedSize: string;
  nextSteps: string[];
}

export interface GenerationError {
  message: string;
  code?: string;
  step?: number;
  details?: string;
}

export interface GenerationHookResult {
  status: GenerationStatus;
  progress: ProgressUpdate | null;
  result: GenerationResult | null;
  error: GenerationError | null;
  generate: (payload: GenerationPayload) => void;
  /** Close the result/error overlay and return to editing. */
  dismiss: () => void;
}

/**
 * Drives project generation: issues `GENERATE_PROJECT`, tracks progress
 * messages, and surfaces the terminal success/error state for the UI.
 */
export function useGeneration(messageService: MessageService): GenerationHookResult {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<GenerationError | null>(null);

  useEffect(() => {
    return messageService.onMessage((msg: HostMessage) => {
      switch (msg.type) {
        case 'generationStarted':
          setStatus('running');
          break;
        case 'GENERATION_PROGRESS':
          setStatus('running');
          setProgress(msg.payload);
          break;
        case 'generationComplete':
          setStatus('success');
          setProgress(null);
          setResult(msg.payload.result);
          break;
        case 'generationError':
          setStatus('error');
          setProgress(null);
          setError({
            message: msg.payload.message,
            code: msg.payload.code,
            step: msg.payload.step,
            details: msg.payload.details,
          });
          break;
        case 'error':
          setStatus('error');
          setProgress(null);
          setError({ message: msg.payload.message });
          break;
        default:
          break;
      }
    });
  }, [messageService]);

  const generate = useCallback(
    (payload: GenerationPayload) => {
      setStatus('running');
      setProgress(null);
      setResult(null);
      setError(null);
      messageService.post('GENERATE_PROJECT', payload);
    },
    [messageService]
  );

  const dismiss = useCallback(() => {
    setStatus('idle');
    setProgress(null);
    setResult(null);
    setError(null);
  }, []);

  return { status, progress, result, error, generate, dismiss };
}