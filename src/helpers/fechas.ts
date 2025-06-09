// Pasar el DateTime a Date
export function dateTimeToDate(dateTime: any): Date {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
    }
    return new Date(date.toISOString().split('T')[0]);
}
//ejemplo de parametro 
export function dateTimeToString(dateTime: any): string {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
    }
    return date.toISOString().split('T')[0];
}

export function stringToDateTime(dateString: string): Date {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
    }
    return date;
}

//sirve para los inputs de tipo date
//ejemplo de lo que recibe como parametro: 
// "Sat Jul 15 2023 21:00:00 GMT-0300 (hora estándar de Argentina) "
export const formDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    console.log(`input: ${dateString} | output: ${year}-${month}-${day}`)
    //return `${year}-${month}-${day}`;
    return `${year}-${month}-${day}`; 
}

//sirve para mostrar la fecha en el formato dd-mm-yyyy (si no es un input es mejor esta versión)
export const displayDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    console.log(`input: ${dateString} | output: ${year}-${month}-${day}`)
    //return `${year}-${month}-${day}`;
    return `${day}-${month}-${year}`; 
}

//obtener edad de un alumno en base a su fecha de nacimiento
export function calcularEdad(fechaNacimiento: any) {
    fechaNacimiento = dateTimeToDate(fechaNacimiento);
    const diff = Date.now() - fechaNacimiento.getTime(); // Diferencia en milisegundos
    const edad = new Date(diff); // Crear un objeto Date con la diferencia
    return Math.abs(edad.getUTCFullYear() - 1970); // Restar 1970 para obtener la edad
  }