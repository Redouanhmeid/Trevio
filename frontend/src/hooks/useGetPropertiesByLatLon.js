import { useEffect, useState } from 'react';

const useGetPropertiesByLatLon = (latitude, longitude, bounds) => {
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [data, setData] = useState(null);

 useEffect(() => {
  const fetchData = async () => {
   try {
    let url = `/api/v1/properties/properties?latitude=${latitude}&longitude=${longitude}`;

    if (bounds) {
     const ne = bounds.getNorthEast();
     const sw = bounds.getSouthWest();
     url += `&ne_lat=${ne.lat()}&ne_lng=${ne.lng()}&sw_lat=${sw.lat()}&sw_lng=${sw.lng()}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
     throw new Error('Failed to fetch data');
    }
    const json = await response.json();
    setData(json);
   } catch (error) {
    setError(error);
   } finally {
    setLoading(false);
   }
  };

  fetchData();
 }, [latitude, longitude, bounds]);

 return { loading, error, data };
};

export default useGetPropertiesByLatLon;
