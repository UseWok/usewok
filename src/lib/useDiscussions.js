/**
 * useDiscussions — React Query hook
 * Primary source: Conversation DB (cloud)
 * Fallback: localStorage cache
 * All components should use this instead of raw getDiscussions().
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getDiscussions, saveDiscussions, getConversationMessages } from '@/lib/discussions';

const DISCUSSIONS_KEY = 'discussions';

// Merge DB conversations with local cache, DB wins on conflict
function mergeDiscussions(cloudDiscs, localDiscs) {
  const merged = new Map();
  // Insert local first (lower priority)
  localDiscs.forEach(d => merged.set(d.id, d));
  // Cloud overwrites
  cloudDiscs.forEach(c => {
    merged.set(c.conv_id, {
      id: c.conv_id,
      title: c.title || 'Discussion',
      preview: c.preview || '',
      date: c.updated_date?.slice(0, 10) || '',
      updatedAt: new Date(c.updated_date || Date.now()).getTime(),
      model: c.model,
      agent: c.agent,
      _cloudId: c.id,
    });
  });
  return Array.from(merged.values())
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, 100);
}

async function fetchDiscussions() {
  const me = await base44.auth.me();
  if (!me?.email) return getDiscussions();
  const cloudDiscs = await base44.entities.Conversation.list('-updated_date', 100);
  const local = getDiscussions();
  const merged = mergeDiscussions(cloudDiscs, local);
  // Keep localStorage in sync
  saveDiscussions(merged);
  return merged;
}

export function useDiscussions() {
  return useQuery({
    queryKey: [DISCUSSIONS_KEY],
    queryFn: fetchDiscussions,
    staleTime: 30_000,       // 30s before re-fetch
    gcTime: 5 * 60_000,     // 5min cache
    placeholderData: getDiscussions, // instant local render while loading
  });
}

export function useDeleteDiscussion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (discId) => {
      // Delete from DB
      const results = await base44.entities.Conversation.filter({ conv_id: discId });
      if (results.length > 0) {
        await base44.entities.Conversation.delete(results[0].id);
      }
      // Remove from local
      const local = getDiscussions().filter(d => d.id !== discId);
      saveDiscussions(local);
    },
    onMutate: async (discId) => {
      await qc.cancelQueries({ queryKey: [DISCUSSIONS_KEY] });
      const prev = qc.getQueryData([DISCUSSIONS_KEY]);
      qc.setQueryData([DISCUSSIONS_KEY], old => (old || []).filter(d => d.id !== discId));
      return { prev };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) qc.setQueryData([DISCUSSIONS_KEY], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [DISCUSSIONS_KEY] }),
  });
}

export function useRenameDiscussion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ discId, title }) => {
      const results = await base44.entities.Conversation.filter({ conv_id: discId });
      if (results.length > 0) {
        await base44.entities.Conversation.update(results[0].id, { title });
      }
      const local = getDiscussions().map(d => d.id === discId ? { ...d, title } : d);
      saveDiscussions(local);
    },
    onMutate: async ({ discId, title }) => {
      await qc.cancelQueries({ queryKey: [DISCUSSIONS_KEY] });
      const prev = qc.getQueryData([DISCUSSIONS_KEY]);
      qc.setQueryData([DISCUSSIONS_KEY], old => (old || []).map(d => d.id === discId ? { ...d, title } : d));
      return { prev };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) qc.setQueryData([DISCUSSIONS_KEY], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [DISCUSSIONS_KEY] }),
  });
}

// For analytics: count AI messages across all local conversations
export function countTotalAiResponses(discussions) {
  let count = 0;
  discussions.forEach(d => {
    const msgs = getConversationMessages(d.id);
    count += msgs.filter(m => m.role === 'assistant').length;
  });
  return count;
}