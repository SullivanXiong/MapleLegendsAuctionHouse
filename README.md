# MapleLegendsAuctionHouse

MapleLegends is a private server that brings back the old-school MapleStory experience, offering a nostalgic version of the game that replicates the classic feel from its early days. The early versions of MapleStory lacked an auction house with which would allow users to effectively search for items, so this implementation solves that problem.

MLp2pRTfmA (MapleLegends Peer-to-Peer Real Time Free Market Aggregator), a p2p application that when running on a user's device will capture ML (MapleLegends) market data and share this data within their Mesh Network. Assuming all Mesh Networks are connected, and the majority of ML players eventually download and run MLp2pRTfmA, there's an ideal world where this platform essentially becomes auction house application aggregated with real time FM, SMega, and Owl Search data. MLp2pRTfmA will also store historical purchases that were captured in FM Shops, SMega c/o's and a/w's to create a realtime running graph of the latest p/c for a particular item.

## Tech Stack

### Front-end

- Next.js (React.js)
- Electron (JavaScript)
- HTML+CSS

### Back-end

- node.js
- PostGreSQL
- WebRTC

## FAQ

Q: How will we capture market data? </br>
A: Image recognition technology such as OCR (Optical Chracter Recognition) will allow us to extract and transform what you see on your maplelegends screen into "Market Data".

Q: Why p2p? </br>
A: Because I needed an excuse to work on my first p2p project, and I didn't want to pay for servers and databases to store data.

Q: Is p2p a viable option? </br>
A: p2p is viable. We can standardize protocols and implement into the application safety by design with blacklists, reliability trust scores, and a contact list of trusted users to also verify real data.

## Setup

/electron-src/.env

### Env

ENV="DEV"
ELECTRON_PORT=
REACT_PORT=
