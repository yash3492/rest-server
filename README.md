# rest-server
---
### Requirements
+ Node.js v22 or higher

#### Usage
+ Install package `npm install @yash3492/rest-server`
+ Create an `.env` file with configs. (_list below_)
+ Require `const {loadConfig, RestServer} = require('@yash3492/rest-server');`
+ Creating instance

```javascript
// Load configs or create custom object
const config = loadConfig();

// Create a server instance
const server = new RestServer(config);

//  Load all middle-wares required for rest API development
server.pre();

// router group
let router = server.router();

// bind some routes
router.get('/two', (req, res) => {
    res.send({
        now: (Date.now()),
        two: true
    })
});
// binding any router
// or middleware
server.use(router);

// bind 404, exception handling, terminating middle-ware and start listening.
server.post().terminating().listen();
```

---

#### Supported config variables
* `BODY_SIZE_LIMIT`, _Default: '100kb'_
* `DEFAULT_ERROR_MESSAGE`, _Default: 'Internal Server Error'_
* `logger`, _Default: console_
* `ingestException`, `Default: () => {}` 
* `PORT`, _Default: 4000_

#### Silent features
+ Correlation id logging on exception.
+ Helmet initialized by default.
+ Compression & JSON Body parsing.
+ CORS enabled.
+ Support for overriding logger.
+ Support for injecting Custom Exception handler.