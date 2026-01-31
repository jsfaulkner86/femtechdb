/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Approved source domains for validation
const APPROVED_SOURCE_DOMAINS = [
  // Company official sources
  'linkedin.com',
  'crunchbase.com',
  'wellfound.com',
  'angellist.co',
  // Funding/VC sources
  'pitchbook.com',
  'cbinsights.com',
  // Healthcare/FemTech specific
  'femtechinsider.com',
  'mobihealthnews.com',
  'fiercehealthcare.com',
  'healthcaredive.com',
  'statnews.com',
  'medcitynews.com',
  // Tech news
  'techcrunch.com',
  'venturebeat.com',
  'forbes.com',
  'bloomberg.com',
  // Regulatory
  'fda.gov',
  'sec.gov',
];

interface EnrichmentResult {
  companyId: string;
  companyName: string;
  sourceUrl: string | null;
  sourceType: string | null;
  error: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('========================================');
  console.log('FemTechDB Source Enricher - START');
  console.log('========================================');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

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

    // Parse and validate request body
    let batchSize = 20;
    try {
      const body = await req.json();
      if (body.batchSize !== undefined) {
        if (typeof body.batchSize !== 'number' || !Number.isInteger(body.batchSize)) {
          return new Response(
            JSON.stringify({ error: 'Invalid batchSize - must be an integer' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        batchSize = Math.max(1, Math.min(body.batchSize, 50));
      }
    } catch {
      // No body or invalid JSON - use defaults
    }

    // Get companies without sources
    const { data: companies, error: fetchError } = await supabase
      .from('companies')
      .select('id, name, website_url, category, headquarters')
      .or('source_url.is.null,source_url.eq.')
      .limit(batchSize);

    if (fetchError) {
      throw new Error(`Failed to fetch companies: ${fetchError.message}`);
    }

    console.log(`Found ${companies?.length || 0} companies without sources`);

    if (!companies || companies.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          summary: { processed: 0, updated: 0, message: 'All companies have sources' }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build prompt for AI to find sources
    const companyList = companies.map(c => 
      `- ${c.name} (${c.category}, ${c.headquarters || 'Unknown location'})${c.website_url ? `, website: ${c.website_url}` : ''}`
    ).join('\n');

    const prompt = `You are a research assistant finding official source citations for FemTech companies.

For each company below, find ONE authoritative source URL that verifies the company's existence and focus on women's health.

## APPROVED SOURCE DOMAINS (prioritize these):
${APPROVED_SOURCE_DOMAINS.map(d => `- ${d}`).join('\n')}

## COMPANIES TO RESEARCH:
${companyList}

## REQUIREMENTS:
1. Source must be from an approved domain OR the company's official website "About" or "Press" page
2. Source must contain verifiable information about the company
3. Prefer: Crunchbase > LinkedIn > TechCrunch > Company press page
4. If company has a website, their official About page is acceptable: [website]/about

## RESPONSE FORMAT (JSON only):
{
  "sources": [
    {
      "company_name": "Company Name",
      "source_url": "https://verified-source.com/company-page",
      "source_type": "crunchbase|linkedin|press|official_about|news|other"
    }
  ]
}

IMPORTANT:
- Only return real, working URLs you are confident exist
- If you cannot find a reliable source, set source_url to null
- Do NOT make up or guess URLs`;

    // Call AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse response
    let sourcesData: { sources: Array<{ company_name: string; source_url: string | null; source_type: string }> };
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonString = jsonMatch[1] || content;
      sourcesData = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('PARSE_ERROR');
    }

    const results: EnrichmentResult[] = [];
    let updated = 0;

    // Update companies with sources
    for (const source of sourcesData.sources || []) {
      const company = companies.find(c => 
        c.name.toLowerCase() === source.company_name.toLowerCase()
      );

      if (!company) {
        results.push({
          companyId: 'unknown',
          companyName: source.company_name,
          sourceUrl: null,
          sourceType: null,
          error: 'Company not found in batch'
        });
        continue;
      }

      if (!source.source_url) {
        results.push({
          companyId: company.id,
          companyName: company.name,
          sourceUrl: null,
          sourceType: null,
          error: 'No source found by AI'
        });
        continue;
      }

      // Update company with source
      const { error: updateError } = await supabase
        .from('companies')
        .update({ source_url: source.source_url })
        .eq('id', company.id);

      if (updateError) {
        results.push({
          companyId: company.id,
          companyName: company.name,
          sourceUrl: null,
          sourceType: null,
          error: updateError.message
        });
      } else {
        updated++;
        results.push({
          companyId: company.id,
          companyName: company.name,
          sourceUrl: source.source_url,
          sourceType: source.source_type,
          error: null
        });
      }
    }

    console.log('========================================');
    console.log('FemTechDB Source Enricher - COMPLETE');
    console.log(`Updated: ${updated}/${companies.length}`);
    console.log('========================================');

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          processed: companies.length,
          updated,
          remaining: companies.length - updated,
          results
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Source enrichment error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
