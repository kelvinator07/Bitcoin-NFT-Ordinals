"use client"; // This is a client component

import React from "react";
import { useLocalStorage } from "../../../useLocalStorage";

export default function Create() {
  const [inscriptionId, setInscriptionId] = useLocalStorage("inscriptionId");

  return (
    <main>
      <div className="col-md-12">
            <div className="card card-container">
              <h2>Thank you!</h2>
                <strong>
                    The status of your inscription with id <code>{inscriptionId}</code> will be communicated
                    to you via the email address you provided. If everything
                    goes well, your satoshi will be inscribed and sent to the
                    wallet address you provided.
                </strong>
            </div>
        </div>
    </main>
  );
}
