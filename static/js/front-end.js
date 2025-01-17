var clientId = guid();

var cameraNewISO = 100;
var cameraNewWhitebalance = 'fluorescent';
var cameraNewShutterSpeed = 50000;
var cameraNewRotation = 180;


var app = new Vue({
    el: '#app',
    data: {
        socket: null,
        message: 'Hello Vue!',
        cameras: [],
        photos: [
            {
                imagePath: '/img/placeholder.png',
                cameraName: 'test'
            },
            {
                imagePath: '/img/placeholder.png',
                cameraName: 'test'
            },
            {
                imagePath: '/img/placeholder.png',
                cameraName: 'test'
            },
            {
                imagePath: '/img/placeholder.png',
                cameraName: 'test'
            }
        ]
    },
    computed: {
        orderedCameras: function () {
            return this.cameras.sort(function(a, b){
                if (isNaN(a) || isNaN(b)) {
                    return -1;
                }
                return a - b;
            });
        }
    },
    created: function () {
        this.socket = io('http://' + location.hostname + ':3000');

        this.socket.emit('client-online', {});

        var that = this;
        this.socket.on('camera-update', function(response) {
            //console.log("camera update", response);
            that.cameras = [];
            for (let i = 0; i < response.length; i++) {
                if (response[i].type == 'camera') {
                    var photoError = '';
                    if (response[i].photoError) {
                        photoError = 'yes';
                    }
                    response[i].photoError = photoError;
                    lastUpdateProblem = false;
                    var timeSinceLastUpdate = Math.round((new Date() - new Date(response[i].lastCheckin)) / 100) / 10;
                    if ((timeSinceLastUpdate > 10) && !response[i].photoSending) {
                        lastUpdateProblem = true;
                    }
                    response[i].lastUpdateProblem = lastUpdateProblem;
                    response[i].timeSinceLastUpdate = timeSinceLastUpdate;

                    that.cameras.push(response[i]);
                }
            }

        });

        this.socket.on('new-photo', function(data){
            that.photos.push(data);
        });

        this.socket.on('photo-error', function(data){
            console.log(data);
        });
        
        this.socket.on('take-photo', function(data){
            that.photos = [];
        });
    },
    methods: {
        takePhoto: function () {
            takeId = guid();
			var shutter = 1000000/cameraNewShutterSpeed;
            this.socket.emit('take-photo', {takeId: takeId, time: Date.now(), newISO: cameraNewISO, newSS: shutter, newRot: cameraNewRotation});
        },
        updateSoftware: function () {
            this.socket.emit('update-software', {});
        },
        shutdownNode: function () {
            this.socket.emit('shutdown-node', {});
        },
        updateName: function (socketId, event) {
            console.log("Update name", socketId, event.target.value);
            this.socket.emit('update-name', {socketId: socketId, newName: event.target.value});
            event.target.value = null;
        },
		updateISO: function (event) {
            console.log("Update ISO", event.target.value);
            // this.socket.emit('update-iso', {newISO: event.target.value});
			cameraNewISO = event.target.value;
            //event.target.value = null;
        },
		updateSS: function (event) {
            console.log("Update Shutter Speed", event.target.value);
            // this.socket.emit('update-iso', {newISO: event.target.value});
			cameraNewShutterSpeed = event.target.value;
            //event.target.value = null;
        }
    }
})

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
