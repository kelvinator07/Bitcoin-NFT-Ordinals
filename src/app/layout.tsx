"use client"; // This is a client component

import { Analytics } from "@vercel/analytics/react";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from 'next/navigation'
import { Inter } from "next/font/google";
import 'bootstrap/dist/css/bootstrap.css';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../../logo.png'

import "./globals.css";

import { getFromLocalStorage, removeFromLocalStorage } from "../../utils";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const [ordinalsAddress, setOrdinalsAddress] = useState<string | null>();

    useEffect(() => {
      const ordinalsAddress = getFromLocalStorage("ordinalsAddress");
      setOrdinalsAddress(ordinalsAddress);
    }, []);

    const disconnectWallet = () => {
      removeFromLocalStorage("ordinalsAddress");
      removeFromLocalStorage("ordinalsPublicKey");
      removeFromLocalStorage("paymentAddress");
      removeFromLocalStorage("paymentPublicKey");
      removeFromLocalStorage("inscriptionId");
      // navigate
      router.push("/");
      setTimeout(() => {
          window.location.reload();
      }, 2000)
    }

    if (!ordinalsAddress) {
      return (
        <html lang="en">
          <body className={inter.className}>
                <nav className="navbar navbar-expand-sm bg-dark navbar-dark">
                    <div className="container-fluid">
                      <a className="navbar-brand" href="#">
                        <Image src={logo} alt="Bitcoin Ordinals Logo" width={50} height={0} className="rounded-pill" />
                      </a>

                      <ul className="navbar-nav me-auto">
                          <li className="nav-item">
                            <Link href="/" className="nav-link active px-0">
                                Bitcoin Ordinals
                            </Link>
                          </li>
                      </ul>
                    </div>
                </nav>
            {children}
            </body>
        </html>
      );
    }

  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
            <nav className="navbar navbar-expand-sm bg-dark navbar-dark">
                <div className="container-fluid">
                  <a className="navbar-brand" href="#">
                    <Image src={logo} alt="Bitcoin Ordinals Logo" width={50} height={0} className="rounded-pill" />
                  </a>

                  <ul className="navbar-nav me-auto">
                      <li className="nav-item">
                        <Link href="/" className="nav-link active px-0">
                            Bitcoin Ordinals
                        </Link>
                      </li>
                      <li className="nav-item">
                          <Link href="/mint" className={`link ${pathname === '/mint' ? 'active nav-link' : 'nav-link'}`}>
                              Mint NFT
                          </Link>
                      </li>

                      <li className="nav-item">
                          <Link href="/check" className={`link ${pathname === '/check' ? 'active nav-link' : 'nav-link'}`}>
                              Check Inscription Status
                          </Link>
                      </li>
                  </ul>
                  <form className="d-flex">
                    <button className="btn btn-primary btn-block" onClick={disconnectWallet}>
                        Disconnect Wallet
                    </button>
                  </form>
                </div>
            </nav>
        {children}
        <Analytics />
        </body>
    </html>
  );
}
