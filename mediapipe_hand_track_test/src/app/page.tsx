"use client";
import { useEffect, useState, useRef } from "react";
import { HAND_CONNECTIONS, Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { NextPage } from "next";
import * as BABYLON from "@babylonjs/core";

type Position = {
  x: number;
  y: number;
  z: number;
};

export default function Home() {
  const [position, setPosition] = useState<Position[]>();

  const videoRef = useRef(null);
  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
      })
      .then((stream) => {
        let video = videoRef.current;
        video.srcObject = stream;
        // Show loading animation.
        var playPromise = video.play();

        if (playPromise !== undefined) {
          playPromise;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    getVideo();
    handtrack();
  }, [videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = document.getElementsByClassName("output_canvas")[0];

    function resizeCanvas() {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    video.addEventListener("loadedmetadata", resizeCanvas);
    video.addEventListener("resize", resizeCanvas);

    return () => {
      video.removeEventListener("loadedmetadata", resizeCanvas);
      video.removeEventListener("resize", resizeCanvas);
    };
  }, [videoRef]);

  async function handtrack() {
    const videoElement: any = document.getElementsByClassName("input")[0];
    const canvasElement = document.getElementsByClassName("output_canvas")[0];
    const canvasCtx = canvasElement.getContext("2d");

    function onResults(results: any) {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, 640, 480);
      canvasCtx.drawImage(results.image, 0, 0, 640, 480);
      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 5,
          });
          drawLandmarks(canvasCtx, landmarks, {
            color: "#FF0000",
            lineWidth: 2,
          });
          setPosition(landmarks);
        }
      }
      canvasCtx.restore();
    }

    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    hands.onResults(onResults);

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await hands.send({ image: videoElement });
      },
      width: 640,
      height: 480,
    });
    camera.start();
  }
  return (
    <div>
      <p>Video</p>
      <div
        style={{
          width: "640px",
          height: "480px",
          display: "flex",
        }}
      >
        <video
          ref={videoRef}
          className="input"
          style={{ position: "absolute" }}
          autoPlay
          playsInline
        ></video>
        <canvas
          className="output_canvas"
          style={{ zIndex: 1, position: "absolute" }}
        ></canvas>
      </div>

      <div>position</div>
      <div>
        {position[8].x}
        <br />
        {position[8].y}
        <br />
        {position[8].z}
      </div>
    </div>
  );
}
