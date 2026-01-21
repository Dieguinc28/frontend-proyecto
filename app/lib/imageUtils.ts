const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
  'http://localhost:5000';

export function getImageUrl(imagePath: string | undefined): string {
  if (!imagePath) {
    return '/placeholder.png';
  }

  // Si ya es una URL completa, devolverla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Si es una ruta relativa, construir la URL completa
  if (imagePath.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imagePath}`;
  }

  // Si es solo el nombre del archivo
  return imagePath;
}
