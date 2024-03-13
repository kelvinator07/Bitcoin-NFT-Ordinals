"use client"; // This is a client component

const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        let reader = new FileReader();
        // Convert the file to base64 text
        reader.readAsDataURL(file);
        reader.onload = () => {
            const baseURL = reader.result as string;
            resolve(baseURL);
        };
    });
};

const isValidTaprootAddress = (address: string): boolean => {
    // Regular expression for Taproot addresses (testnet)
    const taprootAddressRegex: RegExp = /^(tb)(0([a-zA-HJ-NP-Z0-9]{39}|[a-zA-HJ-NP-Z0-9]{59})|1[a-zA-HJ-NP-Z0-9]{8,89})$/;
    return taprootAddressRegex.test(address);
};

const getFromLocalStorage = (value: string): string | null => {
    const item = localStorage.getItem(value);
    return item;
}

const addToLocalStorage = (name: string, value: string): void => {
    localStorage.setItem(name, value);
}

const removeFromLocalStorage = (value: string): void => {
    localStorage.removeItem(value);
}

export { getBase64, isValidTaprootAddress, getFromLocalStorage, addToLocalStorage, removeFromLocalStorage };
