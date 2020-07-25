<style>
  body {background-color: black; color: #aaa;}
</style>

# Gravity \| Density

Jesse Allison & Anthony Marasco

For cyber-hacked devices and mobile devices, and intrepid explorers

----


<script src= "https://player.twitch.tv/js/embed/v1.js"></script>

<div id="streamDiv"></div>

### NIME Performance Live Stream

This performance is intended to be viewed through the live stream above _and_ participated in on one or more mobile devices. An ideal setup would be a computer with the live stream full screen and decent speakers + a few mobile phones or tablets to participate in the interactive parts.
__Please Join with your mobile devices at:__ [emdm.io](https://emdm.io)

<div id="text">...</div>

<script type="text/javascript">
  let options = {
    width: 720,
    height: 480,
    channel: "allisonification",
    // video: "",
    // collection: "",
    // only needed if your site is also embedded on embed.example.com and othersite.example.com 
    parent: ["emdm.io", "gravity.emdm.io"]
  };
  let player = new Twitch.Player("streamDiv", options);
  player.addEventListener(Twitch.Player.READY, ()=>{
    player.setVolume(0.8);
    let vol = player.getVolume();
    console.log("volume = ", vol);
    let textDiv = document.getElementById('text');
    // textDiv.innerHTML = `Player Volume is ${vol}`
    textDiv.innerHTML = `The performance begins at 23:15 UTC+1 (5:15 CDT, 3:15 PDT)`
  });

</script>


----

_Gravity \| Density_ is a work for cyber-hacked devices and Web Audio applications with thematic material drawn from humankind's fascination with the universe.

In _Gravity \| Density_, we begin by manipulating fixed-audio sources through the performance of hacked CD players. The sonic results of this mangled audio is sampled and then distributed to the audience’s mobile devices in both passive and interactive manners. Passive distributions allow us to create intricately-spatialized rhythmic interplay between the glitching CD players and the blanket of overlapping samples dispersed throughout the networked audience.  Active distributions allow the audience to join in our performance; by sampling small portions of the audio, processing and looping these sounds and sending them back to the performers, we string this audio together and feed it into a cyber-controlled distortion pedal before sending it back to the audience for more manipulation. This results in overlapping cycles of control and audio generation between performer, audience, network, and machine.

[Click here for more information about the work.](https://gravity.emdm.io/about)
