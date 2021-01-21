const envVars = {
  dev: 'DEV',
  stage: 'STAGE',
  prod: 'PROD'
};

const getWebUrl = (env) => {
  if (env === envVars.dev) {
    return process.env.WEB_APP_URL_DEV;
  }

  if (env === envVars.stage) {
    return process.env.WEB_APP_URL_STAGE;
  }

  if (env === envVars.prod) {
    return process.env.WEB_APP_URL_PROD;
  }
};

const getDbPath = (env) => {
  if (env === envVars.dev) {
    return process.env.DB_PATH_DEV;
  }

  if (env === envVars.stage) {
    return process.env.DB_PATH_STAGE;
  }

  if (env === envVars.prod) {
    return process.env.DB_PATH_PROD;
  }
};

module.exports = { envVars, getWebUrl, getDbPath };
