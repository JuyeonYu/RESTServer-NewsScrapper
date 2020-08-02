module.exports = (function () {
    return {
      local: { // localhost
        host: '192.168.219.100',
        port: '3306',
        user: 'johnny',
        password: 'qwas8800',
        database: 'news_scrapper'
      },
      real: { // real server db info
        host: '',
        port: '',
        user: '',
        password: '',
        database: ''
      },
      dev: { // dev server db info
        host: '',
        port: '',
        user: '',
        password: '',
        database: ''
      }
    }
  })();
  