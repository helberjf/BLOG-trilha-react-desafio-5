export type Coordinates = {
  latitude: number;
  longitude: number;
};

const earthRadiusKm = 6371;

export const supportedCityLocations = [
  { city: "Juiz de Fora", latitude: -21.7642, longitude: -43.3503 },
  { city: "Aparecida de Goiania", latitude: -16.8236, longitude: -49.2464 },
  { city: "Aracaju", latitude: -10.9472, longitude: -37.0731 },
  { city: "Belem", latitude: -1.4558, longitude: -48.5039 },
  { city: "Belo Horizonte", latitude: -19.9167, longitude: -43.9345 },
  { city: "Boa Vista", latitude: 2.8198, longitude: -60.6714 },
  { city: "Campinas", latitude: -22.9056, longitude: -47.0608 },
  { city: "Campo Grande", latitude: -20.4428, longitude: -54.6464 },
  { city: "Contagem", latitude: -19.9319, longitude: -44.0539 },
  { city: "Cuiaba", latitude: -15.5989, longitude: -56.0949 },
  { city: "Curitiba", latitude: -25.4284, longitude: -49.2733 },
  { city: "Duque de Caxias", latitude: -22.7858, longitude: -43.3117 },
  { city: "Feira de Santana", latitude: -12.2664, longitude: -38.9663 },
  { city: "Florianopolis", latitude: -27.5954, longitude: -48.5480 },
  { city: "Fortaleza", latitude: -3.7327, longitude: -38.5270 },
  { city: "Goiania", latitude: -16.6869, longitude: -49.2648 },
  { city: "Guarulhos", latitude: -23.4538, longitude: -46.5333 },
  { city: "Joao Pessoa", latitude: -7.1195, longitude: -34.8450 },
  { city: "Joinville", latitude: -26.3044, longitude: -48.8487 },
  { city: "Londrina", latitude: -23.3045, longitude: -51.1696 },
  { city: "Macapa", latitude: 0.0349, longitude: -51.0694 },
  { city: "Maceio", latitude: -9.6658, longitude: -35.7350 },
  { city: "Manaus", latitude: -3.1190, longitude: -60.0217 },
  { city: "Maringa", latitude: -23.4273, longitude: -51.9375 },
  { city: "Mogi das Cruzes", latitude: -23.5229, longitude: -46.1858 },
  { city: "Natal", latitude: -5.7793, longitude: -35.2009 },
  { city: "Niteroi", latitude: -22.8832, longitude: -43.1036 },
  { city: "Osasco", latitude: -23.5325, longitude: -46.7920 },
  { city: "Palmas", latitude: -10.2491, longitude: -48.3243 },
  { city: "Petropolis", latitude: -22.5042, longitude: -43.1781 },
  { city: "Porto Alegre", latitude: -30.0346, longitude: -51.2177 },
  { city: "Porto Velho", latitude: -8.7612, longitude: -63.9004 },
  { city: "Recife", latitude: -8.0539, longitude: -34.8811 },
  { city: "Ribeirao Preto", latitude: -21.1775, longitude: -47.8103 },
  { city: "Rio Branco", latitude: -9.9754, longitude: -67.8249 },
  { city: "Rio de Janeiro", latitude: -22.9068, longitude: -43.1729 },
  { city: "Salvador", latitude: -12.9714, longitude: -38.5014 },
  { city: "Santo Andre", latitude: -23.6639, longitude: -46.5383 },
  { city: "Santos", latitude: -23.9619, longitude: -46.3342 },
  { city: "Sao Jose dos Campos", latitude: -23.1794, longitude: -45.8869 },
  { city: "Sao Luis", latitude: -2.5297, longitude: -44.3028 },
  { city: "Sao Paulo", latitude: -23.5505, longitude: -46.6333 },
  { city: "Sorocaba", latitude: -23.5015, longitude: -47.4526 },
  { city: "Teresina", latitude: -5.0892, longitude: -42.8016 },
  { city: "Uberlandia", latitude: -18.9186, longitude: -48.2772 },
  { city: "Vitoria", latitude: -20.3155, longitude: -40.3128 }
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
