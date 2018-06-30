/**
 * An implementation of the k-means clustering algorithm for n-dimensional Euclidean vectors.
 *
 * @param {Object[]} points - An array of data points, e.g. [[1, 2], [5, -5]].
 * @param {number} numClusters - The number of clusters we are trying to look for.
 * @param {number} numIterations - The maximum number of iterations. If undefined, then we will iterate until convergence.
 * @returns {Object} - The centroids and partitioning (as attributes of the returned object).
 */
var kmeans = function(points, numClusters, numIterations) {
    /** Computes the squared Euclidean distance between the points a and b. */
    function calculateDistanceSquared(a, b) {
        var sum = 0;
        for (var i = 0; i < a.length; i++) {
            var diff = a[i] - b[i];
            sum += diff * diff;
        }
        return sum;
    }

    /** Returns the index of the centroid that is closest to the given point. */
    function findIndexOfClosestCentroid(point, centroids) {
        var closestIndex = -1;
        var shortestDistance = Number.POSITIVE_INFINITY;
        for (var i = 0; i < centroids.length; i++) {
            var distance = calculateDistanceSquared(point, centroids[i]);
            if (distance < shortestDistance) {
                closestIndex = i;
                shortestDistance = distance;
            }
        }
        return closestIndex;
    }

    /** Calculates the partitioning of the given points. */
    function localRepartition(points, centroids) {
        partitioning = [];
        for (var i = 0; i < points.length; i++) {
            partitioning[i] = findIndexOfClosestCentroid(points[i], centroids);
        }
        return partitioning;
    }

    /** Calculates the average of the given points. */
    function average(points) {
        var means = [];
        for (var i = 0; i < points.length; i++) {
            // Calculate the mean for each attribute in the vector
            for (var j = 0; j < points[i].length; j++) {
                means[j] = (means[j] || 0) + points[i][j] / points.length;
            }
        }
        return means;
    }

    /** Calculates the total squared error (TSE). */
    function calculateTotalSquaredError(points, centroids, partitioning) {
        var totalSquaredError = 0;
        for (var i = 0; i < points.length; i++) {
            totalSquaredError += calculateDistanceSquared(points[i], centroids[partitioning[i]]);
        }
        return totalSquaredError;
    }

    /** Calculates the mean squared error (MSE). */
    function calculateMeanSquaredError(points, centroids, partitioning) {
        var numPoints = points.length;
        var numDimensions = points[0].length; // Assume all points have the same dimensions
        var totalSquaredError = calculateTotalSquaredError(points, centroids, partitioning);
        return totalSquaredError / (numPoints * numDimensions);
    }

    /** Selects n random elements from the given array. */
    function randomSample(array, count) {
        var shuffled = array.slice(0);
        var i = array.length;
        var min = i - count;
        while (i-- > min) {
            var index = Math.floor((i + 1) * Math.random());
            var tmp = shuffled[index];
            shuffled[index] = shuffled[i];
            shuffled[i] = tmp;
        }
        return shuffled.slice(min);
    }

    var centroids = randomSample(points, numClusters);
    var previousError = null;

    while (numIterations > 0) {
        var partitioning = localRepartition(points, centroids);
        var mse = calculateMeanSquaredError(points, centroids, partitioning);
        console.debug("MSE:", mse);
        if (mse === previousError) {
            break; // Converged
        }
        previousError = mse;
        for (var j = 0; j < numClusters; j++) {
            centroids[j] = average(points.filter(function(elem, index) {
                return partitioning[index] === j;
            }));
        }
        --numIterations;
    }

    return {
        centroids: centroids,
        partitioning: partitioning
    }
};
