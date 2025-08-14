// src/context/GoogleMapsContext.tsx
import { createContext, useContext } from "react";
import { useJsApiLoader, Libraries } from "@react-google-maps/api";

const GoogleMapsContext = createContext<{ isLoaded: boolean }>({ isLoaded: false });

const libraries: Libraries = ["places", "geometry", "maps"]; // Include all required libraries

export const GoogleMapsProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCq3n0PuZCtun6j0kiLnprf0mEqgQOvGls",
    libraries,
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => useContext(GoogleMapsContext);