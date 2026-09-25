import { useEffect, useState, useCallback } from 'react';
import type {
  InitializrMetadata,
  MetadataLoadedMsg,
  MetadataErrorMsg,
  HostMessage,
  MessageService,
} from '../services/messageService';

export interface MetadataState {
  metadata: InitializrMetadata | null;
  loading: boolean;
  error: string | null;
  refreshedAt: Date | null;
}

export interface MetadataHookResult extends MetadataState {
  refresh: () => void;
}

/**
 * Sends `initializationRequest` on mount, listens for `metadataLoaded` and
 * `METADATA_ERROR` responses, and exposes a `refresh()` to re-trigger.
 */
export function useMetadata(messageService: MessageService): MetadataHookResult {
  const [metadata, setMetadata] = useState<InitializrMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  useEffect(() => {
    const unsubscribe = messageService.onMessage((msg: HostMessage) => {
      if (msg.type === 'metadataLoaded') {
        // The host sends metadata under `payload`, but some builds sent it
        // under `metadata`. Support both for resilience.
        const loaded = msg as MetadataLoadedMsg & { metadata?: InitializrMetadata };
        const data = loaded.payload ?? loaded.metadata;
        if (!data) return;

        setMetadata(data);
        setError(null);
        setLoading(false);
        setRefreshedAt(new Date());
      } else if (msg.type === 'METADATA_ERROR') {
        const errMsg = msg as MetadataErrorMsg;
        setError(errMsg.payload.message);
        setLoading(false);
      }
    });

    // Request metadata on mount
    messageService.post('initializationRequest');

    return () => {
      unsubscribe();
    };
  }, [messageService]);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    messageService.post('initializationRequest');
  }, [messageService]);

  return { metadata, loading, error, refreshedAt, refresh };
}