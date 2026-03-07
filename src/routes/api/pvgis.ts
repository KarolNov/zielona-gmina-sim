import { createFileRoute } from '@tanstack/react-router'
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createAPIFileRoute('/api/pvgis')({
  GET: async ({ request }) => {
    const url = new URL(request.url)
    
    // Budujemy URL do PVGIS, zachowując parametry query (lat, lon, peakpower itp.)
    const targetUrl = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc${url.search}`

    try {
      const resp = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!resp.ok) {
        return new Response(JSON.stringify({ error: 'PVGIS API Error' }), { status: resp.status })
      }

      const data = await resp.json()


      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600', // Cache for 1h
        },
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Proxy failed' }), { status: 500 })
    }
  },
})