/**
 * Research — Research and web search utilities
 *
 * Provides web search capabilities via Brave Search API.
 * Used by AI agents for external research when built-in tools aren't sufficient.
 *
 * @module lib/research
 */
import { output } from './core.js';
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
export async function cmdWebsearch(query, options, raw) {
    const apiKey = process.env['BRAVE_API_KEY'];
    if (!apiKey) {
        // No key = silent skip, agent falls back to built-in WebSearch
        output({ available: false, reason: 'BRAVE_API_KEY not set' }, raw, '');
        return;
    }
    if (!query) {
        output({ available: false, error: 'Busca obrigatória' }, raw, '');
        return;
    }
    const params = new URLSearchParams({
        q: query,
        count: String(options.limit || 10),
        country: 'us',
        search_lang: 'en',
        text_decorations: 'false',
    });
    if (options.freshness) {
        params.set('freshness', options.freshness);
    }
    try {
        const response = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
            headers: {
                Accept: 'application/json',
                'X-Subscription-Token': apiKey,
            },
        });
        if (!response.ok) {
            output({ available: false, error: `Erro da API: ${response.status}` }, raw, '');
            return;
        }
        const data = (await response.json());
        const results = (data.web?.results || []).map((r) => ({
            title: r.title,
            url: r.url,
            description: r.description,
            age: r.age || null,
        }));
        output({
            available: true,
            query,
            count: results.length,
            results,
        }, raw, results.map((r) => `${r.title}\n${r.url}\n${r.description}`).join('\n\n'));
    }
    catch (err) {
        output({ available: false, error: err.message }, raw, '');
    }
}
//# sourceMappingURL=research.js.map