import { request } from '@/utils'

export const getDataAPI = () => request.get('/api/tools/famous-sentence')
