
var __wrapValue = function(min, max, value) {
    var delta = max - min;
    var wrappedValue = value;

    while(wrappedValue < min) {
        wrappedValue += delta;
    }

    while(wrappedValue > max) {
        wrappedValue -= delta;
    }

    return wrappedValue;
}


var fromDataToWindowWrapping = function(wrapping, x, y) {
    var wrappedX = x;
    var wrappedY = y;

    if(wrapping) {
        if("x" in wrapping) {
            wrappedX = __wrapValue(wrapping["x"]["windowMin"], wrapping["x"]["windowMax"], x);
        }

        if("y" in wrapping) {
            wrappedY = __wrapValue(wrapping["y"]["windowMin"], wrapping["y"]["windowMax"], y);
        }
    }

    return { "x": wrappedX, "y": wrappedY };
}


var fromWindowToDataWrapping = function(wrapping, x, y) {
    var wrappedX = x;
    var wrappedY = y;

    if(wrapping) {
        if("x" in wrapping) {
            wrappedX = __wrapValue(wrapping["x"]["dataMin"], wrapping["x"]["dataMax"], x);
        }

        if("y" in wrapping) {
            wrappedY = __wrapValue(wrapping["y"]["dataMin"], wrapping["y"]["dataMax"], y);
        }
    }

    return { "x": wrappedX, "y": wrappedY };
}