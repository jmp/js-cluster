/**
 * Calculate the convex hull of the given points.
 * Implements the monotone chain convex hull algorithm.
 */
var convexHull = function(points) {
    function cross(o, a, b) {
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    }
    var lower = [];
    var upper = [];
    points.sort(function(a, b) {
        return a[0] === b[0] ? a[1] - b[1] : a[0] - b[0];
    });
    for (var i = 0; i < points.length; i++) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], points[i]) <= 0) {
            lower.pop();
        }
        lower.push(points[i]);
    }
    for (var i = points.length - 1; i >= 0; i--) {
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], points[i]) <= 0) {
            upper.pop();
        }
        upper.push(points[i]);
    }

    upper.pop();
    lower.pop();

    return lower.concat(upper);
};
