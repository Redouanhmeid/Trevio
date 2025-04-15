import { useJsApiLoader } from '@react-google-maps/api';
import MapConfig from '../mapconfig';

const libraries = ['places', 'geometry'];

export const useGoogleMapsLoader = () => {
 const { isLoaded } = useJsApiLoader({
  id: MapConfig.MAP_ID,
  googleMapsApiKey: MapConfig.REACT_APP_GOOGLE_MAP_API_KEY,
  libraries: libraries,
  version: 'beta',
 });

 return isLoaded;
};
