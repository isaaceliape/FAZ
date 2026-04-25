/**
 * Research — Research and web search utilities
 *
 * Provides web search capabilities via Brave Search API.
 * Used by AI agents for external research when built-in tools aren't sufficient.
 *
 * @module lib/research
 */
interface WebsearchOptions {
    limit?: number;
    freshness?: string;
}
/**
 * Perform a web search via Brave Search API
 *
 * Requires BRAVE_API_KEY environment variable.
 * Falls back silently if key not set, allowing agents to use built-in WebSearch.
 *
 * @param query - Search query
 * @param options - Search options (limit, freshness)
 * @param raw - Whether to output raw JSON
 */
export declare function cmdWebsearch(query: string, options: WebsearchOptions, raw: boolean): Promise<void>;
export {};
