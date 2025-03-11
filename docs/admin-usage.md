# Admin Usage Dashboard

The CMU Cloud Security Documentation site includes an admin dashboard for tracking AI API usage, costs, and performance. This guide explains how to use these features and interpret the data.

## Accessing the Admin Dashboard

The admin dashboard is available at `/admin/usage` in your deployed application. It's hidden from the main navigation but accessible to anyone with the URL.

If you want to restrict access to this page, you can implement authentication using NextAuth.js or Supabase Authentication.

## Available Metrics

The admin dashboard displays several key metrics:

### 1. Total API Usage

- **Total Tokens**: The cumulative number of tokens consumed by AI API calls
- **Total Requests**: The number of requests made to the AI API
- **Estimated Cost**: An approximation of the cost based on current pricing models

### 2. Usage Trends

- **Daily Usage**: Token consumption broken down by day
- **Request Volume**: Number of API calls over time
- **Average Response Time**: How quickly the AI model responds

### 3. Cost Optimization

- **Cache Hit Rate**: Percentage of queries answered from cache
- **Token Efficiency**: Tokens used per request
- **Cost per Query**: Average cost of each user query

## Database Tables

The admin dashboard pulls data from these tables:

### api_usage Table

This table tracks every API call with the following information:

- `id`: Unique identifier
- `request_id`: ID of the specific request
- `user_id`: User identifier (if authentication is implemented)
- `model`: The AI model used (Claude/GPT)
- `prompt_tokens`: Number of tokens in the prompt
- `completion_tokens`: Number of tokens in the response
- `total_tokens`: Total tokens used
- `estimated_cost_usd`: Estimated cost in USD
- `date`: Date of the request
- `created_at`: Timestamp of when the record was created

### response_cache Table

This table stores cached responses to reduce duplicate API calls:

- `id`: Unique identifier
- `cache_key`: Hashed key for lookup
- `query`: The original user query
- `context_digest`: Hash of the context provided to the AI
- `response`: The cached AI response
- `created_at`: When the cache entry was created

## Cost Management Features

The system includes several features to optimize costs:

### 1. Response Caching

Identical or similar queries use cached responses instead of making new API calls. This is implemented in the API endpoint with a lookup based on query similarity and context.

### 2. Token Usage Monitoring

The dashboard helps you monitor token usage patterns to identify:
- Unusually large requests
- Opportunities for prompt optimization
- Cost trends over time

### 3. Context Optimization

The system dynamically adjusts the amount of context sent to the AI model based on:
- Query complexity
- Available similar documents
- Token budget considerations

## Database Functions

Several SQL functions support the admin dashboard:

### get_usage_stats()

This function calculates usage statistics for a specified time period:

```sql
SELECT * FROM get_usage_stats(
  start_date => '2023-01-01'::timestamp,
  end_date => 'now'::timestamp
);
```

Returns:
- `total_tokens`: Sum of all tokens used
- `total_requests`: Count of API requests
- `avg_tokens_per_request`: Average tokens per request
- `estimated_cost_usd`: Total estimated cost
- `cache_hit_rate`: Percentage of requests served from cache

## Extending the Admin Dashboard

You can extend the admin dashboard by:

1. Adding user-specific analytics (requires authentication)
2. Implementing cost alerts when usage exceeds thresholds
3. Creating more detailed reports with charts and visualizations
4. Adding export functionality for data analysis

## Troubleshooting

If the admin dashboard isn't showing data:

1. Verify the SQL tables (`api_usage` and `response_cache`) exist
2. Ensure the SQL function `get_usage_stats()` is properly created
3. Check for database connection issues in the application logs
4. Verify that API calls are properly logging usage data

For more detailed information, consult the database logs in your Supabase dashboard. 