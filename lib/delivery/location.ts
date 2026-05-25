export type Coordinates = {
  latitude: number;
  longitude: number;
};

const earthRadiusKm = 6371;

export const supportedCityLocations = [
  { city: "Sao Paulo", latitude: -23.5505, longitude: -46.6333 },
  { city: "Campinas", latitude: -22.9056, longitude: -47.0608 },
  { city: "Rio de Janeiro", latitude: -22.9068, longitude: -43.1729 },
  { city: "Belo Horizonte", latitude: -19.9167, longitude: -43.9345 },
  { city: "Curitiba", latitude: -25.4284, longitude: -49.2733 }
] as const;

export const supportedCities = supportedCityLocations.map(location => location.city);

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceInKm(origin: Coordinates, destination: Coordinates) {
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) * Math.cos(destinationLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}

export function resolveNearestCity(coordinates: Coordinates) {
  return supportedCityLocations
    .map(location => ({
      city: location.city,
      distanceKm: distanceInKm(coordinates, location)
    }))
    .sort((left, right) => left.distanceKm - right.distanceKm)[0];
}

export function resolveCityCoordinates(city: string): Coordinates | null {
  const normalizedCity = city.trim().toLowerCase();
  const location = supportedCityLocations.find(item => item.city.toLowerCase() === normalizedCity);

  return location
    ? {
        latitude: location.latitude,
        longitude: location.longitude
      }
    : null;
}

export function isWithinRadius(origin: Coordinates, destination: Coordinates, radiusKm: number) {
  return distanceInKm(origin, destination) <= radiusKm;
}

export function formatMapsRouteUrl({
  pickupAddress,
  dropoffAddress,
  city
}: {
  pickupAddress: string;
  dropoffAddress: string;
  city: string;
}) {
  const origin = `${pickupAddress}, ${city}`;
  const destination = `${dropoffAddress}, ${city}`;

  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    origin
  )}&destination=${encodeURIComponent(destination)}`;
}
