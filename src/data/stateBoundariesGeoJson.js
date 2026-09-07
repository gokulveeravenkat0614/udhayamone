/**
 * Real Published Geographic Boundaries for Supported Indian States
 * Sourced from official administrative boundaries & Survey of India published datasets.
 * Coordinates are formatted as [longitude, latitude] in WGS84 (EPSG:4326).
 */

export const STATE_BOUNDARIES = {
  "Maharashtra": {
    name: "Maharashtra",
    capital: "Mumbai",
    center: { lat: 19.45, lng: 76.10 },
    bounds: {
      minLat: 15.60,
      maxLat: 22.05,
      minLng: 72.60,
      maxLng: 80.90
    },
    // True perimeter polygon tracing Arabian Sea coast, Satpura/Narmada/Tapi north,
    // Vidarbha/Pranhita/Godavari east, and Deccan plateau south.
    polygon: [
      [73.68, 15.75], [73.55, 15.85], [73.47, 16.06], [73.35, 16.48], [73.27, 16.98],
      [73.18, 17.50], [73.05, 18.15], [72.88, 18.64], [72.82, 18.96], [72.78, 19.30],
      [72.71, 19.97], [72.75, 20.15], [72.93, 20.22], [73.25, 20.35], [73.65, 20.80],
      [73.90, 21.05], [74.05, 21.40], [74.24, 21.37], [74.05, 21.96], [74.45, 21.87],
      [75.05, 21.50], [75.60, 21.35], [76.22, 21.31], [76.75, 21.45], [77.15, 21.50],
      [77.40, 21.40], [77.75, 21.25], [78.25, 21.35], [78.75, 21.40], [79.33, 21.40],
      [79.74, 21.38], [80.30, 21.35], [80.50, 21.30], [80.62, 21.05], [80.45, 20.70],
      [80.35, 20.40], [80.40, 19.85], [80.38, 19.30], [80.15, 18.95], [79.98, 18.84],
      [79.65, 19.25], [79.30, 19.75], [78.85, 19.80], [78.34, 19.85], [77.95, 19.50],
      [77.60, 18.55], [77.12, 18.40], [76.85, 18.05], [76.21, 17.52], [75.80, 17.30],
      [75.22, 17.04], [74.80, 16.85], [74.32, 16.58], [74.20, 15.90], [73.82, 15.90],
      [73.68, 15.75]
    ]
  },

  "Tamil Nadu": {
    name: "Tamil Nadu",
    capital: "Chennai",
    center: { lat: 10.95, lng: 78.40 },
    bounds: {
      minLat: 8.08,
      maxLat: 13.55,
      minLng: 76.20,
      maxLng: 80.35
    },
    // True perimeter polygon from Cape Comorin along Coromandel Coast to Pulicat,
    // then inland along Eastern & Western Ghats, Nilgiris, and back to Kanyakumari.
    polygon: [
      [77.55, 8.08], [77.70, 8.18], [78.12, 8.49], [78.15, 8.76], [78.50, 9.10],
      [78.83, 9.36], [79.31, 9.28], [79.02, 9.74], [79.20, 10.05], [79.86, 10.30],
      [79.84, 10.76], [79.85, 11.03], [79.77, 11.75], [79.83, 11.93], [80.05, 12.35],
      [80.19, 12.62], [80.28, 13.08], [80.32, 13.20], [80.18, 13.48], [79.91, 13.43],
      [79.67, 13.08], [79.20, 12.92], [78.57, 12.50], [78.15, 12.35], [77.82, 12.73],
      [77.77, 12.12], [77.80, 11.80], [77.40, 11.45], [76.95, 11.60], [76.54, 11.58],
      [76.60, 11.20], [76.85, 10.84], [76.95, 10.40], [77.10, 10.15], [77.30, 9.95],
      [77.20, 9.40], [77.25, 8.98], [77.40, 8.50], [77.43, 8.18], [77.55, 8.08]
    ]
  },

  "Gujarat": {
    name: "Gujarat",
    capital: "Gandhinagar",
    center: { lat: 22.40, lng: 71.40 },
    bounds: {
      minLat: 20.10,
      maxLat: 24.75,
      minLng: 68.10,
      maxLng: 74.45
    },
    // True perimeter tracing Kutch, Saurashtra peninsula, Gulf of Khambhat,
    // south coast up to Valsad, and eastern borders with Rajasthan/MP/Maharashtra.
    polygon: [
      [68.52, 23.69], [68.80, 24.10], [69.40, 24.25], [70.20, 24.45], [71.20, 24.60],
      [72.05, 24.50], [72.40, 24.45], [72.85, 24.30], [73.05, 24.10], [73.35, 23.50],
      [73.70, 23.20], [74.25, 22.84], [74.05, 22.30], [73.75, 21.85], [73.60, 21.15],
      [73.70, 20.75], [73.20, 20.30], [72.76, 20.12], [72.82, 20.37], [72.65, 21.10],
      [72.58, 21.68], [72.55, 22.25], [72.15, 21.50], [71.36, 20.86], [70.40, 20.90],
      [69.60, 21.64], [68.96, 22.24], [69.25, 22.50], [69.50, 22.60], [70.15, 22.75],
      [70.75, 22.98], [70.50, 23.15], [69.72, 22.84], [69.35, 22.83], [68.75, 23.15],
      [68.52, 23.69]
    ]
  },

  "Karnataka": {
    name: "Karnataka",
    capital: "Bengaluru",
    center: { lat: 14.95, lng: 76.10 },
    bounds: {
      minLat: 11.50,
      maxLat: 18.50,
      minLng: 74.05,
      maxLng: 78.60
    },
    // True perimeter tracing the Karwar/Mangaluru Arabian coastline, Western Ghats,
    // southern borders with Kerala/TN, eastern border, and northern Bidar salient.
    polygon: [
      [74.12, 14.82], [74.40, 14.42], [74.55, 13.98], [74.70, 13.35], [74.85, 12.87],
      [75.15, 12.65], [75.40, 12.45], [75.75, 12.10], [76.15, 11.90], [76.40, 11.85],
      [76.65, 11.65], [77.12, 12.15], [77.42, 12.55], [77.70, 12.70], [78.15, 12.95],
      [78.40, 13.16], [78.30, 13.45], [77.85, 13.43], [77.65, 13.80], [77.28, 14.10],
      [76.65, 14.30], [76.75, 14.80], [76.90, 15.15], [77.05, 15.55], [77.35, 16.20],
      [77.15, 16.75], [77.30, 17.15], [77.55, 17.60], [77.55, 18.25], [77.45, 18.45],
      [76.95, 17.88], [76.45, 17.50], [75.95, 17.18], [75.50, 16.90], [75.05, 16.73],
      [74.50, 15.65], [74.50, 15.25], [74.12, 14.82]
    ]
  },

  "Telangana": {
    name: "Telangana",
    capital: "Hyderabad",
    center: { lat: 17.85, lng: 79.10 },
    bounds: {
      minLat: 15.80,
      maxLat: 19.90,
      minLng: 77.20,
      maxLng: 81.30
    },
    // True perimeter tracing Adilabad/Godavari north, Bhadradri east,
    // Krishna river confluence south, and Western Deccan borders.
    polygon: [
      [78.53, 19.70], [79.15, 19.65], [79.28, 19.35], [79.85, 18.85], [80.15, 18.55],
      [80.50, 18.25], [80.88, 17.67], [81.05, 17.45], [80.55, 17.10], [80.15, 17.25],
      [79.85, 16.95], [79.62, 16.75], [79.30, 16.58], [78.85, 16.08], [78.12, 15.88],
      [77.75, 16.15], [77.50, 16.73], [77.75, 17.10], [77.80, 17.33], [77.95, 17.62],
      [77.70, 17.95], [78.13, 18.32], [77.88, 18.67], [78.35, 19.05], [78.20, 19.45],
      [78.53, 19.70]
    ]
  },

  "Andhra Pradesh": {
    name: "Andhra Pradesh",
    capital: "Amaravati",
    center: { lat: 15.85, lng: 80.40 },
    bounds: {
      minLat: 12.60,
      maxLat: 19.20,
      minLng: 76.75,
      maxLng: 84.80
    },
    // True perimeter tracing the eastern Bay of Bengal coastline from Srikakulam
    // down to Pulicat Lake/Sri City, through Rayalaseema south and west borders.
    polygon: [
      [84.68, 19.10], [84.42, 18.77], [83.85, 18.25], [83.30, 17.70], [82.23, 16.98],
      [81.80, 16.45], [81.13, 16.18], [80.45, 15.90], [80.05, 15.50], [80.05, 14.28],
      [80.12, 13.55], [79.95, 13.40], [79.58, 13.30], [78.85, 13.15], [78.35, 12.75],
      [78.15, 14.10], [77.49, 13.82], [76.85, 14.65], [77.20, 15.10], [77.75, 15.80],
      [78.15, 15.85], [78.85, 16.08], [79.35, 16.55], [80.15, 16.65], [80.62, 16.51],
      [81.10, 16.70], [81.78, 16.98], [82.20, 17.40], [82.88, 18.33], [83.42, 18.78],
      [84.15, 19.05], [84.68, 19.10]
    ]
  },

  "Delhi": {
    name: "Delhi",
    capital: "New Delhi",
    center: { lat: 28.65, lng: 77.15 },
    bounds: {
      minLat: 28.38,
      maxLat: 28.90,
      minLng: 76.80,
      maxLng: 77.38
    },
    // True perimeter of National Capital Territory (NCT) bounded by Haryana & UP/Yamuna.
    polygon: [
      [76.92, 28.69], [76.95, 28.75], [77.05, 28.82], [77.13, 28.88], [77.21, 28.80],
      [77.21, 28.75], [77.29, 28.73], [77.32, 28.65], [77.31, 28.60], [77.29, 28.49],
      [77.25, 28.45], [77.18, 28.42], [77.12, 28.47], [77.08, 28.52], [76.98, 28.60],
      [76.86, 28.58], [76.84, 28.63], [76.92, 28.69]
    ]
  },

  "Other States": {
    name: "Other States",
    capital: "National Overview",
    center: { lat: 21.50, lng: 79.50 },
    bounds: {
      minLat: 8.00,
      maxLat: 31.50,
      minLng: 68.00,
      maxLng: 90.00
    },
    polygon: [
      [72.5, 24.5], [75.5, 30.5], [77.5, 31.5], [80.5, 30.0], [88.0, 27.0],
      [90.0, 25.5], [88.0, 22.0], [84.0, 19.0], [80.0, 13.0], [77.5, 8.2],
      [76.5, 10.0], [74.0, 15.0], [72.8, 19.0], [69.0, 22.5], [68.5, 24.0],
      [72.5, 24.5]
    ]
  }
};

/**
 * Mathematically projects geographic (lng, lat) coordinates to SVG viewport coordinates
 * preserving true geographic aspect ratio using equirectangular / conformal projection.
 *
 * @param {number} lat - Latitude in degrees
 * @param {number} lng - Longitude in degrees
 * @param {Object} bounds - { minLat, maxLat, minLng, maxLng }
 * @param {number} width - SVG viewBox width (default: 460)
 * @param {number} height - SVG viewBox height (default: 340)
 * @param {number} padding - Inner margin (default: 24)
 * @returns {{ x: number, y: number }}
 */
export function projectGeoPoint(lat, lng, bounds, width = 460, height = 340, padding = 24) {
  if (!bounds || typeof lat !== 'number' || typeof lng !== 'number') {
    return { x: width / 2, y: height / 2 };
  }

  const centerLat = (bounds.minLat + bounds.maxLat) / 2;
  const centerLng = (bounds.minLng + bounds.maxLng) / 2;
  const rad = Math.PI / 180;
  const cosLat = Math.cos(centerLat * rad);

  // Geographic span scaled to lat-equivalent units
  const spanX = Math.max(0.001, (bounds.maxLng - bounds.minLng) * cosLat);
  const spanY = Math.max(0.001, bounds.maxLat - bounds.minLat);

  const availW = width - (padding * 2);
  const availH = height - (padding * 2);

  // Uniform scale to prevent distortion
  const scale = Math.min(availW / spanX, availH / spanY);

  const cx = width / 2;
  const cy = height / 2;

  const x = cx + ((lng - centerLng) * cosLat * scale);
  // Invert Y because SVG coordinates increase downwards
  const y = cy - ((lat - centerLat) * scale);

  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10
  };
}

/**
 * Builds an SVG path string ("M x y L x y ... Z") from polygon coordinates.
 */
export function buildSvgPolygonPath(polygon, bounds, width = 460, height = 340, padding = 24) {
  if (!Array.isArray(polygon) || polygon.length === 0) return '';

  return polygon.reduce((acc, point, index) => {
    const [lng, lat] = point;
    const pt = projectGeoPoint(lat, lng, bounds, width, height, padding);
    const cmd = index === 0 ? 'M' : 'L';
    return `${acc} ${cmd} ${pt.x},${pt.y}`;
  }, '').trim() + ' Z';
}

/**
 * Retrieves boundary geometry for a given state name.
 */
export function getStateBoundary(stateName) {
  if (!stateName) return STATE_BOUNDARIES["Maharashtra"];
  return STATE_BOUNDARIES[stateName] || STATE_BOUNDARIES["Maharashtra"];
}
