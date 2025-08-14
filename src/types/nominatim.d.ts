// src/types/nominatim.d.ts
declare module 'nominatim' {
    export interface NominatimAddress {
      road?: string;
      suburb?: string;
      city_district?: string;
      city?: string;
      town?: string;
      village?: string;
      county?: string;
      state?: string;
      country?: string;
      postcode?: string;
      [key: string]: string | undefined;
    }
  
    export interface NominatimResponse {
      address: NominatimAddress;
      error?: {
        code: number;
        message: string;
      };
    }
  }