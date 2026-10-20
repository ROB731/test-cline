import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Les photos produits sont stockées dans /public/uploads en développement.
  // En production, brancher un stockage objet (Cloudinary, S3, R2).
};

export default nextConfig;
