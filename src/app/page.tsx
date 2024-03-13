"use client"; // This is a client component

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AddressPurpose, BitcoinNetworkType, getAddress, getCapabilities } from 'sats-connect';
import type { Capability } from "sats-connect";

import { getFromLocalStorage } from "../../utils";
import { useLocalStorage } from "../../useLocalStorage";

export default function Home() {
  const [walletInstalled, setWalletInstalled] = useState<boolean>(true);
  const [paymentAddress, setPaymentAddress] = useLocalStorage("paymentAddress");
  const [paymentPublicKey, setPaymentPublicKey] = useLocalStorage("paymentPublicKey");
  const [ordinalsAddress, setOrdinalsAddress] = useState<string | null>();
  const [ordinalsPublicKey, setOrdinalsPublicKey] = useLocalStorage("ordinalsPublicKey");
  const [network, setNetwork] = useLocalStorage<BitcoinNetworkType>("network", BitcoinNetworkType.Testnet);
  const [inscriptionId, setInscriptionId] = useLocalStorage("inscriptionId");

  const [capabilityState, setCapabilityState] = useState<"loading" | "loaded" | "missing" | "cancelled">("loading");
  const [capabilities, setCapabilities] = useState<Set<Capability>>();

  useEffect(() => {
    // check if wallet is installed
    // setWalletInstalled(false);
    const ordinalsAddress = getFromLocalStorage("ordinalsAddress");
    setOrdinalsAddress(ordinalsAddress);
  }, []);

  const onWalletConnect = async () => {
    setInscriptionId(undefined);

    try {
      await getAddress({
        payload: {
          purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment, AddressPurpose.Stacks],
          message: 'Address for receiving Ordinals and payments',
          network: {
            type: BitcoinNetworkType.Testnet
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

  if (!walletInstalled) {
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
            <a href="https://chromewebstore.google.com/detail/xverse-wallet/idnnbdplmphpflfnlkomgpfbpcgelopg" target="_blank">
              <button className="btn btn-primary btn-lg" >
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
          {ordinalsAddress ? (
            <Link href="/mint" className="hover:underline">
              <button className="btn btn-primary btn-lg" type="button">
                Mint Your Ordinal NFT
              </button>
            </Link>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={onWalletConnect}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
