import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface UsageStats {
  date: string;
  total_requests: number;
  total_tokens: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  unique_users: number;
}

export default function UsageStatsPage() {
  const [stats, setStats] = useState<UsageStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    async function fetchStats() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Missing Supabase credentials');
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Get the last 30 days of usage
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data, error } = await supabase.rpc('get_usage_stats', {
          start_date: thirtyDaysAgo.toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0]
        });
        
        if (error) throw error;
        
        setStats(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchStats();
  }, []);
  
  // Calculate total costs (approximate)
  const calculateCost = (promptTokens: number, completionTokens: number) => {
    // Claude pricing (approximate): $0.0025 per 1K prompt tokens, $0.0075 per 1K completion tokens
    const promptCost = (promptTokens / 1000) * 0.0025;
    const completionCost = (completionTokens / 1000) * 0.0075;
    return (promptCost + completionCost).toFixed(2);
  };
  
  const totalPromptTokens = stats.reduce((sum, day) => sum + day.total_prompt_tokens, 0);
  const totalCompletionTokens = stats.reduce((sum, day) => sum + day.total_completion_tokens, 0);
  const totalCost = calculateCost(totalPromptTokens, totalCompletionTokens);
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Claude API Usage Statistics</h1>
      
      {isLoading && <p>Loading statistics...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {!isLoading && !error && (
        <>
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-100 p-4 rounded shadow">
              <h2 className="text-lg font-semibold">Total Tokens</h2>
              <p className="text-2xl mt-2">{stats.reduce((sum, day) => sum + day.total_tokens, 0).toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-4 rounded shadow">
              <h2 className="text-lg font-semibold">Total Requests</h2>
              <p className="text-2xl mt-2">{stats.reduce((sum, day) => sum + day.total_requests, 0).toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded shadow">
              <h2 className="text-lg font-semibold">Estimated Cost (USD)</h2>
              <p className="text-2xl mt-2">${totalCost}</p>
            </div>
          </div>
          
          <h2 className="text-xl font-bold mb-4">Daily Usage</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Requests</th>
                  <th className="px-4 py-2 border">Prompt Tokens</th>
                  <th className="px-4 py-2 border">Completion Tokens</th>
                  <th className="px-4 py-2 border">Total Tokens</th>
                  <th className="px-4 py-2 border">Est. Cost</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((day) => (
                  <tr key={day.date}>
                    <td className="px-4 py-2 border">{day.date}</td>
                    <td className="px-4 py-2 border">{day.total_requests.toLocaleString()}</td>
                    <td className="px-4 py-2 border">{day.total_prompt_tokens.toLocaleString()}</td>
                    <td className="px-4 py-2 border">{day.total_completion_tokens.toLocaleString()}</td>
                    <td className="px-4 py-2 border">{day.total_tokens.toLocaleString()}</td>
                    <td className="px-4 py-2 border">
                      ${calculateCost(day.total_prompt_tokens, day.total_completion_tokens)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
