"use client"; // This is a client component

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isEmail } from "validator";
import { sendBtcTransaction, BitcoinNetworkType } from "sats-connect";

import { inscribeText, inscribeImage } from "../../../ordinal";
import {
    getBase64,
    getFromLocalStorage,
    addToLocalStorage,
} from "../../../utils";
import { useLocalStorage } from "../../../useLocalStorage";

interface ValidationResult {
    (value: string): JSX.Element | undefined;
}

const required: ValidationResult = (value: string) => {
    if (!value) {
        return (
            <div className="invalid-feedback d-block">
                This field is required!
            </div>
        );
    }
};

const validEmail: ValidationResult = (value: string) => {
    if (!isEmail(value)) {
        return (
            <div className="invalid-feedback d-block">
                This is not a valid email.
            </div>
        );
    }
};

export default function Mint() {
    const router = useRouter();

    const [successful, setSuccessful] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");

    const [image, setImage] = useState<File | null>(null);
    const [base64Image, setBase64Image] = useState<string | null>(null);

    const [email, setEmail] = useState("");
    const [text, setText] = useState("");
    const [address, setAddress] = useState("");
    const [type, setType] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [ordinalsAddress, setOrdinalsAddress] = useLocalStorage("ordinalsAddress");
    const [inscriptionId, setInscriptionId] = useLocalStorage("inscriptionId");

    useEffect(() => {
        if (!ordinalsAddress) {
            router.push("/");
        }
    },[ordinalsAddress, router]);

    const onChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const image = e.target.files;
        if (image && image[0] && image[0].size > 1 * 100 * 1024) {
            setErrorMsg("File too large, maximum size of 100kb is allowed");
            return;
        }
        const file = image![0];
        getBase64(file)
            .then((result: string) => {
                setImage(file);
                setBase64Image(result);
                setErrorMsg("");
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const processPayment = async (recipient: string, amount: string) => {
        await sendBtcTransaction({
            payload: {
                network: {
                    type: BitcoinNetworkType.Testnet,
                },
                recipients: [
                    {
                        address: recipient,
                        amountSats: BigInt(amount),
                    },
                ],
                senderAddress: ordinalsAddress!,
            },
            onFinish: (response) => {
                if (response) {
                    onSuccessPayment();
                } else {
                    onFailedPayment();
                }
            },
            onCancel: () => {
                setSuccessful(false);
                setLoading(false);
                setMessage("Payment Canceled");
            },
        });
    };

    const onSuccessPayment = () => {
        setMessage(
            `Payment successful! Your inscription id is ${inscriptionId} and will be available at address: ${address} in 10 mins.`
        );
        setSuccessful(true);
        setLoading(false);
        setTimeout(() => {
            router.push("/success");
        }, 5000);
    };

    const onFailedPayment = () => {
        setMessage(`Payment was not successful! Please try again`);
        setSuccessful(false);
        setLoading(false);
    };

    const callInscribeText = () => {
        inscribeText(text, address)
            .then((result) => {
                if (result.status === "ok") {
                    setInscriptionId(result.id);
                    processPayment(
                        result?.charge?.address,
                        result?.charge?.amount
                    );
                } else {
                    console.log("error ", result);
                    setMessage("Error occurred, please try again in 5 mins");
                    setSuccessful(false);
                    setLoading(false);
                }
            })
            .catch((error) => {
                console.log("error ", error);
                setMessage("Error occurred, try again");
                setSuccessful(false);
                setLoading(false);
            });
    };

    const callInscribeImage = () => {
        inscribeImage(base64Image!, image!, address)
            .then((result) => {
                if (result.status === "ok") {
                    setInscriptionId(result.id);
                    processPayment(
                        result?.charge?.address,
                        result?.charge?.amount
                    );
                } else {
                    console.log("error ", result);
                    setMessage("An error occurred, please try again in 5 mins");
                    setSuccessful(false);
                    setLoading(false);
                }
            })
            .catch((error) => {
                console.log("error ", error);
                setMessage("An error occurred, please try again in 5 mins");
                setSuccessful(false);
                setLoading(false);
            });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");
        setSuccessful(false);

        console.log("Form ", type, text, image, ordinalsAddress, email);

        // setTimeout(() => {
        //     type === "text" ? callInscribeText() : callInscribeImage();
        // }, 10000);
    };

    return (
        <div className="col-md-12">
            <div className="card card-container">
                {!successful && (
                    <div>
                        <strong className="mb-3">
                            Enter your information below to mint your NFT
                        </strong>
                        <form onSubmit={handleSubmit} id="my-form">
                            <div className="form-group">
                                <label htmlFor="type">Inscription Type</label>
                                <select
                                    className="form-select"
                                    name="type"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    required
                                >
                                    <option value="">
                                        Choose the data type to inscribe
                                    </option>
                                    <option value="text">Text</option>
                                    <option value="image">Image</option>
                                </select>
                            </div>

                            {type === "text" && (
                                <div className="form-group">
                                    <label htmlFor="text">Text</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="text"
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            {type === "image" && (
                                <div className="form-group">
                                    <label htmlFor="text">Image</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept="image/jpg,image/jpeg,image/png,image/webp"
                                        name="image"
                                        onChange={onChangeImage}
                                        required
                                    />
                                    <p className="info-message">
                                        Max size: 100KB
                                    </p>
                                    {errorMsg && (
                                        <div className="invalid-feedback d-block">
                                            {errorMsg}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="ordinalsAddress">
                                    Recipient Bitcoin Address
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="ordinalsAddress"
                                    value={ordinalsAddress}
                                    disabled
                                    required
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label htmlFor="email">Email</label>
                                <input
                                    placeholder="ordinals@email.com"
                                    type="text"
                                    className="form-control"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                {validEmail(email)}
                            </div>

                            {loading ? (
                                <div className="form-group">
                                    <button
                                        className="btn btn-primary btn-block"
                                        disabled
                                    >
                                        <span className="spinner-border spinner-border-sm"></span>
                                        Inscribing..
                                    </button>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <button className="btn btn-primary btn-block">
                                        Submit
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                )}
                {message && (
                    <div className="form-group mt-3">
                        <div
                            className={
                                successful
                                    ? "alert alert-success"
                                    : "alert alert-danger"
                            }
                            role="alert"
                        >
                            <strong>{message}</strong>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
