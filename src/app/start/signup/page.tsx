"use client"
import Image from 'next/image'
import BackgroundLibrary from '../../../../public/Images/BookShell.jpg'
import Logo from '../../../../public/Images/LogoCasaJardin.png'


function Signup() {
    return(


    <div
         style={{
            backgroundImage: `url(${BackgroundLibrary.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: 0,
            padding: 0,
            overflow: 'hidden',
        }}
    >
    <div
        style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)', // Fondo con opacidad aplicada
        zIndex: 1,
        }}
    />

  <div
    style={{
      backgroundColor: 'rgba(28, 171, 235, 1)', // Fondo con opacidad aplicada
      position: 'relative',
      zIndex: 2,
      display: 'flex',
        flexDirection: 'column',
      padding: '100px',
      height: '828px',
      borderRadius: '50px', // Bordes redondeados
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Sombra para dar profundidad
    }}
  >
    <div className="flex flex-col items-center">

        <Image src={Logo} alt="Logo Casa Jardin" width={150} height={150}/>
        
    </div>
<div className="flex flex-col items-center font-medium" style={{marginBottom: '20px', marginTop: '10px'}}>
    <h2>Registrarte</h2>
</div>



    <label className='font-medium' htmlFor="">Nombre</label>
    <input type="text" id='nombre' style={{ padding: '3px', borderRadius: '5px', marginBottom: '20px', width:'400px' }} />

    <label className='font-medium' htmlFor="">Apellido</label>
    <input type="text" style={{ padding: '3px', borderRadius: '5px', marginBottom: '20px', }}/>

    <label className='font-medium' htmlFor="">Email</label>
    <input type="text" style={{ padding: '3px', borderRadius: '5px', marginBottom: '20px', }} />

    <label className='font-medium' htmlFor="">Contraseña</label>
    <input type="password" style={{ padding: '3px', borderRadius: '5px', marginBottom: '20px', }}/>

    <label className='font-medium' htmlFor="">Confirmar Contraseña</label>
    <input type="password" style={{ padding: '3px', borderRadius: '5px', marginBottom: '20px', }} />


<button className='font-medium'
style={{
        padding: '10px 20px',
        backgroundColor: '#ff4d4d',
        color: '#fff',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',


      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e60000')}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ff4d4d')}
    >
    Registrarse
</button>

<div className="flex items-center justify-center">
    <span className='font-medium'>Tienes cuenta?</span>
    <a href="/start/login" className=" font-bold text lg text-black ml-2">Iniciar Sesión</a>

</div>
    </div>
</div>

        
    )
}
export default Signup;