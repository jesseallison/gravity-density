class GravSound {
  constructor(ctx) {

    // Bind functions with this.
    this.freq = this.freq.bind(this);
    this.playPitch = this.playPitch.bind(this);
    this.playRandomPitch = this.playRandomPitch.bind(this);
    this.triggerPitch = this.triggerPitch.bind(this);
    this.playFirstSound = this.playFirstSound.bind(this);
    this.triggerFirstSound = this.triggerFirstSound.bind(this);
    this.playSecondSound = this.playSecondSound.bind(this);
    this.sendSample = this.sendSample.bind(this);
    this.createSample = this.createSample.bind(this);
    this.wavebufferRegionPlay = this.wavebufferRegionPlay.bind(this);
    this.wavebufferRegionLoad = this.wavebufferRegionLoad.bind(this);

    if(ctx) {
      // use context in setting up tone...
    }
    this.tone = new Tone();

    this.wavesurfers = [];
    this.audio = [];
    this.userSamples = {};

    this.playerSampleCount = 0;
    this.sampleLength = 5;    // in seconds

    // Audio Input
    var liveFeed = new Tone.UserMedia();
    Tone.UserMedia.enumerateDevices().then(function (devices) {
      console.log(devices)
    })
    liveFeed.open().then(function () {
      //promise resolves when input is available
    });

    this.audio[0] = document.querySelector('audio');
    this.dest = this.tone.context.createMediaStreamDestination();
    this.recorder = new MediaRecorder(this.dest.stream);

    liveFeed.connect(this.dest);

    this.chunks = [];

    this.recorder.ondataavailable = evt => {
      // chunks.push(evt.data);
      for (let i = 0; i < this.playerSampleCount; i++) {
        if (this.chunks[i].recording === true) {
          this.chunks[i].chunks.push(evt.data);
        }
      }
    };

    this.recorder.onstop = evt => {
      let soundBlob = new Blob(this.chunks[this.recorder.userNumber].chunks, {
        type: 'audio/wav; codecs=0'
      });
      // let soundBlob = new Blob(this.chunks[this.recorder.userNumber].chunks, {
      //   type: 'audio/ogg; codecs=opus'
      // });
      this.chunks[this.recorder.userNumber].recording = false;
      for (let i = 0; i < this.playerSampleCount; i++) {
        if (this.chunks[i].recording === true && this.recorder.state === "inactive") {
          this.recorder.start();
        }
      }
      console.log('recording stopped');
      this.audio[this.recorder.userNumber].src = URL.createObjectURL(soundBlob);

      let currentSample = this.recorder.userNumber;
      console.log("currentSample Oustide: ", currentSample);
      console.log("wavesurfer: ", this.wavesurfers[currentSample]);

      this.wavesurfers[currentSample].on('ready', this.wavebufferRegionLoad(currentSample));
      this.wavesurfers[currentSample].loadBlob(soundBlob);
      console.log('recording Loaded');

      this.sendSample(this.recorder.user, currentSample, soundBlob)
    };
    // this.recorder.onstop.bind(this);

    // Effects and Synths

    this.tremolo = new Tone.Tremolo({
      "frequency": 8,
      "type": "sine",
      "depth": 0.6,
      "spread": 0
      //"wet": 0.8
    }).toMaster().start();

    this.synth = new Tone.Synth({
      "oscillator": {
        "type": "sine"
      },
      "envelope": {
        "attack": 2.0,
        "decay": 0.5,
        "sustain": 0.8,
        "release": 2.0
      }
    }).connect(this.tremolo);

    this.synth.volume.value = -10;

    // Players

    this.player = [];
    this.player[0] = new Tone.Player("/data/mp3s/CD_Track_2.mp3").toMaster();
    this.player[1] = new Tone.Player("/data/mp3s/Collide.mp3").toMaster();

    Tone.Transport.start();

    this.pitchCollection = [55, 57, 59, 61, 62, 64, 66, 67, 68, 69, 71, 73, 75, 76, 78, 80, 82, 83];

    this.pitch = this.pitchCollection[Math.floor(Math.random() * (this.pitchCollection.length))];
    console.log("Pitch & Length:", this.pitch, this.pitchCollection.length);


  };

  // Various and sundry methods



  createSample(user, sampleLength) {
    this.userSamples[user] = {}
    this.userSamples[user].id = this.playerSampleCount;

    // var url = URL.createObjectURL(blob);
    let sampleDiv = document.getElementById("samples");
    let newDiv = document.createElement("div");
    newDiv.setAttribute("id", "sample-" + this.playerSampleCount);
    let au = document.createElement('audio');
    let ws = document.createElement('div');
    ws.setAttribute("id", "waveform-" + this.playerSampleCount);
    au.setAttribute("id", 'audio-' + this.playerSampleCount);
    au.controls = 'controls';
    newDiv.appendChild(ws);
    newDiv.appendChild(au);
    sampleDiv.appendChild(newDiv);

    this.chunks[this.playerSampleCount] = {
      recording: true,
      chunks: []
    };
    this.audio[this.playerSampleCount] = document.getElementById("audio-" + this.playerSampleCount);
    this.wavesurfers[this.playerSampleCount] = WaveSurfer.create({
      container: '#waveform-' + this.playerSampleCount,
      waveColor: 'violet',
      progressColor: 'purple',
      plugins: [
        WaveSurfer.regions.create({})
      ]
    });

    if (this.recorder.state === "inactive") {
      this.recorder.start();
    }
    // Passing the current playerSampleCount in as this.recorder.userNumber so that it remains the correct number is multiple records happen.
    let recordingTimer = setTimeout(
      (user, userNumber) => { // setup a timeout for the recording, after the time below expires, do the tings inside the {}
        this.recorder.user = user;
        this.recorder.userNumber = userNumber;
        console.log("Stopping Recording for: ", user, userNumber);
        this.recorder.stop(); // stop recording
      }, sampleLength * 1000, user, this.playerSampleCount) //record for sample length (in ms)

    this.playerSampleCount += 1;
  };


  sendSample(user, userNumber, soundBlob) {
    let formdata = new FormData(); //create a from to of data to upload to the server
    let soundFileName = this.recorder.user + 'Sample.wav';
    formdata.append('user', user);
    formdata.append('id', userNumber);
    formdata.append('soundBlob', soundBlob, soundFileName ); // append the sound blob and the name of the file. third argument will show up on the server as req.file.originalname

    // Now we can send the blob to a server...
    let serverUrl = '/upload'; //we've made a POST endpoint on the server at /upload
    let httpRequestOptions = { //build a HTTP POST request
      method: 'POST',
      body: formdata, // with our form data packaged above
      headers: new Headers({
        'enctype': 'multipart/form-data' // the enctype is important to work with multer on the server
      })
    };
    fetch(serverUrl, httpRequestOptions).then(res => {
      console.log(res)
      // hub.transmit('sample', null, null, {'user': user, 'val': 'load', 'url': soundFileName, 'id':userNumber});
    }).then(error => {
      if(error) {
        console.log(error)
      }
    });

    console.log('recording sent');
  };


  wavebufferRegionLoad(currentSample) {
    console.log("currentSample Inside: ", currentSample);
    this.wavesurfers[currentSample].addRegion({
      id: 0,
      start: 1,
      end: 3,
      drag: true,
      loop: true,
      color: 'hsla(100, 100%, 30%, 0.5)'
    });
    this.wavesurfers[currentSample].regions.list[0].on('update', this.wavebufferRegionPlay(currentSample));
  };
  
  wavebufferRegionPlay(currentSample) {
    this.wavesurfers[currentSample].regions.list[0].play();
    this.wavesurfers[currentSample].regions.list[0].un('update');
  };

  freq(midi) {
    var note = Tone.Frequency(midi).toFrequency();
    // console.log("Midi:", midi, note)
    return note;
  };

  // **** Playing Notes **** //
  playPitch(pitch) {
    if (pitch) {
      this.synth.triggerAttackRelease(this.freq(pitch), 0.5);
    } else {
      this.synth.triggerAttackRelease(this.freq(this.pitch), 5);

    }
  };
  
  playRandomPitch() {
    var pitch = this.pitchCollection[Math.floor(Math.random() * (this.pitchCollection.length))];
    this.synth.triggerAttackRelease(this.freq(pitch), 0.5);
  };

  triggerPitch() {
    this.synth.triggerAttackRelease(this.freq(this.pitch), 5);
    hub.send('triggerPitch', {
      'pitch': this.pitch
    });
  };

  playFirstSound() {
    this.player[0].start();
  };

  triggerFirstSound() {
    this.playPitch();
    this.player[0].start();
    // this.seqRandomize();
    hub.send('triggerFirstSound', {
      'pitch': this.pitch
    });

    var elements = document.getElementsByClassName("mainTitle");
    // elements[0].className +=" clicked";
    elements[0].style.backgroundColor = hub.user.color;
  };

  // ****  Events ****

  playSecondSound() {
    this.player[1].start();
    // var pitch = this.pitchCollection[Math.floor(Math.random() * (this.pitchCollection.length))];
    // this.synth.triggerAttackRelease(this.freq(pitch), 5);
    this.playRandomPitch();
  };

}