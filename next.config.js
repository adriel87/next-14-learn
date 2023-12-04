// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental:{
        typedRoutes: true,
    },

    // interesante saberlo
    typescript:{
         // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        // ignoreBuildErrors: true,
    }
};

module.exports = nextConfig;
