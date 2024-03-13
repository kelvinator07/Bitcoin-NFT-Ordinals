"use client"; // This is a client component

import React, { useState, useEffect } from "react";

import { getInscriptionStatus } from "../../../ordinal";
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

export default function Create() {
    const [successful, setSuccessful] = useState(false);
    const [message, setMessage] = useState("");
    const [inscriptionId, setInscriptionId] = useState("");
    const [ordinal, setOrdinal] = useState("");
    const [loading, setLoading] = useState(false);
    const [ordinalsAddress, setOrdinalsAddress] =
        useLocalStorage("ordinalsAddress");

    useEffect(() => {
        if (!ordinalsAddress) {
            window.location.replace("/");
        }
    }, [ordinalsAddress]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");
        setSuccessful(false);

        if (inscriptionId) {
            getInscriptionStatus(inscriptionId)
                .then((result) => {
                    if (result.status === "ok") {
                        if (result.state === "waiting-confirmation") {
                            setMessage(
                                `Inscription is ${result.state} and will be available at address: ${result.receiveAddress}`
                            );
                            setSuccessful(true);
                            setLoading(false);
                        } else {
                            setMessage(
                                `Inscription is ${result.state} and available at address: ${result.receiveAddress}`
                            );
                            setSuccessful(true);
                            setOrdinal(
                                `https://testnet-explorer.ordinalsbot.com/inscription/${result.files[0].inscriptionId}`
                            );
                            setLoading(false);
                        }
                    } else {
                        setMessage(result.error);
                        setSuccessful(false);
                        setLoading(false);
                        setOrdinal("");
                    }
                })
                .catch((error) => {
                    console.log("error ", error);
                    setMessage("An error occurred, try again");
                    setSuccessful(false);
                    setLoading(false);
                    setOrdinal("");
                });
        }
    };

    return (
        <div className="col-md-12">
            <div className="card card-container">
                <strong>Check status of your Ordinal Inscription</strong>

                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                        <label htmlFor="inscriptionId">Inscription ID</label>
                        <input
                            type="text"
                            className="form-control"
                            name="inscriptionId"
                            value={inscriptionId}
                            onChange={(e) => setInscriptionId(e.target.value)}
                            required
                        />
                        {required(inscriptionId)}
                    </div>

                    {loading ? (
                        <div className="form-group">
                            <button className="btn btn-primary btn-block" disabled>
                                <span className="spinner-border spinner-border-sm"></span>
                                Checking..
                            </button>
                        </div>
                    ) : (
                        <div className="form-group">
                            <button className="btn btn-primary btn-block">
                                Check
                            </button>
                        </div>
                    )}

                    {message && (
                        <div className="form-group mt-3">
                            <div className={successful ? "alert alert-success" : "alert alert-danger"} role="alert">
                                {message}{"\n"}
                                {ordinal && (
                                    <a href={ordinal} rel="noreferrer" target="_blank">View</a>
                                )}
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
