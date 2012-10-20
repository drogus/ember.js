var escapeForRegex = function(text) {
  return text.replace(/[\-\[\]{}()*+?.,\\\^\$|#\s]/g, "\\$&");
};

/**
  @class _RouteMatcher
  @namespace Ember
  @private
  @extends Ember.Object
*/
Ember._RouteMatcher = Ember.Object.extend({
  state: null,

  init: function() {
    var route = this.route,
        dynamicSegmentPattern = this.dynamicSegmentPattern || "([^/]+)",
        terminators = this.dynamicSegmentTerminators || [],
        identifiers = [],
        count = 1,
        escaped,
        segmentRegexp;

    // Strip off leading slash if present
    if (route.charAt(0) === '/') {
      route = this.route = route.substr(1);
    }

    escaped = escapeForRegex(route);

    terminators.push('$|/');
    str = ':([a-z_]+)(?=' + terminators.join('|') + ')'
    segmentRegexp = new RegExp(str, 'gi');
    var regex = escaped.replace(segmentRegexp, function(match, id) {
      identifiers[count++] = id;
      return dynamicSegmentPattern;
    });

    this.identifiers = identifiers;
    this.regex = new RegExp("^/?" + regex);
  },

  match: function(path) {
    var match = path.match(this.regex);

    if (match) {
      var identifiers = this.identifiers,
          hash = {};

      for (var i=1, l=identifiers.length; i<l; i++) {
        hash[identifiers[i]] = match[i];
      }

      return {
        remaining: path.substr(match[0].length),
        hash: identifiers.length > 0 ? hash : null
      };
    }
  },

  generate: function(hash) {
    var identifiers = this.identifiers, route = this.route, id;
    for (var i=1, l=identifiers.length; i<l; i++) {
      id = identifiers[i];
      route = route.replace(new RegExp(":" + id), hash[id]);
    }
    return route;
  }
});
