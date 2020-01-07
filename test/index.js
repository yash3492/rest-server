
try{
    let {loadConfig, RestServer} = require('./..');

    const config = {PORT: 5000} || loadConfig();
    const server = new RestServer(config);


    let router = server.router();
    router.get('/two', (req, res) => {
        res.send({
            now: (Date.now()),
            two: true
        })
    });

    server.pre();

    server.use((req, res, next) => {
        console.log('Custom');
        next();
    }, (req, res, next) => {
        console.log('Custom2');
        next();
    }, (req, res, next) => {
        console.log('Custom3');
        next();
    });

    server.use('/prefix', router);

    server.getServer().get('/', (req, res) => {
        res.send({
            now: (new Date())
        });
    });
    server.post().terminating().listen();
}catch(ee){
    console.error(ee)
}
