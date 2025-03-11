import { createClient } from '@supabase/supabase-js';

// Default daily token limit
const DEFAULT_DAILY_TOKEN_LIMIT = 100000;

// Define type for API usage record
interface ApiUsageRecord {
  id: number;
  user_id: string;
  date: string;
  tokens_prompt: number;
  tokens_completion: number;
  tokens_total: number;
  request_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Track API usage for a user
 * @param userId User identifier (can be anonymous or authenticated)
 * @param promptTokens Number of prompt tokens used
 * @param completionTokens Number of completion tokens used
 */
export async function trackUsage(
  userId: string = 'anonymous', 
  promptTokens: number = 0, 
  completionTokens: number = 0
) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Usage tracking failed: Missing Supabase credentials');
    return;
  }
  
  const totalTokens = promptTokens + completionTokens;
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if we already have a record for today
    const { data: existingData, error: lookupError } = await supabase
      .from('api_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();
    
    if (lookupError && lookupError.code !== 'PGRST116') { // Not found is expected
      console.error('Usage tracking lookup error:', lookupError);
      return;
    }
    
    if (existingData) {
      // Update existing record with type assertion
      const record = existingData as ApiUsageRecord;
      const { error } = await supabase
        .from('api_usage')
        .update({
          tokens_prompt: record.tokens_prompt + promptTokens,
          tokens_completion: record.tokens_completion + completionTokens,
          tokens_total: record.tokens_total + totalTokens,
          request_count: record.request_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', record.id);
      
      if (error) {
        console.error('Usage tracking update error:', error);
      }
    } else {
      // Create new record
      const { error } = await supabase
        .from('api_usage')
        .insert({
          user_id: userId,
          date,
          tokens_prompt: promptTokens,
          tokens_completion: completionTokens,
          tokens_total: totalTokens,
          request_count: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Usage tracking insert error:', error);
      }
    }
  } catch (error) {
    console.error('Error during usage tracking:', error);
  }
}

/**
 * Check if a user has exceeded their rate limit
 * @param userId User identifier (can be anonymous or authenticated)
 * @returns Object with information about rate limit status
 */
export async function checkRateLimit(userId: string = 'anonymous') {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  // Default values if we can't check
  const defaultResponse = {
    allowed: true,
    remaining: DEFAULT_DAILY_TOKEN_LIMIT,
    usage: 0,
    limit: DEFAULT_DAILY_TOKEN_LIMIT
  };
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Rate limit check failed: Missing Supabase credentials');
    return defaultResponse;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Get today's usage
    const { data, error } = await supabase
      .from('api_usage')
      .select('tokens_total')
      .eq('user_id', userId)
      .eq('date', date)
      .single();
    
    if (error && error.code !== 'PGRST116') { // Not found is expected for new users
      console.error('Rate limit check error:', error);
      return defaultResponse;
    }
    
    // Get the limit from environment variable or use default
    const dailyLimit = parseInt(process.env.DAILY_TOKEN_LIMIT || DEFAULT_DAILY_TOKEN_LIMIT.toString());
    
    // Calculate remaining tokens
    const usedTokens = data?.tokens_total || 0;
    const remainingTokens = Math.max(0, dailyLimit - usedTokens);
    
    return {
      allowed: usedTokens < dailyLimit,
      remaining: remainingTokens,
      usage: usedTokens,
      limit: dailyLimit
    };
  } catch (error) {
    console.error('Error during rate limit check:', error);
    return defaultResponse;
  }
}

/**
 * Estimate token count for input text
 * This is a simple approximation - Claude's actual tokenization may differ
 * @param text Input text to estimate
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  
  // Simple approximation: 1 token ≈ 4 characters for English text
  // This is a rough estimate and will vary by language and content
  return Math.ceil(text.length / 4);
} 