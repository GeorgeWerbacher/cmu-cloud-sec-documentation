import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Cache duration in milliseconds (24 hours by default)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

/**
 * Create a hash from a query and context for cache lookups
 */
function createCacheKey(query: string, contextDigest: string): string {
  return crypto.createHash('md5').update(`${query}:${contextDigest}`).digest('hex');
}

/**
 * Create a digest of the context for more efficient caching
 * We don't use the full context text to avoid excessive storage
 */
function createContextDigest(context: string): string {
  return crypto.createHash('md5').update(context).digest('hex');
}

/**
 * Check if a response exists in the cache
 */
export async function getCachedResponse(query: string, context: string) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Cache lookup failed: Missing Supabase credentials');
    return null;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Create deterministic keys for the cache
  const contextDigest = createContextDigest(context);
  const cacheKey = createCacheKey(query, contextDigest);
  
  try {
    // Query the cache table
    const { data, error } = await supabase
      .from('response_cache')
      .select('response, created_at')
      .eq('cache_key', cacheKey)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') { // Not found error is expected sometimes
        console.error('Cache lookup error:', error);
      }
      return null;
    }
    
    // Check if the cached entry is still valid
    if (data) {
      const createdAt = new Date(data.created_at).getTime();
      const now = new Date().getTime();
      
      if (now - createdAt < CACHE_DURATION) {
        console.log('🎯 Cache hit for query:', query);
        return data.response;
      } else {
        console.log('⏰ Cache expired for query:', query);
      }
    }
  } catch (error) {
    console.error('Error during cache lookup:', error);
  }
  
  return null;
}

/**
 * Store a response in the cache
 */
export async function cacheResponse(query: string, context: string, response: string) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Cache storage failed: Missing Supabase credentials');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Create deterministic keys for the cache
  const contextDigest = createContextDigest(context);
  const cacheKey = createCacheKey(query, contextDigest);
  
  try {
    // Store the response in the cache
    const { error } = await supabase
      .from('response_cache')
      .upsert({
        cache_key: cacheKey,
        query: query,
        context_digest: contextDigest,
        response: response,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Cache storage error:', error);
    } else {
      console.log('💾 Cached response for query:', query);
    }
  } catch (error) {
    console.error('Error during cache storage:', error);
  }
} 