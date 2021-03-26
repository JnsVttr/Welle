import app from './app';
import http from 'http';
import express from 'express';

export default class System {

  constructor() {
    this.port = 3000;
    let app = express();
    this.app = app;
  }

  /**
   * Start running server on port from environment and store in Express.
   */
  start() {
    this.server = http.createServer(this.app);

    // TODO thise routes requistry has to go in a different file
    let router = express.Router();
    router.get('/', function(req, res, next) {
      res.json({
        vesion: '0.0.0'
      });
    });
    this.app.use('/', router);

    this.server.listen(this.port);
    return Promise.resolve(this);
  }
}