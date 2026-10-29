import { createRequestHandler } from 'react-router'

import { logRequest, trimTrailingSlash } from './http'

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
)

export default {
  fetch(request, env) {
    const handle = () => trimTrailingSlash(request) ?? requestHandler(request)

    if (import.meta.env.DEV) {
      return logRequest(request, handle, !('NO_COLOR' in env))
    }

    return handle()
  },
} satisfies ExportedHandler<Env>
