import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, fetch }) => {
  const targetUrl = new URL('https://routes-b726nae6nq-an.a.run.app/');
  
  // Forward all search parameters from the incoming request to the target API
  url.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  try {
    const response = await fetch(targetUrl.toString());
    
    if (!response.ok) {
        throw error(response.status as any, response.statusText);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
        headers: {
            'content-type': 'application/json',
            // Optional: Add CORS headers if this API is accessed from other domains, 
            // but for same-origin (frontend to backend), it's not strictly needed 
            // if standard SvelteKit handling is used.
        }
    });
  } catch (err) {
      console.error('Proxy error:', err);
      throw error(500, 'Internal Server Error');
  }
};
