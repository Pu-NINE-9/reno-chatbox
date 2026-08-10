import { successAPI, failAPI } from '~~/server/utils/response'

const config = useRuntimeConfig()

export const MODEL_NAME_LIST = [
  config.ai.doubaoSeedLite,
  config.ai.doubaoSeedMini,
  config.ai.glm52,
  config.ai.kimiK27Code,
  config.ai.deepseekV4Pro,
  config.ai.minimaxM3,
  config.ai.dobaoSeedEvolving,
  config.ai.kimiK3,
  config.ai.dobaoSeed21Turbo,
  config.ai.deepseekV4Flash,
]

export default defineEventHandler(async (event) => {
  try {
    return successAPI({ modelNames: MODEL_NAME_LIST })
  } catch (error) {
    return failAPI((error as Error).message)
  }
})
