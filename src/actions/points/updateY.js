import {UPDATE_Y} from './../const';

module.exports = function(nodeId, value) {
  return { type: UPDATE_Y, nodeId, propNames: ['y'], value };
};
