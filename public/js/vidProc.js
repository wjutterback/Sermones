// function videoProcEl(videoElementId, stream)
// {
    var video = document.querySelector("#videoElement");

    let canvasLessTwo= document.querySelector('#canvasLessTwo');
    let canvasLessOne= document.querySelector('#canvasLessOne');
    let canvas = document.querySelector('#canvas');
    let canvasDiff= document.querySelector('#canvasDiff');

    var imgDataLessTwo;
    var imgDataLessOne;
    var imgData;
    let pixelShow=0;
    let rgb_diff=[];

    var dontStop=true;
    var numFrames=0;
    const numFramesMax=20000;
    const RGBThresh=15;
    const milliDelay=100;

    if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
        video.srcObject = stream;
        
        })
        .catch(function (err0r) {
        console.log("Something went wrong!");
        });

    
    }

    $("#videoElement").on("loadeddata", function() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvasLessOne.width = video.videoWidth;
        canvasLessOne.height = video.videoHeight;
        canvasLessTwo.width = video.videoWidth;
        canvasLessTwo.height = video.videoHeight;
        canvasDiff.width = video.videoWidth;
        canvasDiff.height = video.videoHeight;

        printSleepLessTwo(canvasLessTwo);
        printSleepLessOne(canvasLessOne);
        var arguments=[];
        arguments.push(canvas);
        arguments.push(imgDataLessTwo);
        arguments.push(imgDataLessOne);
        setTimeout(() => {  console.log("World!"); printSleepII(arguments);}, milliDelay);
    });

    function printSleepLessTwo(canvasLessTwo)
        {
            // console.log(numFrames);
            // console.log('Success 2')
            numFrames=numFrames+1;
            // console.log('Success');

            canvasLessTwo.getContext('2d').drawImage(video, 0, 0, canvasLessTwo.width, canvasLessTwo.height);
            imgDataLessTwo = canvasLessTwo.getContext('2d').getImageData(0, 0, canvasLessTwo.width, canvasLessTwo.height);

        }
        function printSleepLessOne(canvasLessOne)
        {
            // console.log(numFrames);
            // console.log('Success 2')
            numFrames=numFrames+1;
            // console.log('Success');

            canvasLessOne.getContext('2d').drawImage(video, 0, 0, canvasLessOne.width, canvasLessOne.height);
            imgDataLessOne = canvasLessOne.getContext('2d').getImageData(0, 0, canvasLessOne.width, canvasLessOne.height);

        }

        function printSleepII(arguments)
        {
            // canvas=arguments[0];
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            imgData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
            var argumentsII=[canvas];
            try{
                // debugger;
                var imgDataLessTwo=arguments[1];
                var imgDataLessOne=arguments[2];
                rgb_diff=[];
                

                for(var i = 0;i<=imgDataLessOne.data.length/4-1;i++)
                {
                    // console.log(imgData.data[4*i]);
                    // console.log(i);
                    pixelShow=Number(!((Math.abs(imgData.data[4*i] - imgDataLessOne.data[4*i])<RGBThresh) && (Math.abs(imgData.data[4*i+1] - imgDataLessOne.data[4*i+1])<RGBThresh) && (Math.abs(imgData.data[4*i+2] - imgDataLessOne.data[4*i+2])<RGBThresh)));
                    // debugger;
                    // if (pixelShow ===0)
                    // {
                    //     pixelShow0=pixelShow0+1;
                    // }
                    // else
                    // {
                    //     pixelShow1=pixelShow1+1;
                    // }
                    // debugger;
                    rgb_diff.push(imgData.data[4*i]*pixelShow);
                    // console.log(rgb_diff);
                    // debugger;
                    rgb_diff.push(imgData.data[4*i+1]*pixelShow);
                    rgb_diff.push(imgData.data[4*i+2]*pixelShow);
                    rgb_diff.push(imgData.data[4*i+3]);
                    // rgb_diff.push(4*i+3 % 255);
                    lastVar=i;
                    // if (i===imgDataLessOne.data.length/4-1)
                    // {
                    //     debugger;
                    // }
                }
                var idata = new ImageData(new Uint8ClampedArray(rgb_diff),canvas.width,canvas.height);
                canvasDiff.getContext('2d').putImageData(idata,0,0);

                argumentsII.push(imgDataLessOne);
                argumentsII.push(idata);

            }
            catch{
                console.log('Canvas problem');
            }

            // console.log(numFrames);
            // console.log('Success 2')
            numFrames=numFrames+1;
            // console.log('Success');

            
            // setTimeout(() => {  console.log("World!"); printSleepII(argumentsII)}, 100);
            setTimeout(() => { printSleepII(argumentsII)}, milliDelay);


        }



// }