/*
  _____ ___  _   ___        __    _ _      _
 |_   _/ _ \| \ | \ \      / /_ _| | | ___| |_
   | || | | |  \| |\ \ /\ / / _` | | |/ _ \ __|
   | || |_| | |\  | \ V  V / (_| | | |  __/ |_
   |_| \___/|_| \_|  \_/\_/ \__,_|_|_|\___|\__|

 */
/**
 * @name FreeTON browser wallet and injector
 * @copyright SVOI.dev Labs - https://svoi.dev
 * @license Apache-2.0
 * @version 1.0
 */

const EMPTY_ADDRESS = "0:0000000000000000000000000000000000000000000000000000000000000000";

import fetch from 'node-fetch';

/**
 * DeNs domain resolver for freeton.domains
 */
class DeNsResolver {
    constructor(testnet = false) {
        this.testnet = testnet;
    }

    async _fetchJSON(url) {
        return await ((await fetch(url))).json();
    }

    /**
     * Internal domain request
     * @param {string} domain
     * @returns {Promise<*>}
     * @private
     */
    async _requestDomain(domain) {
        return await this._fetchJSON(`https://freeton.domains/queryPretty?domain=${encodeURIComponent(domain)}&testnet=${this.testnet ? 'true' : 'false'}`);

    }

    /**
     * Resolve domain endpoint address
     * @param {string} domain
     * @returns {Promise<string>}
     */
    async resolveAddress(domain) {
        let data = await this._requestDomain(domain);

        if(!data.whois.endpointAddress) {
            throw new Error('Domain not found');
        }

        if(data.whois.endpointAddress === '-') {
            throw new Error('Domain endpoint not specified');
        }

        return data.whois.endpointAddress;
    }

    async resolveNSData(domain){
        let data = await this._requestDomain(domain);

        if(data.result !== 'OK'){
            throw new Error('Domain not found');
        }

        return data.whois;
    }

}

export default DeNsResolver;