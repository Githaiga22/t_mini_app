'use client';

import React from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base, baseSepolia } from 'wagmi/chains';

const chain = import.meta.env.VITE_CHAIN === 'baseSepolia' ? baseSepolia : base;

export function Providers(props) {
    return (
        <OnchainKitProvider
            apiKey={import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY}
            chain={chain}
        >
            {props.children}
        </OnchainKitProvider>
    );
}