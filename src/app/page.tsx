"use client"; // This is a client component

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AddressPurpose, BitcoinNetworkType, getAddress, getCapabilities } from 'sats-connect';
import type { Capability } from "sats-connect";

import { getFromLocalStorage, addToLocalStorage } from "../../utils";
import { useLocalStorage } from "../../useLocalStorage";

export default function Home() {
  const [walletInstalled, setWalletInstalled] = useState<boolean>(true);
  const [paymentAddress, setPaymentAddress] = useLocalStorage("paymentAddress");
  const [paymentPublicKey, setPaymentPublicKey] = useLocalStorage("paymentPublicKey");
  const [ordinalsAddress, setOrdinalsAddress] = useState<string | null>();
  const [ordinalsPublicKey, setOrdinalsPublicKey] = useLocalStorage("ordinalsPublicKey");
  const [network, setNetwork] = useState<BitcoinNetworkType>(BitcoinNetworkType.Testnet);
  const [inscriptionId, setInscriptionId] = useLocalStorage("inscriptionId");

  const [capabilityState, setCapabilityState] = useState<"loading" | "loaded" | "missing" | "cancelled">("loading");
  const [capabilities, setCapabilities] = useState<Set<Capability>>();

  useEffect(() => {
    // check if wallet is installed
    // setWalletInstalled(false);
    const ordinalsAddress = getFromLocalStorage("ordinalsAddress");
    setOrdinalsAddress(ordinalsAddress);
  }, []);

  useEffect(() => {
    const runCapabilityCheck = async () => {
      let runs = 0;
      const MAX_RUNS = 20;
      setCapabilityState("loading");

      // the wallet's in-page script may not be loaded yet, so we'll try a few times
      while (runs < MAX_RUNS) {
        try {
          await getCapabilities({
            onFinish(response) {
              setCapabilities(new Set(response));
              setCapabilityState("loaded");
            },
            onCancel() {
              setCapabilityState("cancelled");
            },
            payload: {
              network: {
                type: network,
              },
            },
          });
        } catch (e) {
          runs++;
          if (runs === MAX_RUNS) {
            setCapabilityState("missing");
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    };

    runCapabilityCheck();
  }, [network]);

  const toggleNetwork = () => {
    setNetwork(
      network === BitcoinNetworkType.Testnet
        ? BitcoinNetworkType.Mainnet
        : BitcoinNetworkType.Testnet
    );
  };

  const walletAvailable =
    !!paymentAddress &&
    !!paymentPublicKey &&
    !!ordinalsAddress &&
    !!ordinalsPublicKey;

  const capabilityMessage =
    capabilityState === "loading"
      ? "Checking capabilities..."
      : capabilityState === "cancelled"
      ? "Capability check cancelled by wallet. Please refresh the page and try again."
      : capabilityState === "missing"
      ? "Could not find an installed wallet. Please install a wallet and try again."
      : !capabilities
      ? "Something went wrong with getting capabilities"
      : undefined;

  const onWalletConnect = async () => {
    setInscriptionId(undefined);

    try {
      await getAddress({
        payload: {
          purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment, AddressPurpose.Stacks],
          message: 'Address for receiving Ordinals and payments',
          network: {
            type: network
          },
        },
        onFinish: (response: any) => {
          if (response?.addresses?.length > 1) {
            const paymentAddressItem = response.addresses.find(
              (address: any) => address.purpose === AddressPurpose.Payment
            );
            setPaymentAddress(paymentAddressItem?.address);
            setPaymentPublicKey(paymentAddressItem?.publicKey);
    
            const ordinalsAddressItem = response.addresses.find(
              (address: any) => address.purpose === AddressPurpose.Ordinals
            );
            addToLocalStorage("ordinalsAddress", ordinalsAddressItem?.address);
            setOrdinalsAddress(ordinalsAddressItem?.address);
            setOrdinalsPublicKey(ordinalsAddressItem?.publicKey);

            setWalletInstalled(true);

            window.location.reload();
          } else {
            alert("Something went wrong, try again later");
          }
        },
        onCancel: () => alert('Request canceled'),
      });
    } catch(error: any) {
      console.error("error ", error.message);
      alert(error.message);
    }
  }

  if (capabilityMessage) {
    return (
      <main>
        <div className="p-5 mb-4 bg-body-tertiary rounded-3 text-center">
          <div className="container-fluid py-5">
            <h1 className="display-5 fw-bold">
              Bitcoin Ordinals: The NFTs of Bitcoin
            </h1>
            <p className="fs-4">
              Bitcoin ordinals are a method of inscribing unique,
              non-fungible tokens (NFTs) directly onto individual
              satoshis, the smallest unit of Bitcoin, creating
              distinct digital assets within the Bitcoin blockchain.
              Explore digital art, collectibles, and master crypto&apos;s
              hottest trend - Bitcoin&apos;s BRC-20 tokens.
            </p>
            <div>{capabilityMessage}</div>
            <a href="https://chromewebstore.google.com/detail/xverse-wallet/idnnbdplmphpflfnlkomgpfbpcgelopg" target="_blank">
              <button className="btn btn-primary btn-lg my-3" >
                  Install Xverse Wallet
              </button>
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="p-5 mb-4 bg-body-tertiary rounded-3 text-center">
        <div className="container-fluid py-5">
          <h1 className="display-5 fw-bold">
            Bitcoin Ordinals: The NFTs of Bitcoin
          </h1>
          <p className="fs-4">
            Bitcoin ordinals are a method of inscribing unique,
            non-fungible tokens (NFTs) directly onto individual
            satoshis, the smallest unit of Bitcoin, creating
            distinct digital assets within the Bitcoin blockchain.
            Explore digital art, collectibles, and master crypto&apos;s
            hottest trend - Bitcoin&apos;s BRC-20 tokens.
          </p>
          
          {walletAvailable ? (
            <Link href="/mint" className="hover:underline">
              <button className="btn btn-primary btn-lg" type="button">
                Mint Your Ordinal NFT
              </button>
            </Link>
          ) : (
            <div>
              <div className="form-check form-switch d-flex justify-content-center my-3">
                <input className="form-check-input" 
                          type="checkbox" 
                          role="switch" 
                          name="network"
                          value={network}
                          onChange={toggleNetwork}/> 
                <span className="fs-6 px-3">Network - {network}</span>
              </div>
              <button className="btn btn-primary btn-lg" onClick={onWalletConnect}>
                  Connect Wallet
                </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
