import DeNsResolver from "./DeNsResolver.mjs";

const TTL = 1;
const MAIN_DNS_SERVERS = ['8.8.8.8'];
const BINDING_HOST = '0.0.0.0';
const BINDING_PORT = 5353;

import named from 'named';
import dns from 'dns';

const {Resolver} = dns.promises;
const resolver = new Resolver();
resolver.setServers(MAIN_DNS_SERVERS);


const server = named.createServer();

server.listen(BINDING_PORT, BINDING_HOST, function () {
    console.log('DNS server started on', `${BINDING_HOST}:${BINDING_PORT}`);
});

server.on('query', async function (query) {
    let domain = query.name();
    const type = query.type();
    console.log('DNS Query: %s', domain)

    let record = null;
    let nsResponse = null;
    try {

        //It's FreeTON domain
        if(domain.toLowerCase().includes('.freeton')) {
            try {

                let freetonDomain = domain.toLowerCase().replace('.freeton', '').replace(/\./gm,'/');
                const freetonResolver = new DeNsResolver();
                let response = await freetonResolver.resolveNSData(freetonDomain);
                //console.log('FREETON RESPONSE', response);
                let DNSData = JSON.parse(response.comment);

                switch (type) {
                    case 'A':
                        record = new named.ARecord(DNSData['A']);
                        query.addAnswer(domain, record, TTL);
                        break;
                    case 'AAAA':
                        record = new named.AAAARecord(DNSData['AAAA']);
                        query.addAnswer(domain, record, TTL);
                        break;
                    case 'TXT':
                        record = new named.AAAARecord(DNSData['TXT']);
                        query.addAnswer(domain, record, TTL);
                        break;
                }


            } catch (e) {

            }
        } else {
            switch (type) {
                case 'A':
                    nsResponse = await resolver.resolve4(domain);
                    record = new named.ARecord(nsResponse[0]);
                    query.addAnswer(domain, record, TTL);
                    break;
                case 'AAAA':
                    nsResponse = await resolver.resolve6(domain);
                    record = new named.AAAARecord(nsResponse[0]);
                    query.addAnswer(domain, record, TTL);
                    break;
                case 'CNAME':
                    nsResponse = await resolver.resolveCname(domain);
                    record = new named.CNAMERecord(nsResponse[0]);
                    query.addAnswer(domain, record, TTL);
                    break;
                case 'MX':
                    /*record = new named.MXRecord('smtp.example.com');
                    query.addAnswer(domain, record, TTL);*/
                    throw new Error('Not supported');
                    break;
                case 'SOA':
                    /*record = new named.SOARecord('example.com');
                    query.addAnswer(domain, record, TTL);*/
                    throw new Error('Not supported');
                    break;
                case 'SRV':
                    /*record = new named.SRVRecord('sip.example.com', 5060);
                    query.addAnswer(domain, record, TTL);*/
                    throw new Error('Not supported');
                    break;
                case 'TXT':
                    nsResponse = await resolver.resolveTxt(domain);
                    record = new named.TXTRecord(nsResponse[0][0]);
                    query.addAnswer(domain, record, TTL);
                    break;
            }
        }
        // console.log(record);
        server.send(query);
    } catch (e) {
        console.log('Query for', domain, 'rejected');
        server.send(query);
    }
});

/*let soaRecord = new named.SOARecord('example.com', {serial: 201205150000});
console.log(soaRecord);*/
