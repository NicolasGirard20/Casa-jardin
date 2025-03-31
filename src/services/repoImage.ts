'use server'

export const getImagesUser = async () => {
    // Define the URL for the admin API endpoint
    const url = String(process.env.GITHUB_API_ADMIN_URL);
    
    try {
        // Make a GET request to the admin API endpoint
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        // Parse the response JSON data
        const data = await response.json();

        // Check if data contains a directory and access its files
        const file = data.find((file: any) => (file.type === 'dir' && file.name === 'profesionales_img'));
        const filesUrl = file._links.self;

        // Make a GET request to fetch the files in the directory
        const filesResponse = await fetch(filesUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        // Parse the response JSON data for the files
        const fileData = await filesResponse.json();
       // console.log("FILEEEEE", fileData);
       
        // Filter the files and get their download URLs
        const downloadurls = fileData.map((file: any) => file.download_url);

        const cursosName = fileData.map((file: any) => file.name);

        // Return the download URLs as images
        return { images: cursosName, downloadurls: downloadurls };
    } catch (error) {
        // Return an error message if the fetch operation fails
        return { error: 'Failed to fetch data' };
    }
};
 // Función para obtener el SHA del archivo (sirve para caso de imagenes con el mismo nombre)
 const getFileSha = async (url: string) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch file SHA');
      }

      const data = await response.json();
      return data.sha;
    } catch (error) {
      console.error('Error fetching file SHA:', error);
      return null;
    }
};

export const getImages_talleresAdmin = async () => {
    // Define the URL for the admin API endpoint
    const url = String(process.env.GITHUB_API_ADMIN_URL);
    
    try {
        // Make a GET request to the admin API endpoint
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        // Parse the response JSON data
        const data = await response.json();

        // Check if data contains a directory and access its files
        const file = data.find((file: any) => (file.type === 'dir' && file.name === 'talleres_img'));
        const filesUrl = file._links.self;

        // Make a GET request to fetch the files in the directory
        const filesResponse = await fetch(filesUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        // Parse the response JSON data for the files
        const fileData = await filesResponse.json();
       // console.log("FILEEEEE", fileData);
       
        // Filter the files and get their download URLs
        const downloadurls = fileData.map((file: any) => file.download_url);

        const cursosName = fileData.map((file: any) => file.name);

        // Return the download URLs as images
        return { images: cursosName, downloadurls: downloadurls };
    } catch (error) {
        // Return an error message if the fetch operation fails
        return { error: 'Failed to fetch data' };
    }
};
export const get_rotatingImages = async () => {
    // Define the URL for the admin API endpoint
    const url = String(process.env.GITHUB_API_ADMIN_URL);
    
    try {
        // Make a GET request to the admin API endpoint
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        // Parse the response JSON data
        const data = await response.json();

        // Check if data contains a directory and access its files
        const file = data.find((file: any) => (file.type === 'dir' && file.name === 'RotatingImage'));
        const filesUrl = file._links.self;

        // Make a GET request to fetch the files in the directory
        const filesResponse = await fetch(filesUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        // Parse the response JSON data for the files
        const fileData = await filesResponse.json();
       // console.log("FILEEEEE", fileData);
       
        // Filter the files and get their download URLs
        const downloadurls = fileData.map((file: any) => file.download_url);

        const cursosName = fileData.map((file: any) => file.name);

        // Return the download URLs as images
        return { images: cursosName, downloadurls: downloadurls };
    } catch (error) {
        // Return an error message if the fetch operation fails
        return { error: 'Failed to fetch data' };
    }
};

export const uploadImageCursos = async (base64File: string, fileName: string) => {
    console.log(fileName)

    const folderPath = 'talleres_img/'; //Definimos la carpeta donde queramos que se guarde la imagen 
    const url = `${process.env.GITHUB_API_ADMIN_URL}${folderPath}${fileName}`; // Especificar el nombre del archivo en la URL

    try {
        const response = await fetch(url, {
            method: 'PUT', // GitHub requiere PUT para subir archivos
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: "Add image", // Mensaje de commit obligatorio
                content: base64File.split(",")[1]  // Remover el prefijo antes de enviar a GitHub
            })
        });

        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        return { error: 'Failed to upload image' };
    }
};

export const deleteImageCursos = async (fileName: string) => {
    const folderPath = 'talleres_img/'; // Definimos la carpeta donde se guarda la imagen
    const url = `${process.env.GITHUB_API_ADMIN_URL}${folderPath}${fileName}`; // Especificar el nombre del archivo en la URL

    try {
      // Obtener el SHA del archivo
      const sha = await getFileSha(url);
      if (!sha) {
        return { error: 'Failed to get file SHA' };
      }

      const response = await fetch(url, {
        method: 'DELETE', // GitHub requiere DELETE para borrar archivos
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: "Delete image", // Mensaje de commit obligatorio
          sha: sha // Incluir el SHA del archivo a eliminar
        })
      });

      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      return { error: 'Failed to delete image' };
    }
};

export const getImages_ProfesionalesAdmin = async () => {
    // Define the URL for the admin API endpoint
    const url = String(process.env.GITHUB_API_ADMIN_URL);
    
    try {
        // Make a GET request to the admin API endpoint
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        // Parse the response JSON data
        const data = await response.json();

        // Check if data contains a directory and access its files
        const file = data.find((file: any) => (file.type === 'dir' && file.name === 'profesionales_img'));
        const filesUrl = file._links.self;

        // Make a GET request to fetch the files in the directory
        const filesResponse = await fetch(filesUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        // Parse the response JSON data for the files
        const fileData = await filesResponse.json();
       // console.log("FILEEEEE", fileData);
       
        // Filter the files and get their download URLs
        const downloadurls = fileData.map((file: any) => file.download_url);

        const cursosName = fileData.map((file: any) => file.name);

        // Return the download URLs as images
        return { images: cursosName, downloadurls: downloadurls };
    } catch (error) {
        // Return an error message if the fetch operation fails
        return { error: 'Failed to fetch data' };
    }
};

export const uploadImageProfesionales = async (base64File: string, fileName: string) => {
    console.log("-------------------------------> inside uploadImageProfesionales... ")

    const folderPath = 'profesionales_img/'; //Definimos la carpeta donde queramos que se guarde la imagen 
    const url = `${process.env.GITHUB_API_ADMIN_URL}${folderPath}${fileName}`; // Especificar el nombre del archivo en la URL

    try {
        const response = await fetch(url, {
            method: 'PUT', // GitHub requiere PUT para subir archivos
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: "Add image", // Mensaje de commit obligatorio
                content: base64File.split(",")[1]  // Remover el prefijo antes de enviar a GitHub
            })
        });

        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        return { error: 'Failed to upload image' };
    }
}

export const deleteImageProfesionales = async (fileName: string) => {
    const folderPath = 'profesionales_img/'; // Definimos la carpeta donde se guarda la imagen
    const url = `${process.env.GITHUB_API_ADMIN_URL}${folderPath}${fileName}`; // Especificar el nombre del archivo en la URL

    try {
      // Obtener el SHA del archivo
      const sha = await getFileSha(url);
      if (!sha) {
        return { error: 'Failed to get file SHA' };
      }

      const response = await fetch(url, {
        method: 'DELETE', // GitHub requiere DELETE para borrar archivos
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: "Delete image", // Mensaje de commit obligatorio
          sha: sha // Incluir el SHA del archivo a eliminar
        })
      });

      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      return { error: 'Failed to delete image' };
    }
}; 

export const getImages_procesoInscrip = async () => {
    // Define the URL for the admin API endpoint
    const url = String(process.env.GITHUB_API_ADMIN_URL);
    
    try {
        // Make a GET request to the admin API endpoint
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        // Parse the response JSON data
        const data = await response.json();

        // Check if data contains a directory and access its files
        const file = data.find((file: any) => (file.type === 'dir' && file.name === 'procesoInscrip_img'));
        const filesUrl = file._links.self;

        // Make a GET request to fetch the files in the directory
        const filesResponse = await fetch(filesUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        // Parse the response JSON data for the files
        const fileData = await filesResponse.json();
       // console.log("FILEEEEE", fileData);
       
        // Filter the files and get their download URLs
        const downloadurls = fileData.map((file: any) => file.download_url);

        const cursosName = fileData.map((file: any) => file.name);

        // Return the download URLs as images
        return { images: cursosName, downloadurls: downloadurls };
    } catch (error) {
        // Return an error message if the fetch operation fails
        return { error: 'Failed to fetch data' };
    }
};