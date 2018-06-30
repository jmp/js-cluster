/**
 * An implementation of the random swap clustering algorithm.
 */
var randomSwap = function(points, iterations) {
    centroids = selectRandomRepresentatives(points);
    partition = optimalPartition(points, centroids);
    while (iterations-- > 0) {
        
    }
};
