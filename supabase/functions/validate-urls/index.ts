/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UrlCheckResult {
  id: string;
  name: string;
  url: string;
  status: 'valid' | 'broken' | 'redirect' | 'timeout' | 'error';
  statusCode?: number;
  redirectUrl?: string;
  error?: string;
}

async function checkUrl(url: string): Promise<{ status: string; statusCode?: number; redirectUrl?: string; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FemTechDB/1.0; +https://femtechdb.lovable.app)'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.status >= 300 && response.status < 400) {
      const redirectUrl = response.headers.get('location');
      return { status: 'redirect', statusCode: response.status, redirectUrl: redirectUrl || undefined };
    }
    
    if (response.status >= 200 && response.status < 300) {
      return { status: 'valid', statusCode: response.status };
    }
    
    if (response.status >= 400) {
      return { status: 'broken', statusCode: response.status };
    }
    
    return { status: 'valid', statusCode: response.status };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { status: 'timeout', error: 'Request timed out' };
      }
      return { status: 'error', error: error.message };
    }
    return { status: 'error', error: 'Unknown error' };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('========================================');
  console.log('URL Validator - START');
  console.log('========================================');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request for batch size, offset and type
    let batchSize = 50;
    let offset = 0;
    let urlType: 'website' | 'source' | 'both' = 'website';
    
    try {
      const body = await req.json();
      if (body.batchSize && typeof body.batchSize === 'number') {
        batchSize = Math.min(body.batchSize, 100);
      }
      if (body.offset && typeof body.offset === 'number') {
        offset = body.offset;
      }
      if (body.urlType) {
        urlType = body.urlType;
      }
    } catch {
      // No body or invalid JSON
    }

    console.log(`Checking batch: offset=${offset}, size=${batchSize}`);

    // Get companies with URLs to check
    const { data: companies, error: fetchError } = await supabase
      .from('companies')
      .select('id, name, website_url, source_url')
      .not('website_url', 'is', null)
      .order('name')
      .range(offset, offset + batchSize - 1);

    if (fetchError) {
      throw new Error(`Failed to fetch companies: ${fetchError.message}`);
    }

    console.log(`Checking ${companies?.length || 0} companies`);

    const results: UrlCheckResult[] = [];
    const brokenUrls: UrlCheckResult[] = [];

    // Process in batches of 10
    for (let i = 0; i < (companies?.length || 0); i += 10) {
      const batch = companies?.slice(i, i + 10);
      if (batch) {
        const promises = batch.map(async (company) => {
          const websiteResult = await checkUrl(company.website_url);
          
          const result: UrlCheckResult = {
            id: company.id,
            name: company.name,
            url: company.website_url,
            status: websiteResult.status as UrlCheckResult['status'],
            statusCode: websiteResult.statusCode,
            redirectUrl: websiteResult.redirectUrl,
            error: websiteResult.error
          };
          
          return result;
        });

        const batchResults = await Promise.all(promises);
        results.push(...batchResults);
        
        for (const result of batchResults) {
          if (result.status === 'broken' || result.status === 'error') {
            brokenUrls.push(result);
          }
        }
      }
    }

    const summary = {
      total: results.length,
      valid: results.filter(r => r.status === 'valid').length,
      redirects: results.filter(r => r.status === 'redirect').length,
      broken: results.filter(r => r.status === 'broken').length,
      timeout: results.filter(r => r.status === 'timeout').length,
      errors: results.filter(r => r.status === 'error').length,
    };

    console.log('========================================');
    console.log('URL Validator - COMPLETE');
    console.log(`Summary: ${JSON.stringify(summary)}`);
    console.log('========================================');

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        brokenUrls: brokenUrls.slice(0, 30),
        allResults: results.slice(0, 50)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('URL validation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
