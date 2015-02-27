/// @param context the context of the canvas
/// @param x, y position in window/browser/viewport coordinates
function windowToCanvasCoord(canvas, x, y)
{
    var bbox = canvas.getBoundingClientRect();
    return { x: x - bbox.left * (canvas.width / bbox.width),
             y: y - bbox.top * (canvas.height / bbox.height)
    };
}

/// @param context the context of the canvas
/// @param x, y position where the color (r,g,b,a) would be placed
/// @param r, g, b color in RGB color space in range [0,255]
/// @param a must be in range 0 - 1, where 1 is fully opaque
function setPixel(context, x,y, r, g, b, a)
{
    /// on main function:
    //var pixel = context.createImageData(1,1);
    //var colorPixel = pixel.data;
    //colorPixel[0] = r;
    //colorPixel[1] = g;
    //colorPixel[2] = b;
    //colorPixel[3] = a;
    //context.putImageData(pixel, x, y);
    context.fillStyle = "rgba("+r+","+g+","+b+","+a+")";
    context.fillRect( x, y, 1, 1 );
}

/// Utility function to parse from float to int
function float2int (value)
{
    return value | 0;
}

function magnitude(vec0)
{
    var x = vec0[0], y = vec0[1], z = vec0[2];
    return Math.sqrt(x * x + y * y + z * z);
}
    
function normalize(vec0)
{
    resultVec = [0,0,0];
    var ilen = 1 / magnitude(vec0);
    resultVec[0] = vec0[0] * ilen;
    resultVec[1] = vec0[1] * ilen;
    resultVec[2] = vec0[2] * ilen;
    return resultVec;
}

function dotProduct(a,b)
{
    var n = 0;
    n = a[0] * b[0];
    n += a[1] * b[1];
    n += a[2] * b[2];
    return n;
 }

function clamp(x)
{
    if (x < 0)
        return 0;
    if (x > 255)
        return 255;
    return x;
}
function main()
{
    var canvas = document.getElementById("canvas2D");
    var selection =  document.getElementById("method");
    var dragging = false;
    var pStart, pEnd;
    
    if (!canvas)
    {
        console.log("Failed to retrieve the <canvas> element");
        return;
    }
    var context = canvas.getContext("2d");
    
    var lightAmbient = [0.2, 0.2, 0.2];
    var lightDiffuse = [0.8, 0.5, 0.9];
    var lightSpecular = [1.0, 0.9, 1.0];
    var lightPosition = [];

    canvas.addEventListener("mousedown", function (e)
    {
        dragging = !dragging;
        pStart = windowToCanvasCoord(canvas, e.clientX, e.clientY);
        pEnd = pStart;
    });

    canvas.addEventListener("mouseup", function (e)
    {
        dragging = false;
    });
    
    canvas.addEventListener("mousemove", function (e)
    {
        if (dragging)
        {
            context.clearRect(0, 0, canvas.width, canvas.height);
            viewPosition = [0, 0, 0];
            var dx = pEnd.x - pStart.x;
            var dy = pEnd.y - pStart.y;
            lightPosition = [dx*0.01, dy*0.01, 2.5];

        Ka = [0.9, 0.1, 0.1];
        Kd =[0.9, 0.9, 0.9];
        Ks = [0.9,0.9, 0.9];

        shininess = 160;

        var flag = true;

        radius = 150;
        radiusPower = radius*radius;
        offsetX = canvas.width / 2;
        offsetY = canvas.height / 2;
        ambientColor = [0,0,0];
        diffuseColor = [0,0,0];
        specularColor = [0,0,0];
        V = [];
        L = [];
        R = [];
        ambientColor[0] = lightAmbient[0] * Ka[0];
        ambientColor[1] = lightAmbient[1] * Ka[1];
        ambientColor[2] = lightAmbient[2] * Ka[2];
        diffuseColor[0] = lightDiffuse[0] * Kd[0];
        diffuseColor[1] = lightDiffuse[1] * Kd[1];
        diffuseColor[2] = lightDiffuse[2] * Kd[2];
        specularColor[0] = lightSpecular[0] * Ks[0];
        specularColor[1] = lightSpecular[1] * Ks[1];
        specularColor[2] = lightSpecular[2] * Ks[2];

        for (y = -radius; y <= radius; y++)
        {
            yPower = y*y;
            for (x = -radius; x <= radius; x++)
            {
                xPower = x*x;
                if (xPower + yPower < radiusPower)
                {
                    z = Math.sqrt(radiusPower - xPower - yPower);
                    point = [x, y, z];
                    normal = [x, y, z];
                    pointN = normalize(point);
                    normal = normalize(normal);
                    V[0] = viewPosition[0] - point[0];
                    V[1] = viewPosition[1] - point[1];
                    V[2] = viewPosition[2] - point[2];
                    V = normalize(V);
                    L[0] = lightPosition[0] - pointN[0];
                    L[1] = lightPosition[1] - pointN[1];
                    L[2] = lightPosition[2] - pointN[2];
                    LN = normalize(L);
                    //R = normalL * 2.f * dotProduct(normal, L) - L;   //vector reflejado
                    var dotValue = 2 * dotProduct(normal, LN);
                    R[0] = normal[0] * dotValue - LN[0];
                    R[1] = normal[1] * dotValue - LN[1];
                    R[2] = normal[2] * dotValue - LN[2];

                    diffuseFactor = dotProduct(L, normal);
                    specularFactor = Math.pow(dotProduct(R, V), shininess);

                    redChannel = ambientColor[0] + (diffuseColor[0] * diffuseFactor) + (specularColor[0] * specularFactor);
                    greenChannel = ambientColor[1] + (diffuseColor[1] * diffuseFactor) + (specularColor[1] * specularFactor);
                    blueChannel = ambientColor[2] + (diffuseColor[2] * diffuseFactor) + (specularColor[2] * specularFactor);
                    color = [redChannel * 255.0, greenChannel * 255.0, blueChannel * 255.0];
                    setPixel(context, x + offsetX, y + offsetY, clamp(float2int(color[0])), clamp(float2int(color[1])), clamp(float2int(color[2])), 1);
                }
            }
        }

            pEnd = windowToCanvasCoord(canvas, e.clientX, e.clientY);
            
        }
    });
}
