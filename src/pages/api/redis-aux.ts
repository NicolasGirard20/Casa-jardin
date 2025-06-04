import type { NextApiRequest, NextApiResponse } from 'next'
import { guardarAux } from '@/services/redis'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.query.secret !== process.env.REDIS_AUX_SECRET) {
        console.log(req.query.secret, process.env.REDIS_AUX_SECRET)
        return res.status(403).json({ error: 'Unauthorized' })
    }
    //guarda un código random entre 1 y 1000 en Redis con la clave "aux"
    await guardarAux("aux", new Date().toISOString())
    res.status(200).json({ ok: true })
  } catch{
    res.status(500).json({ error: 'Redis ping failed' })
  }
}