"use client"
import React, { useState, useEffect } from 'react';
import But_aside from "../../../../components/but_aside/page";
import Image from "next/image";
import Navigate from '../../../../components/alumno/navigate/page';
import AutorizacionImg from './componentes/autorizacionImagen';
import Reglamentacion from './componentes/reglamentacion';
import SeleccionTaller from './componentes/seleccionTaller';
import DatosMayor from './componentes/datosMayor';

const Adultos: React.FC = () => {
    // Estado para almacenar la pantalla actual
    const [selectedScreen, setSelectedScreen] = useState<number>(0);
    // Estado para almacenar los cursos seleccionados
    const [selectedCursosId, setSelectedCursosId] = useState<number[]>([]);

    const [datosMayor, setDatosMayor] = useState({
        nombre: "",
        apellido: "",
        telefono: 0,
        correoElectronico: "",
        dni: 0,
        pais: "",
        provincia: "",
        localidad: "",
        calle: "",
        numero: 0,
    });
    const [datosAutorizacionImage, setDatosAutorizacionImage] = useState({
        firma: "",
        observaciones: "",
    });
    const [datosReglamentacion, setDatosReglamentacion] = useState({
        firma: "",
    });
    const [alertaFinal, setAlertaFinal] = useState<boolean>(false);

    const [error, setError] = useState<string>('');
    //datos mayor: nombre, apellido, telefono, correo electronico, dni, pais, localidad, calle
    //datos autorizacionImage: firmo el mayor a cargo?, observaciones? puede ser nulo
    //datos reglamentacion: firmo?
    function validateDatosMayor() {

        // Validar que el nombre tenga al menos 2 caracteres
        if (datosMayor.nombre.length < 1) {
            return ("El nombre debe tener al menos 2 caracteres.");
        }
        if(datosMayor.apellido.length < 1){
            return ("El apellido debe tener al menos 2 caracteres.");
        }
        if((datosMayor.telefono).toString().length != 9){
            return ("El telefono debe tener al menos 9 números.");
        }
        if(datosMayor.correoElectronico.length < 11 || !datosMayor.correoElectronico.includes('@')){
            return ("El correo electrónico debe tener al menos 11 caracteres y contener '@'.");
        }
        if((datosMayor.dni).toString().length != 8){
            return ("El DNI debe tener al menos 8 números.");
        }
        if(datosMayor.pais.length < 1){
            return ("El país debe tener al menos 2 caracteres.");
        }
        if(datosMayor.provincia.length < 1){
            return ("La provincia debe tener al menos 2 caracteres.");
        }
        if(datosMayor.localidad.length < 1){
            return ("La localidad debe tener al menos 2 caracteres.");
        }
        if(datosMayor.calle.length < 1){
            return ("La calle debe tener al menos 2 caracteres.");
        }
        if(!datosMayor.numero){
            return ("El número debe tener al menos 1 número.");
        }
        // carrateres especiales en el nombre y la descripción
        const regex = /^[a-zA-Z0-9_ ,.;áéíóúÁÉÍÓÚñÑüÜ]*$/;; // no quiero que tenga caracteres especiales que las comas y puntos afecten 
        const regex2 = /^[a-zA-Z0-9_ ,;áéíóúÁÉÍÓÚñÑüÜ]*$/;
        const areDatosMayorComplete1 = Object.values(datosMayor).every(value => typeof value === 'string' && value != 'correoElectronico'&& !regex.test(value));
        if(areDatosMayorComplete1 && !regex2.test(datosMayor.correoElectronico)){
            return "Los campos no deben contener caracteres especiales";
        }
        return "";
    }
    function validarEnvio() {
        const areDatosMayorComplete = Object.values(datosMayor).every(value => value !== "" );
        const areDatosAutorizacionImageComplete = Object.values(datosAutorizacionImage).every(value => value !== "" );
        const areDatosReglamentacionComplete = Object.values(datosReglamentacion).every(value => value !== "" );

        if (selectedCursosId.length === 0 ) return setError('Debe seleccionar al menos un taller');
        if (!areDatosMayorComplete) return setError('Debe completar los datos del mayor a cargo');
        if (!areDatosAutorizacionImageComplete) return setError('Debe completar los datos de autorizacion de imagen');
        if (!areDatosReglamentacionComplete) return setError('Debe completar los datos de reglamentacion');
        setAlertaFinal(true);
    }

    function continuar() {
        
        //if(selectedScreen === 0 ) validateDatosMayor();
        if(selectedScreen === 1 ) {
            const err = validateDatosMayor();
            if(err != "") return setError(err);
        }
        //if(selectedScreen === 2 ) validateDatosMayor();
        if(selectedScreen === 3 ) validarEnvio();
        setSelectedScreen(selectedScreen + 1)
    }
    return (

        <main>
            <div className="relative bg-red-500 justify-between w-full p-4">
                <Navigate />
            </div>

            <div id='miDiv' style={{ height: (selectedScreen < 3 ? '60vh' : 'auto') }}>
                {selectedScreen === 0 && (
                    <SeleccionTaller
                        setSelectedCursosId={setSelectedCursosId}
                        selectedCursosId={selectedCursosId}
                    />
                )}

                {selectedScreen === 1 && (
                    <DatosMayor
                        setDatosMayor={setDatosMayor}
                        datosMayor={datosMayor}
                        setError={setError}
                    />
                )}
                {selectedScreen === 2 && (
                    <AutorizacionImg
                        setDatosAutorizacionImage={setDatosAutorizacionImage}
                    />
                )}
                {selectedScreen === 3 && (
                    <Reglamentacion
                        setDatosReglamentacion={setDatosReglamentacion}
                    />
                )}
            </div>

            {selectedScreen < 3 && (
                <div className='p-5 w-full'>
                    <div className='flex mb-5 justify-center space-x-80'>
                        <button
                            className='mx-2 py-2 text-white rounded bg-black px-6'
                            onClick={() => {
                                selectedScreen - 1 < 0
                                    ? window.location.href = "http://localhost:3000/usuario/Solicitud/Inscripcion"
                                    : setSelectedScreen(selectedScreen - 1);
                            }}
                        >
                            Volver
                        </button>
                        <button
                            className='mx-2 py-2 text-white rounded bg-black px-4'
                            onClick={() => continuar()}
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            )}

            {selectedScreen === 3 && (
                <div className='p-5 w-full'>
                    <div className='flex mb-5 justify-center space-x-80'>
                        <button
                            className='mx-2 py-2 text-white rounded bg-black px-5'
                            onClick={() => setSelectedScreen(selectedScreen - 1)}
                        >
                            Volver
                        </button>
                        <button
                            className='mx-2 py-2 text-white rounded bg-black px-5'
                            onClick={() => validarEnvio()}
                        >
                            Enviar
                        </button>
                    </div>
                </div>
            )}
            {alertaFinal && <div className="absolute top-2/3 right-1/3 transform -translate-x-1/3 -translate-y-1/9 bg-white p-6 rounded-md shadow-md w-96">
                <h2 className="text-lg font-bold mb-2">Términos y condiciones</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras purus mauris, congue in elit eu, hendrerit interdum mi.
                    <strong>Praesent lectus nibh, feugiat blandit justo fringilla, luctus semper odio.</strong>
                </p>
                <div className="flex items-center mb-4">
                    <input type="checkbox" id="accept" className="mr-2" />
                    <label htmlFor="accept" className="text-sm text-gray-700">I accept the terms</label>
                </div>
                <p className="text-xs text-blue-600 mb-4 cursor-pointer">Read our T&Cs</p>

                <div className="flex space-x-2">
                    <button className="bg-red-500 text-white py-2 px-4 rounded-md w-1/2 hover:bg-red-600">
                        Enviar
                    </button>
                    <button className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md w-1/2 hover:bg-gray-400"
                        onClick={() => setAlertaFinal(false)}>
                        Cancelar
                    </button>
                </div>
            </div>
            }
         { error != '' &&  <div className="absolute top-1/2 right-1/3 transform -translate-x-1/3 -translate-y-1/4 bg-red-100 p-4 rounded-md shadow-md w-96">
                <h2 className="text-lg font-bold text-red-600 mb-2">Error</h2>
                <p className="text-sm text-red-700 mb-4">{error}</p>
                <div className="flex justify-end space-x-2">
                    <button 
                        className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                        onClick={() => setError('')}
                        >
                        Cerrar
                    </button>
                </div>
            </div>}
            <div className="py-5 border-t bg-white w-full" style={{ opacity: 0.66 }}>
                <But_aside />
            </div>
        </main>
    )
}
export default Adultos;