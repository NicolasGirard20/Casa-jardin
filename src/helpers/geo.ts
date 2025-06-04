
const API = "https://apis.datos.gob.ar/georef/api/";
const MAX_LOCALIDADES = 900;

interface Localidad {
    id: string;
    nombre: string;
    provincia: { id: string; nombre: string };
}

interface Provincia {
    id: string;
    nombre: string;
}

// función para fechar datos de la API
async function fetchFromAPI<T>(endpoint: string): Promise<T> {
    try {
        const response = await fetch(API + endpoint);
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error al realizar la solicitud a ${endpoint}:`, error);
        return Promise.reject(error);
    }
}
// función para obtener localidades por provincia
export async function getLocalidadesByProvincia(provinciaName: string): Promise<Localidad[]> {
    const data = await fetchFromAPI<{ localidades: Localidad[] }>(
        `localidades?provincia=${encodeURIComponent(provinciaName)}&max=${MAX_LOCALIDADES}`
    );
    return data.localidades;
}
// función para obtener provincias
export async function getProvincias(): Promise<Provincia[]> {
    const data = await fetchFromAPI<{ provincias: Provincia[] }>("provincias");
    return data.provincias;
}
