import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://oyagema.com'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/test-upload/',
        '/_next/',
        '/uploads/private/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}