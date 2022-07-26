// const whitelist = new Set([
//     'http://localhost:3000',
//     'https://localhost:3000',
//     'https://nftads.info'
// ])
// const corsOptions = (req, callback) => {
//     let corsOptions = {};
//     const origin = req.header('Origin');
//     if (whitelist.has(origin)) {
//         console.log('in whitelist', origin);
//         corsOptions = {
//             origin: true,
//             credentials: true,
//             methods: true
//         }
//     } else {
//         corsOptions = { origin: false }
//     }
//     callback(corsOptions)
// }

const corsOptions = {
  origin: true,
  credentials: true,
  methods: true
};
module.exports = corsOptions;
