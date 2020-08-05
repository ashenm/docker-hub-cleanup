const request = require('superagent');

/**
 * @function deletImage
 * @summary Deletes a Docker Hub image
 * @param {String} repo - the image repository
 * @param {String} tag - the image tag
 * @param {String} token - the Docker Hub JWT
 * @returns {Boolean}
 */
exports.deleteImage = async function (repo, tag, token) {

  const response = await request
    .del(`https://hub.docker.com/v2/repositories/${repo}/tags/${tag}/`)
    .set('Authorization', `JWT ${token}`)
    .ok(exports._noop);

  return response.status >= 200 && response.status <= 300;

};

/**
 * @function getToken
 * @summary Retrieves a Docker Hub JWT
 * @param {String} username - Docker Hub username
 * @param {String} password - Docker Hub password
 * @returns {String}
 */
exports.getToken = async function (username, password) {

  const response = await request
    .post('https://hub.docker.com/v2/users/login/')
    .send({ username: username, password: password })
    .type('application/json')
    .ok(exports._noop);

  return response.body.token;

};

/**
 * @function getTag
 * @summary Retrieves the list of image tags
 * @param {String} repo - the image repository
 * @returns {Array}
 */
exports.getTags = async function (repo) {

  const response = await request
    .get(`https://hub.docker.com/v2/repositories/${repo}/tags`)
    .ok(exports._noop);

  return response.body.results;

};

/**
 * @callback _noop
 * @summary Evaluates to true always
 * @param {Event}
 */
exports._noop = function (e) {
  return true;
};

// vim: set expandtab shiftwidth=2 syntax=javascript:
