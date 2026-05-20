README — Auth summary 


- 'v1/modules/auth/model/auth.model.js': Mongoose schema for users (fields, indexes); password hashing in 'pre('save')'.

- 'v1/modules/auth/service/auth.service.js': Business logic for 'register' and 'login'; creates users, auto-generates 'tenantId' when omitted, and calls the JWT generator.

- 'v1/modules/auth/controller/auth.controller.js': Express request handlers that call the service and return JSON responses.

- 'v1/modules/auth/route/index.js': Express 'Router' that exposes '/register' and '/login' and is mounted by the central 'route.js' loader.

- 'v1/utils/jwt.js' (and 'v1/utils'): JWT utilities — sign tokens using 'JWT_SECRET' and 'JWT_EXPIRES_IN' from env.

