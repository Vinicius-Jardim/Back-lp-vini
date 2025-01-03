// Função para calcular a distância entre dois pontos usando a fórmula de Haversine
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em quilômetros
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distância em quilômetros
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

// Função para extrair coordenadas de um link do Google Maps ou coordenadas diretas
export function extractCoordinates(mapUrl) {
  try {
    // Se for coordenadas diretas (formato: latitude, longitude)
    const directCoords = mapUrl
      .split(",")
      .map((coord) => parseFloat(coord.trim()));
    if (
      directCoords.length === 2 &&
      !isNaN(directCoords[0]) &&
      !isNaN(directCoords[1])
    ) {
      return {
        latitude: directCoords[0],
        longitude: directCoords[1],
      };
    }

    // Se não for coordenadas diretas, tenta extrair de URL do Google Maps
    if (!mapUrl.includes("google") && !mapUrl.includes("goo.gl")) {
      return null;
    }

    // Tenta encontrar coordenadas em vários formatos de URL
    const patterns = [
      // Formato padrão: @41.2360671,-8.5178773
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,

      // Formato alternativo: /maps/place/.../@41.2360671,-8.5178773
      /place\/.*@(-?\d+\.\d+),(-?\d+\.\d+)/,

      // Formato curto: maps.google.com/?q=41.2360671,-8.5178773
      /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,

      // Formato de compartilhamento: ?ll=41.2360671,-8.5178773
      /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
    ];

    for (const pattern of patterns) {
      const match = mapUrl.match(pattern);
      if (match) {
        return {
          latitude: parseFloat(match[1]),
          longitude: parseFloat(match[2]),
        };
      }
    }

    // Se chegou aqui, tenta extrair da URL decodificada
    const decodedUrl = decodeURIComponent(mapUrl);

    for (const pattern of patterns) {
      const match = decodedUrl.match(pattern);
      if (match) {
        return {
          latitude: parseFloat(match[1]),
          longitude: parseFloat(match[2]),
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error extracting coordinates:", error);
    return null;
  }
}
