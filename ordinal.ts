import { Inscription, InscriptionEnv } from "ordinalsbot";

// if no parameter given, default environment is 'live'
let inscription = new Inscription(
    process.env.API_KEY || "",
    process.env.NEXT_PUBLIC_API_ENV as InscriptionEnv
);

const ORDER_FEE = 11;

const inscribeImage = async (base64Image: string, image: File, receiveAddress: string): Promise<any> => {
    const imageOrder = {
        files: [
            {
                size: image.size,
                type: image.type,
                name: image.name,
                dataURL: base64Image,
            },
        ],
        lowPostage: true,
        receiveAddress,
        fee: ORDER_FEE,
    };

    try {
        const order = await inscription.createOrder(imageOrder);
        return order;
    } catch (error: any) {
        console.log("Exception: ", error);
        return error.message;
    }
}

const inscribeText = async (text: string, receiveAddress: string): Promise<any> => {
    const textOrder = {
        texts: [text],
        lowPostage: true,
        receiveAddress,
        fee: ORDER_FEE,
    };

    try {
        const response = await inscription.createTextOrder(textOrder);
        return response;
    } catch (error: any) {
        console.error(`${error.status} | ${error.message}`);
        return error.message;
    }
};

const getInscriptionStatus = async (inscriptionId: string): Promise<any> => {
    try {
        const response = await inscription.getOrder(inscriptionId);
        return response;
    } catch (error: any) {
        console.error(`${error.status} | ${error.message}`);
        return error.message;
    }
};

const getInventory = async (): Promise<any> => {
    try {
        const response = await inscription.getInventory();
        return response;
    } catch (error: any) {
        console.error(`${error.status} | ${error.message}`);
        return error.message;
    }
};

export { inscribeImage, inscribeText, getInscriptionStatus, getInventory };
