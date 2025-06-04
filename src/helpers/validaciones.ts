// validaciones.ts
// Este archivo contiene funciones de validación para diferentes campos de entrada, como DNI, email, contraseña, dirección, nombre y apellido.

export  const caracEspeciales = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/; // Expresión regular correcta para validar nombres y apellidos
export function validateDni(dni: string) {
    //console.log("dni",dni);

    dni = dni.trim(); // Eliminar espacios en blanco
    if(dni == null){
        return "El DNI no puede estar vacío.";
    }
    // Validar que sea solo números
    const dniRegex = /^\d+$/;
    if (!dniRegex.test(dni)) {
        return "El DNI debe contener solo números positivos y no puede estar vacio.";
    }

    // Validar longitud
    if (dni.length < 7 && dni.length >= 8) {
        return "El DNI debe tener entre 7 y 8 dígitos.";
    }

    // Validar valores no válidos
    const invalidDnis = ["00000000", "000000000", "11111111", "12345678", "99999999"];
    if (invalidDnis.includes(dni)) {
        return "El DNI ingresado no es válido.";
    }

    // Validar rango
    const dniNumber = parseInt(dni, 10);
    if (dniNumber < 100000 && dniNumber > 99999999) {
        return "El DNI ingresado está fuera del rango válido.";
    }
    return null; // Retornar null si no hay errores
}

export function validateEmail(email: string) {
    if (!email) {
        return "El email no puede estar vacío.";
    }

    email = email.trim(); // Eliminar espacios en blanco

    // Validar formato
    const emailRegex = /^[a-zA-Z0-9_À-ÿ.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!emailRegex.test(email)) {
        return "El email no es válido (estructura mínima valida: dominio@email.com)";
    }
    if (email.length > 99) {
        return "El email no puede tener más de 99 caracteres.";
    }

    
    return null; // Retornar null si no hay errores
}

export function validatePasswordComplexity(password: string) {
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const numberRegex = /\d/;
    const lengthRegex = /.{8,}/;

    if (!uppercaseRegex.test(password)) {
        return "La contraseña debe incluir al menos una letra mayúscula.";
    }

    if (!lowercaseRegex.test(password)) {
        return "La contraseña debe incluir al menos una letra minúscula.";
    }

    if (!numberRegex.test(password)) {
        return "La contraseña debe incluir al menos un número.";
    }
    if (!lengthRegex.test(password)) {
        return "La contraseña debe tener al menos 8 caracteres.";
    }
    return null;
}

export async function validateDireccion(pais?: string, provincia?: string, localidad?: string, calle?: string, numero?: number) {
    const caracEspeciales = /[!@#$%^&*(),.?":{}|<>]/;
    console.log(pais, provincia, localidad, calle, numero);
    if(!pais){
        return "El país no puede estar vacío";
    }
    if(pais.toUpperCase() !="ARGENTINA"){
        return "El país debe ser Argentina";
    }
    
    if(!provincia){
        return "La provincia no puede estar vacía";
    }
    //console.log("HOLAAAAAAAAAAAAAAAAAAAA")
    const resProv = await fetch(`http://api/verificarProvLoc?provincia=${encodeURIComponent((provincia))}`);
    const responseProv = await resProv.json();
    console.log("responseProv", responseProv);
    if (responseProv.tipo === "provincia" && responseProv.nombre === provincia && !responseProv.valida) {
        return "La provincia ingresada no es válida.";
    }
    if(!localidad){
        return "La localidad no puede estar vacía";
    }
    const resLoc = await fetch(`http://api/verificarProvLoc?localidad=${encodeURIComponent((localidad))}`);
    const responseLoc = await resLoc.json();
    if (responseLoc.tipo === "provincia" && responseLoc.nombre === localidad && !responseLoc.valida) {
        return "La localidad ingresada no es válida.";
    }
    if(!calle){
        return "La calle no puede estar vacía";
    }
    if(!numero){
        return "El número de la dirección no puede estar vacío";
    }
    if (pais && /\d/.test(pais)) {
        return "El país no debe contener números";
    }
    if (pais && caracEspeciales.test(pais)) {
        return "El país no puede contener caracteres especiales";
    }
    if (provincia && /\d/.test(provincia)) {
        return "La provincia no debe contener números";
    }
    if (provincia && caracEspeciales.test(provincia)) {
        return "La provincia no puede contener caracteres especiales";
    }
    if (localidad && /\d/.test(localidad)) {
        return "La localidad no debe contener números";
    }
    if (localidad && caracEspeciales.test(localidad)) {
        return "La localidad no puede contener caracteres especiales";
    }
    if (calle && caracEspeciales.test(calle)) {
        return "La calle no puede contener caracteres especiales";
    }
    if (numero && isNaN(numero)) {
        return "El número de la dirección debe ser un número";
    }
    if (numero && numero < 0) {
        return "El número de la dirección no puede ser negativo";
    }
    if (pais.length < 1) {
        return ("El país debe tener al menos 2 caracteres.");
    }
    if (provincia.length < 1) {
        return ("La provincia debe tener al menos 2 caracteres.");
    }
    if (localidad.length < 1 ) {
        return ("La localidad debe tener al menos 2 caracteres.");
    }
    if (calle.length < 1 ) {
        return ("La calle debe tener al menos 2 caracteres.");
    }
    return null;
}

export function validateNombre(nombre: string) {

    if (!nombre) {
        return "El nombre no puede estar vacío"; // Prioridad: Verificar que no esté vacío primero
    }
    if (/\d/.test(nombre)) {
        return "El nombre no debe contener números"; // Detectar números
    }
    if (!caracEspeciales.test(nombre)) {
        return "El nombre no puede contener caracteres especiales"; // Verificar caracteres válidos
    }
    if (nombre.length < 2) {
        return "El nombre debe tener al menos 2 caracteres"; // Validar longitud mínima
    }
    // Validar longitud máxima
    if (nombre.length > 50) {
        return "El nombre no puede tener más de 50 caracteres.";
    }

    return null; // Sin errores
}
// validacion de el responsable de un alumno
export function validateNombreRespon(nombre: string, apellido: string) {

    if (!nombre) {
        return "El nombre del responsble no puede estar vacío"; // Prioridad: Verificar que no esté vacío primero
    }
    if (/\d/.test(nombre)) {
        return "El nombre del responsable no debe contener números"; // Detectar números
    }
    if (!caracEspeciales.test(nombre)) {
        return "El nombre del responsable no puede contener caracteres especiales"; // Verificar caracteres válidos
    }
    if (nombre.length < 2) {
        return "El nombre del responsable debe tener al menos 2 caracteres"; // Validar longitud mínima
    }
    // Validar longitud máxima
    if (nombre.length > 50) {
        return "El nombre del responsable no puede tener más de 50 caracteres.";
    }
    // valida los apellido del responsable
    if (!apellido) {
        return "El apellido del responsable no puede estar vacío"; // Prioridad: Verificar que no esté vacío primero
    }
    if (/\d/.test(apellido)) {
        return "El apellido del responsable no debe contener números"; // Detectar números
    }
    if (!caracEspeciales.test(apellido)) {
        return "El apellido del responsable no puede contener caracteres especiales"; // Verificar caracteres válidos
    }
    if (apellido.length < 2) {
        return "El apellido del responsable debe tener al menos 2 caracteres"; // Validar longitud mínima
    }
    // Validar longitud máxima
    if (apellido.length > 50) {
        return "El apellido del responsable no puede tener más de 50 caracteres.";
    }

    

    return null; // Sin errores
}


export function validateApellido(apellido: string) {
    

    if (!apellido) {
        return "El apellido no puede estar vacío"; // Prioridad: Verificar que no esté vacío primero
    }
    if (/\d/.test(apellido)) {
        return "El apellido no debe contener números"; // Detectar números
    }
    if (!caracEspeciales.test(apellido)) {
        return "El apellido no puede contener caracteres especiales"; // Verificar caracteres válidos
    }
    if (apellido.length < 2) {
        return "El apellido debe tener al menos 2 caracteres"; // Validar longitud mínima
    }
    // Validar longitud máxima
    if (apellido.length > 50) {
        return "El apellido no puede tener más de 50 caracteres.";
    }

    return null; // Sin errores
}

export function validatePhoneNumber(phone: string) {
    // Expresión regular para validar teléfono en Argentina (sin considerar el prefijo +54)
    const phoneRegex = /^(0\d{1,4})\d{5,9}$/; // Permite números como: 03434529149, 3434529149
    const numberRegex = /^\d+$/;
    // Lista de números inválidos comunes
    const invalidNumbers = [
        "00000000000", "99999999999", "11111111111", "22222222222", "33333333333", "44444444444", // Números repetidos
        "55555555555", "66666666666", "77777777777", "88888888888", "1234567890", "0987654321", // Secuencias
    ];

    console.log("phone", phone);

    // Si el teléfono es nulo o vacío
    if (!phone) {
        return "El número de teléfono no puede estar vacío.";
    }

    // Eliminar caracteres no numéricos
    const cleanedPhone = phone.replace(/[^\d]/g, '');

    // El número debe tener entre 9 y 12 dígitos
    if (cleanedPhone.length < 9 || cleanedPhone.length > 12) {
        return "El número de teléfono debe tener entre 9 y 12 dígitos.";
    }

    // Validar que el teléfono solo contenga números
    if (!numberRegex.test(cleanedPhone)) {
        return "El número de teléfono debe contener solo números.";
    }

    // Validar si el número es uno de los números inválidos
    if (invalidNumbers.includes(cleanedPhone)) {
        return "El número de teléfono ingresado no es válido.";
    }

    // Validación adicional: Números con dígitos repetidos o secuenciales
    if (/^(\d)\1+$/.test(cleanedPhone)) {
        return "El número de teléfono no puede contener dígitos repetidos.";
    }

    // Verificar formato con la expresión regular (solo números nacionales)
   

    return null;
}



// validacion de fecha de nacimiento
export function validateFechaNacimiento(fechaNacimiento: Date | undefined) {
    if (!fechaNacimiento) {
        return "La fecha de nacimiento no puede estar vacía.";
    }
    if (fechaNacimiento > new Date()) {
        return "La fecha de nacimiento no puede ser mayor a la fecha actual.";
    }
    // Validar que la fecha de nacimiento sea mayor a 2 años
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 2);
    if (fechaNacimiento > minDate) {
        return "La fecha de nacimiento debe ser mayor a 2 años.";
    }
    // Validar que la fecha de nacimiento sea menor a 100 años
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 100);
    if (fechaNacimiento < maxDate) {
        return "La fecha de nacimiento no puede ser mayor a 100 años.";
    }
    return null;
}


// validaciones.ts

export function validateCursoDetails(details: {
    nombre: string;
    descripcion: string;
    fechaInicio: Date;
    fechaFin: Date;
    edadMinima: number;
    edadMaxima: number;
}) {
    const { nombre, descripcion, fechaInicio, fechaFin, edadMinima, edadMaxima } = details;
    const errors: { [key: string]: string } = {};

    if (nombre.length < 2 || nombre.length > 50) {
        errors.nombre = "El nombre debe tener entre 2 y 50 caracteres.";
    }

    const descripcionWords = descripcion.trim().split(/\s+/).length;
    if (descripcionWords < 5) errors.descripcion = "La descripción debe tener al menos 5 palabras.";
    if (descripcionWords > 300) errors.descripcion = "La descripción no puede exceder las 300 palabras.";

    const regex = /^[a-zA-Z0-9À-ÿ\u00f1\u00d1\u00fc\u00dc\s.,:-]*$/;
    if (!regex.test(nombre)) errors.nombre = "El nombre contiene caracteres no permitidos.";
    if (!regex.test(descripcion)) errors.descripcion = "La descripción contiene caracteres no permitidos.";

    const diffDays = Math.ceil(
        Math.abs(fechaFin.getTime() - (fechaInicio?.getTime() || 0)) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 7) errors.fecha = "El rango de fechas no puede ser menor a 7 días.";

    if (edadMinima < 2) errors.edadMinima = "La edad mínima no puede ser menor a 2 años.";
    if (edadMinima === 0) errors.edadMinima = "La edad mínima no puede ser 0 años.";
    if (edadMaxima > 99) errors.edadMaxima = "La edad máxima no puede ser mayor a 99 años.";
    if (edadMinima > edadMaxima) errors.edad = "La edad mínima no puede ser mayor que la edad máxima.";

    return errors;
}

export function validateFechaInicio(fechaInicio: Date | undefined) {
    const errors: { [key: string]: string } = {};
    if (!fechaInicio) errors.fechaInicio = "La fecha de inicio no puede estar vacía.";
    return errors;
}

export function validateFechaInicioalta(fechaInicio: Date | undefined, fechaFin: Date) {
    const errors: { [key: string]: string } = {};
    if (!fechaInicio) errors.fechaInicio = "La fecha de inicio no puede estar vacía.";
    if (fechaInicio && fechaInicio < new Date()) errors.fechaInicio = "La fecha de inicio no puede ser menor a la fecha actual.";
    if (fechaInicio && fechaInicio >= fechaFin) errors.fechaInicio = "La fecha de inicio debe ser anterior a la fecha de fin.";

    const diffDays = Math.ceil(
        Math.abs(fechaFin.getTime() - (fechaInicio?.getTime() || 0)) / (1000 * 60 * 60 * 24)
    );
    if (diffDays > 365) errors.fecha = "El curso no puede tener una vigencia mayor a un año.";

    return errors;
}

export function validateFechaInicioModificacion(
    fechaInicio: Date,
    fechaInicioAnterior: Date,
    fechaFin: Date
) {
    const errors = validateFechaInicio(fechaInicio);
    if (Object.keys(errors).length > 0) return errors;

    const diffDays = Math.ceil(
        Math.abs(fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays > 365) errors.fecha = "El curso no puede tener una vigencia mayor a un año.";

    if (fechaInicio < fechaInicioAnterior) errors.fechaInicio = "La fecha de inicio no puede ser menor a la fecha de inicio anterior.";

    return errors;
}
