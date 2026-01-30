/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface LogoResult {
  companyId: string;
  companyName: string;
  logoUrl: string | null;
  source: string | null;
  error: string | null;
}

// Extract domain from URL
function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

// Try multiple logo extraction methods
async function fetchLogo(websiteUrl: string): Promise<{ logoUrl: string | null; source: string }> {
  const domain = extractDomain(websiteUrl);
  if (!domain) {
    return { logoUrl: null, source: 'invalid_url' };
  }

  // Method 1: Google Favicon API (most reliable, always returns something)
  const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  
  // Method 2: Clearbit Logo API (higher quality, but may not have all)
  const clearbitLogoUrl = `https://logo.clearbit.com/${domain}`;
  
  // Method 3: Direct favicon
  const directFaviconUrl = `https://${domain}/favicon.ico`;

  // Try Clearbit first (best quality)
  try {
    const clearbitResponse = await fetch(clearbitLogoUrl, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    if (clearbitResponse.ok) {
      const contentType = clearbitResponse.headers.get('content-type');
      if (contentType?.startsWith('image/')) {
        return { logoUrl: clearbitLogoUrl, source: 'clearbit' };
      }
    }
  } catch {
    // Clearbit failed, try next method
  }

  // Try direct favicon
  try {
    const faviconResponse = await fetch(directFaviconUrl, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    if (faviconResponse.ok) {
      const contentType = faviconResponse.headers.get('content-type');
      if (contentType?.includes('image') || contentType?.includes('icon')) {
        return { logoUrl: directFaviconUrl, source: 'direct_favicon' };
      }
    }
  } catch {
    // Direct favicon failed, use Google fallback
  }

  // Fallback to Google favicon (always works)
  return { logoUrl: googleFaviconUrl, source: 'google_favicon' };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('========================================');
  console.log('FemTechDB Logo Fetcher - START');
  console.log('========================================');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Auth check - same pattern as update-companies
    const authHeader = req.headers.get('Authorization');
    const cronSecretKey = Deno.env.get('CRON_SECRET_KEY');
    const cronHeader = req.headers.get('X-Cron-Secret');
    const token = authHeader?.replace('Bearer ', '');

    // Use environment variable instead of hardcoded JWT
    const anonKeyJwt = supabaseAnonKey;
    
    const isCronCall = token === anonKeyJwt || 
                       authHeader === `Bearer ${anonKeyJwt}` ||
                       (cronSecretKey && cronHeader === cronSecretKey);
    
    console.log('Auth check - token present:', !!token, 'isCronCall:', isCronCall);

    if (!isCronCall) {
      // Verify admin role for non-cron calls
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });

      const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token!);
      
      if (claimsError || !claimsData?.claims) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized - invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const userId = claimsData.claims.sub;
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

      const { data: roleData } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        return new Response(
          JSON.stringify({ error: 'Forbidden - admin role required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request for batch size
    let batchSize = 50;
    try {
      const body = await req.json();
      if (body.batchSize && typeof body.batchSize === 'number') {
        batchSize = Math.min(body.batchSize, 200);
      }
    } catch {
      // No body or invalid JSON
    }

    // Get companies without logos that have website URLs
    const { data: companies, error: fetchError } = await supabase
      .from('companies')
      .select('id, name, website_url')
      .not('website_url', 'is', null)
      .or('logo_url.is.null,logo_url.eq.')
      .limit(batchSize);

    if (fetchError) {
      throw new Error(`Failed to fetch companies: ${fetchError.message}`);
    }

    console.log(`Found ${companies?.length || 0} companies without logos`);

    const results: LogoResult[] = [];
    let updated = 0;
    let failed = 0;

    // Process companies in parallel (batches of 10)
    const processBatch = async (batch: typeof companies) => {
      const promises = batch!.map(async (company) => {
        try {
          if (!company.website_url) {
            return {
              companyId: company.id,
              companyName: company.name,
              logoUrl: null,
              source: null,
              error: 'No website URL'
            };
          }

          const { logoUrl, source } = await fetchLogo(company.website_url);

          if (logoUrl) {
            const { error: updateError } = await supabase
              .from('companies')
              .update({ logo_url: logoUrl })
              .eq('id', company.id);

            if (updateError) {
              return {
                companyId: company.id,
                companyName: company.name,
                logoUrl: null,
                source: null,
                error: updateError.message
              };
            }

            return {
              companyId: company.id,
              companyName: company.name,
              logoUrl,
              source,
              error: null
            };
          }

          return {
            companyId: company.id,
            companyName: company.name,
            logoUrl: null,
            source: null,
            error: 'Could not extract logo'
          };
        } catch (error) {
          return {
            companyId: company.id,
            companyName: company.name,
            logoUrl: null,
            source: null,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

      return Promise.all(promises);
    };

    // Process in batches of 10
    for (let i = 0; i < (companies?.length || 0); i += 10) {
      const batch = companies?.slice(i, i + 10);
      if (batch) {
        const batchResults = await processBatch(batch);
        results.push(...batchResults);
        
        for (const result of batchResults) {
          if (result.logoUrl) {
            updated++;
          } else {
            failed++;
          }
        }
      }
    }

    console.log('========================================');
    console.log('FemTechDB Logo Fetcher - COMPLETE');
    console.log(`Updated: ${updated}, Failed: ${failed}`);
    console.log('========================================');

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          processed: companies?.length || 0,
          updated,
          failed,
          results: results.slice(0, 20) // Return first 20 for debugging
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Logo fetch error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
