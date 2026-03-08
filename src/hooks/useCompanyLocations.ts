import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CompanyLocation {
  id: string;
  name: string;
  category: string;
  country: string | null;
  continent: string | null;
  state: string | null;
  headquarters: string | null;
  website_url: string | null;
  mission: string | null;
}

export interface LocationGroup {
  country: string;
  continent: string;
  companies: CompanyLocation[];
  coordinates: [number, number];
}

// Approximate country center coordinates for mapping
const countryCoordinates: Record<string, [number, number]> = {
  'United States': [-98.5795, 39.8283],
  'United Kingdom': [-3.4360, 55.3781],
  'Germany': [10.4515, 51.1657],
  'France': [2.2137, 46.2276],
  'Canada': [-106.3468, 56.1304],
  'Australia': [133.7751, -25.2744],
  'India': [78.9629, 20.5937],
  'Israel': [34.8516, 31.0461],
  'Netherlands': [5.2913, 52.1326],
  'Switzerland': [8.2275, 46.8182],
  'Sweden': [18.6435, 60.1282],
  'Spain': [-3.7492, 40.4637],
  'Singapore': [103.8198, 1.3521],
  'Japan': [138.2529, 36.2048],
  'China': [104.1954, 35.8617],
  'Brazil': [-51.9253, -14.2350],
  'Mexico': [-102.5528, 23.6345],
  'South Korea': [127.7669, 35.9078],
  'South Africa': [22.9375, -30.5595],
  'Nigeria': [8.6753, 9.0820],
  'Kenya': [37.9062, -0.0236],
  'Egypt': [30.8025, 26.8206],
  'United Arab Emirates': [53.8478, 23.4241],
  'New Zealand': [174.8860, -40.9006],
  'Argentina': [-63.6167, -38.4161],
  'Chile': [-71.5430, -35.6751],
  'Colombia': [-74.2973, 4.5709],
  'Morocco': [-7.0926, 31.7917],
};

// US State coordinates for more granular mapping
const usStateCoordinates: Record<string, [number, number]> = {
  'California': [-119.4179, 36.7783],
  'New York': [-74.2179, 43.2994],
  'Texas': [-99.9018, 31.9686],
  'Florida': [-81.5158, 27.6648],
  'Massachusetts': [-71.3824, 42.4072],
  'Washington': [-120.7401, 47.7511],
  'Colorado': [-105.7821, 39.5501],
  'Illinois': [-89.3985, 40.6331],
  'Pennsylvania': [-77.1945, 41.2033],
  'Georgia': [-82.9071, 32.1656],
  'North Carolina': [-79.0193, 35.7596],
  'Virginia': [-78.6569, 37.4316],
  'New Jersey': [-74.4057, 40.0583],
  'Arizona': [-111.0937, 34.0489],
  'Oregon': [-120.5542, 43.8041],
  'Ohio': [-82.9071, 40.4173],
  'Michigan': [-85.6024, 44.3148],
  'Maryland': [-76.6413, 39.0458],
  'Minnesota': [-94.6859, 46.7296],
  'Connecticut': [-72.7554, 41.6032],
  'Utah': [-111.0937, 39.3210],
  'Tennessee': [-86.5804, 35.5175],
  'Wisconsin': [-89.6165, 43.7844],
  'Missouri': [-91.8318, 37.9643],
  'Indiana': [-86.1349, 40.2672],
  'Nevada': [-116.4194, 38.8026],
  'District of Columbia': [-77.0369, 38.9072],
};

function getCoordinates(company: CompanyLocation): [number, number] | null {
  // For US companies, try to get state-level coordinates
  if (company.country === 'United States' && company.state) {
    const stateCoords = usStateCoordinates[company.state];
    if (stateCoords) {
      // Add small random offset to prevent exact overlaps
      return [
        stateCoords[0] + (Math.random() - 0.5) * 2,
        stateCoords[1] + (Math.random() - 0.5) * 1.5
      ];
    }
  }
  
  // Fall back to country coordinates
  if (company.country) {
    const countryCoords = countryCoordinates[company.country];
    if (countryCoords) {
      // Add small random offset to prevent exact overlaps
      return [
        countryCoords[0] + (Math.random() - 0.5) * 3,
        countryCoords[1] + (Math.random() - 0.5) * 2
      ];
    }
  }
  
  return null;
}

export function useCompanyLocations() {
  return useQuery({
    queryKey: ['company-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, category, country, continent, state, headquarters, website_url, mission')
        .not('country', 'is', null)
        .order('name')
        .limit(5000);

      if (error) throw error;

      const companies = data as CompanyLocation[];
      
      // Group by country for region counts
      const countryGroups: Record<string, LocationGroup> = {};
      
      companies.forEach(company => {
        if (!company.country) return;
        
        if (!countryGroups[company.country]) {
          const coords = countryCoordinates[company.country];
          countryGroups[company.country] = {
            country: company.country,
            continent: company.continent || 'Unknown',
            companies: [],
            coordinates: coords || [0, 0],
          };
        }
        countryGroups[company.country].companies.push(company);
      });

      // Create individual markers with coordinates
      const markers = companies
        .map(company => {
          const coords = getCoordinates(company);
          if (!coords) return null;
          return {
            ...company,
            coordinates: coords,
          };
        })
        .filter(Boolean) as (CompanyLocation & { coordinates: [number, number] })[];

      return {
        markers,
        countryGroups: Object.values(countryGroups),
        totalCompanies: companies.length,
        totalCountries: Object.keys(countryGroups).length,
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function useRegionCounts() {
  return useQuery({
    queryKey: ['region-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('continent, country')
        .not('continent', 'is', null)
        .limit(5000);

      if (error) throw error;

      const continentCounts: Record<string, number> = {};
      const countryCounts: Record<string, number> = {};

      data.forEach(company => {
        if (company.continent) {
          continentCounts[company.continent] = (continentCounts[company.continent] || 0) + 1;
        }
        if (company.country) {
          countryCounts[company.country] = (countryCounts[company.country] || 0) + 1;
        }
      });

      return { continentCounts, countryCounts };
    },
    staleTime: 1000 * 60 * 5,
  });
}
