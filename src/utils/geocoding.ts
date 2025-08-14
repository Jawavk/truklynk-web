// hooks/useReverseGeocoding.ts
import { useState, useEffect, useCallback } from 'react';

interface LocationData {
  address: string;
  loading: boolean;
  error: string | null;
}

interface LocationCache {
  [key: string]: {
    address: string;
    timestamp: number;
  };
}

interface NominatimAddress {
  house_number?: string;
  road?: string;
  suburb?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  village?: string;
  state_district?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

interface NominatimResponse {
  display_name?: string;
  address?: NominatimAddress;
}

// Cache to store geocoding results (expires after 1 hour)
const locationCache: LocationCache = {};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export const useReverseGeocoding = (lat: string | null, lng: string | null) => {
  const [locationData, setLocationData] = useState<LocationData>({
    address: '',
    loading: false,
    error: null,
  });

  const reverseGeocode = useCallback(async (latitude: string, longitude: string) => {
    if (!latitude || !longitude || latitude === 'null' || longitude === 'null') {
      setLocationData({
        address: 'Location not available',
        loading: false,
        error: null,
      });
      return;
    }

    const cacheKey = `${latitude}-${longitude}`;
    const now = Date.now();
    
    // Check if we have cached data
    if (locationCache[cacheKey] && (now - locationCache[cacheKey].timestamp) < CACHE_DURATION) {
      setLocationData({
        address: locationCache[cacheKey].address,
        loading: false,
        error: null,
      });
      return;
    }

    setLocationData(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Using OpenStreetMap Nominatim service (free alternative to Google Maps)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'VehicleTracker/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data: NominatimResponse = await response.json();
      
      let formattedAddress = 'Unknown location';
      
      if (data && data.address) {
        const addr = data.address;
        const parts: string[] = [];
        
        // Build address from most specific to less specific
        if (addr.house_number) parts.push(addr.house_number);
        if (addr.road) parts.push(addr.road);
        
        const areaName = addr.suburb || addr.neighbourhood;
        if (areaName) parts.push(areaName);
        
        const cityName = addr.city || addr.town || addr.village;
        if (cityName) parts.push(cityName);
        
        const stateName = addr.state_district || addr.state;
        if (stateName) parts.push(stateName);
        
        formattedAddress = parts.slice(0, 3).join(', ') || data.display_name?.split(',').slice(0, 3).join(', ') || 'Unknown location';
      }

      // Cache the result
      locationCache[cacheKey] = {
        address: formattedAddress,
        timestamp: now,
      };

      setLocationData({
        address: formattedAddress,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setLocationData({
        address: 'Location unavailable',
        loading: false,
        error: 'Failed to get location',
      });
    }
  }, []);

  useEffect(() => {
    if (lat && lng) {
      // Add a small delay to prevent too many simultaneous requests
      const timer = setTimeout(() => {
        reverseGeocode(lat, lng);
      }, Math.random() * 1000); // Random delay between 0-1000ms

      return () => clearTimeout(timer);
    } else {
      setLocationData({
        address: 'Location not available',
        loading: false,
        error: null,
      });
    }
  }, [lat, lng, reverseGeocode]);

  return locationData;
};