import dns from "node:dns/promises";

try {
  const result = await dns.resolveSrv(
    "_mongodb._tcp.nextjs-cluster.8zc4bvf.mongodb.net"
  );
  console.log(result);
} catch (err) {
  console.error(err);
} 
