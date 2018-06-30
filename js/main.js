(function() {
    // Constants
    var POINT_SIZE = 1;
    var CENTROID_SIZE = 7;
    var SCALING_FACTOR = 1 / 400;

    // Stores the loaded points
    var points = [];

    // For normalizing of points (see further below)
    var normalizedPoints = [];
    var minmax = null;

    // Groups for scene graph
    var pointGroup = null;
    var infoGroup = null;

    /** Adds the given data point to the canvas. */
    function addPoint(point) {
        var circle = new paper.Path.Circle(new paper.Point(point[0], point[1]), POINT_SIZE);
        pointGroup.addChild(circle);
        circle.fillColor = 'black';
    }

    /** Loads data vectors from file. */
    function loadData(file) {
        function parseLine(line) {
            var vector = line.split(/(\s+)/);
            var components = [];
            for (var i = 0; i < vector.length; i++) {
                var value = parseFloat(vector[i], 10);
                if (!isNaN(value)) {
                    components.push(value);
                }
            }
            if (components.length > 1) {
                // Only two-dimensional data is supported
                points.push([components[0], components[1]]);
            }
        }

        /** Clean up any existing points. */
        function resetData() {
            points = [];
            normalizedPoints = [];
            if (pointGroup !== null) {
                pointGroup.removeChildren();
            }
            if (infoGroup !== null) {
                infoGroup.removeChildren();
            }
        }

        /** Read the actual data from file */
        function readData(file) {
            var reader = new FileReader();
            reader.onload = (function(theFile) {
                return function(e) {
                    var lines = e.target.result.split('\n');
                    for (var i = 0; i < lines.length; i++) {
                        parseLine(lines[i]);
                    }
                    minmax = findMinMax(points);
                    normalizedPoints = normalize(points, minmax);
                    for (var i = 0; i < points.length; i++) {
                        addPoint([normalizedPoints[i], normalizedPoints[i]]);
                    }
                };
            })(file);
            reader.readAsText(file);
        }

        resetData();
        readData(file);
    }

    /** Find minimum and maximum for both x and y */
    function findMinMax(points) {
        var minX = Number.POSITIVE_INFINITY;
        var minY = Number.POSITIVE_INFINITY;
        var maxX = Number.NEGATIVE_INFINITY;
        var maxY = Number.NEGATIVE_INFINITY;
        for (var i = 0; i < points.length; i++) {
            minX = Math.min(points[i][0], minX);
            minY = Math.min(points[i][1], minY);
            maxX = Math.max(points[i][0], maxX);
            maxY = Math.max(points[i][1], maxY);
        }
        return {
            minX: minX,
            minY: minY,
            maxX: maxX,
            maxY: maxY
        }
    }

    /**
     * Scales the given points for canvas. Any coordinates should be
     * normalized before drawing, otherwise they will go off the bounds
     * of the canvas. There is probably an easier way to do this with
     * Paper.js views and such, but I haven't bothered to figure it out.
     */
    function normalize(points, minmax) {
        var normalizedPoints = new Array(points.length);
        var inverseScale = 1 / SCALING_FACTOR;
        var diffX = minmax.maxX - minmax.minX;
        var diffY = minmax.maxY - minmax.minY;

        for (var i = 0; i < points.length; i++) {
            normalizedPoints[i] = [
                 ((points[i][0] - minmax.minX) / diffX * inverseScale - inverseScale / 2),
                -((points[i][1] - minmax.minY) / diffY * inverseScale - inverseScale / 2)
            ];
        }

        return normalizedPoints;
    }

    /** Draw the given centroids on the canvas. */
    function drawCentroids(centroids) {
        for (var i = 0; i < centroids.length; i++) {
            var center = new paper.Point(centroids[i][0], centroids[i][1]);
            var circle = new paper.Path.Circle(center, CENTROID_SIZE);
            circle.fillColor = 'red';
            infoGroup.addChild(circle);
        }
    }

    /** Draws convex hulls on the canvas based on the given partitioning. */
    function drawConvexHulls(points, centroids, partitioning) {
        for (var i = 0; i < centroids.length; i++) {
            var centroidPoints = [];
            for (var j = 0; j < points.length; j++) {
                if (partitioning[j] == i) {
                    centroidPoints.push([points[j][0], points[j][1]]);
                }
            }

            var hullPoints = convexHull(centroidPoints);

            var path = new paper.Path();
            path.strokeColor = 'blue';
            for (var j = 0; j < hullPoints.length; j++) {
                path.lineTo(hullPoints[j][0], hullPoints[j][1]);
            }
            // Add segment back to the starting point
            if (hullPoints.length > 0) {
                path.lineTo(hullPoints[0][0], hullPoints[0][1]);
            }
            infoGroup.addChild(path);
        }
    }

    /** Perform clustering. */
    function cluster() {
        $('#start').prop('disabled', true);
        infoGroup.removeChildren();
        if (points.length < 1) {
            return;
        }
        var numClusters = parseInt(document.getElementById('num-clusters').value, 10);
        var numIterations = parseInt(document.getElementById('num-iterations').value, 10);
        var results = kmeans(points, numClusters, numIterations);
        var centroids = results.centroids;
        var partitioning = results.partitioning;
        drawConvexHulls(normalizedPoints, centroids, partitioning);
        drawCentroids(normalize(centroids, minmax));
        $('#start').prop('disabled', false);
    }

    /** Create the canvas and prepare it for drawing. */
    function initializeCanvas() {
        var canvas = document.getElementById('visualization');
        document.getElementById('start').onclick = cluster;
        paper.setup(canvas);
		paper.view.draw();
        paper.view.zoom = paper.view.getBounds().width * SCALING_FACTOR;
        paper.view.setCenter(0, 0);
        paper.view.onResize = function(evt) {
            paper.view.setZoom(evt.size.width * SCALING_FACTOR);
            paper.view.setCenter(0, 0);
        }
        pointGroup = new paper.Group();
        infoGroup = new paper.Group();
        return canvas;
    };

    /** Initialize file field */
    function initializeFileField() {
        $('input[type="file"]').on('change', function() {
            var fileLabel = $(this).next('.custom-file-name');
            if ($(this)[0].files[0]) {
                fileLabel.attr('data-content', $(this)[0].files[0].name);
                // Process file
                loadData($(this)[0].files[0]);
            } else {
                fileLabel.attr('data-content', 'Choose file...');
            }
        });

        $('[data-toggle="tooltip"]').tooltip();
    }

    initializeCanvas();
    initializeFileField();
})();
