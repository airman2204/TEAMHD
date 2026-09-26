import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Hook para Marca Blanca Dinámica (Multi-Tenancy)
 * Permite cambiar los colores de acento, logotipo y nombre del negocio por cada Coach
 */
export function useTenantTheme(coachSlug = 'team-hd') {
  const [theme, setTheme] = useState({
    brandColor: '#eab308',      // Dorado Team HD Muscle
    secondaryColor: '#f97316',  // Naranja Strength Fit
    logoUrl: null,
    businessName: 'Team HD Muscle'
  });

  useEffect(() => {
    async function fetchBrand() {
      if (!isSupabaseConfigured || !coachSlug) return;

      try {
        const { data, error } = await supabase
          .from('coaches')
          .select('brand_color, secondary_color, logo_url, business_name')
          .eq('slug', coachSlug)
          .single();

        if (data && !error) {
          setTheme({
            brandColor: data.brand_color || '#eab308',
            secondaryColor: data.secondary_color || '#f97316',
            logoUrl: data.logo_url,
            businessName: data.business_name || 'Team HD Muscle'
          });

          // Inyección dinámica de tokens CSS
          document.documentElement.style.setProperty('--color-primary', data.brand_color);
          document.documentElement.style.setProperty('--color-secondary', data.secondary_color);
        }
      } catch (err) {
        console.warn('Error al cargar tema del tenant:', err);
      }
    }

    fetchBrand();
  }, [coachSlug]);

  return theme;
}
