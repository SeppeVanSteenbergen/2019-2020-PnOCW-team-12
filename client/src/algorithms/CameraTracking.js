import Brief from './Brief'
import './FASTDetector'

export default class CameraTracking {
    constructor(callback) {
        this.framerate = 30;
        this.video = document.createElement('CANVAS');
        this.canvas = document.createElement('CANVAS');
        this.ctx = canvas.getContext('2d');
        this.previousDescriptor = null;
        this.confidence = 0.75;

        //Setup sensors
        this.startMatrix = null

        //Vragen voor permissie sensors, en starten van deze te lezen
        Promise.all([
            navigator.permissions.query({ name: 'accelerometer' }),
            navigator.permissions.query({ name: 'gyroscope' })
        ]).then( results => {
            if (results.every(result => result.state === 'granted')) {
                const options = { frequency: 10, coordinateSystem: 'device' }
                this.sensor = new RelativeOrientationSensor(options)

                this.sensor.addEventListener('error', error => {
                    if (event.error.name === 'NotReadableError') {
                        console.log('Sensor is not available.')
                    }
                })

                this.sensor.start()
            } else {
                console.log('No permissions to use RelativeOrientationSensor.')
            }
        })
        //setup camera en beginnen lezen (door toe te wijzen aan video element)
        navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment'
                },
                audio:false
            }
        ).then(function(stream) {
            this.video.srcObject = stream;
            this.video.onloadedmetadata = function(e) {
                this.video.play();
                this.canvas.width = this.video.videoWidth
                this.canvas.height = this.video.videoHeight
                this.calculateTransformation(callback);
            };
        }).catch(function(err) {
            // deal with an error (such as no webcam)
        });
    }

    setStartMatrix() {
        this.startMatrix = null;
    }

    startSensor() {
        this.sensor.start()
    }
    stopSensor() {
        this.sensor.stop()
    }

    calculateTransformation(callback){
        let fictiveDistance = 1000;

        //transformatie (rotatie) door de sensors
        let rotationMatrix = new DOMMatrix()
        this.sensor.populateMatrix(rotationMatrix)
        if (this.startMatrix === null) {
            this.startMatrix = DOMMatrix.fromMatrix(rotationMatrix.inverse())
        }

        rotationMatrix.multiplySelf(this.startMatrix)

        //translatie door camera
        this.ctx.drawImage(video, 0, 0);
        let imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
        let corners = FASTDetector(imageData.data, canvas.width, hold)
        let transformedcorners = [];
        for(let i = 0; i < corners.length; i += 2){
            let point = new DOMPoint(corners[i], corners[i+1], fictiveDistance);
            point.matrixTransform(rotationMatrix);
            //TODO kan probleem zijn dat rotationmatrix ingesteld staat op roteren rond middenpunt
            //  punten staan t.o.v. linkerbovenhoek
            transformedcorners.push(point.x)
            transformedcorners.push(point.y)
        }


        let descriptor = Brief.getDescriptors(grayScaleImgData(imageData,false), canvas.width, transformedcorners)
        let trans = {
            x: 0,
            y: 0
        }
        if(this.previousDescriptor !== null) {
            matches = Brief.reciprocalMatch(this.previousCorners, this.previousDescriptor, transformedcorners, descriptor)
            let selectedCount = 0
            for (let i = 0; i < matches.length; i++) {
                if (matches[i].confidence > this.confidence) {
                    selectedCount++
                    trans.x += matches[i].keypoint2[0] - matches[i].keypoint1[0]
                    trans.y += matches[i].keypoint2[1] - matches[i].keypoint1[1]
                }
            }
            if (selectedCount > 0) {
                trans.x = trans.x / selectedCount
                trans.y = trans.y / selectedCount
            }
        }


        if(this.previousDescriptor === null) {
            this.previousDescriptor = descriptor
            this.previousCorners = transformedcorners
        }

        rotationMatrix.translateSelf(trans.x, trans.y);
        callback(rotationMatrix.toString());

        //en opnieuw
        this.calculateTransformation(callback);
    }
}
