export const getCoordinates = async (address: string) => {
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${process?.env?.NEXT_PUBLIC_API_KEY}`;

  try {
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      throw new Error("Address not found");
    }
  } catch (error) {
    throw error;
  }
};

export const getStreetViewUrl = (lat: number, lng: number) => {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
};
export const getGoogleMapsUrl = (lat: number, lng: number) => {
  return `https://www.google.com/maps/place/${lat},${lng}/@${lat},${lng},57m/data=!3m1!1e3`;
};
