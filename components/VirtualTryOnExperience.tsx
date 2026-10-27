"use client";

import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { ScanFace, X } from "lucide-react";
import type { Product } from "@/data/products";

type Point = { x: number; y: number; z?: number };
type Anchor = { x: number; y: number; width: number; angle: number };

function distance(a: Point, b: Point) { return Math.hypot(a.x - b.x, a.y - b.y); }

function findAnchor(product: Product, face: Point[] | undefined, hand: Point[] | undefined, width: number, height: number): Anchor | null {
  if ((product.category === "Rings" || product.category === "Bracelets") && hand && hand.length > 17) {
    const palmWidth = distance(hand[5], hand[17]) * width;
    if (product.category === "Rings") {
      const center = { x: (hand[13].x + hand[14].x) / 2, y: (hand[13].y + hand[14].y) / 2 };
      return { x: center.x * width, y: center.y * height, width: palmWidth * .16, angle: Math.atan2(hand[14].y - hand[13].y, hand[14].x - hand[13].x) };
    }
    return { x: hand[0].x * width, y: hand[0].y * height, width: palmWidth * .78, angle: Math.atan2(hand[9].y - hand[0].y, hand[9].x - hand[0].x) };
  }
  if (face && face.length > 454) {
    const left = face[234], right = face[454], chin = face[152];
    const faceWidth = distance(left, right) * width;
    const centerX = (left.x + right.x) / 2 * width;
    if (product.category === "Necklaces") {
      return { x: centerX, y: chin.y * height + faceWidth * .27, width: faceWidth * .9, angle: Math.atan2(right.y - left.y, right.x - left.x) };
    }
    return { x: centerX, y: (left.y + right.y) / 2 * height + faceWidth * .13, width: faceWidth * .82, angle: Math.atan2(right.y - left.y, right.x - left.x) };
  }
  return null;
}

export default function VirtualTryOnExperience({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("Starting your camera…");
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!open) return;
    let stopped = false;
    let animationFrame = 0;
    let stream: MediaStream | undefined;
    let faceTracker: FaceLandmarker | undefined;
    let handTracker: HandLandmarker | undefined;
    let renderer: THREE.WebGLRenderer | undefined;
    let model: THREE.Group | undefined;
    let modelWidth = 1;

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera access requires a secure connection (HTTPS or localhost).");
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: "user", width: { ideal: 960 }, height: { ideal: 720 } } });
        if (stopped) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        video.srcObject = stream;
        await video.play();
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;
        canvas.width = width;
        canvas.height = height;
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(1);
        renderer.setSize(width, height, false);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x000000, 0);
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(0, width, 0, height, .1, 1000);
        camera.position.z = 500;
        scene.add(new THREE.AmbientLight(0xffffff, 2.1));
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.3);
        keyLight.position.set(-1, 1, 4);
        scene.add(keyLight);

        setStatus("Loading on-device tracking…");
        const wasm = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm");
        const faceModel = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
        const handModel = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
        [faceTracker, handTracker] = await Promise.all([
          FaceLandmarker.createFromOptions(wasm, { baseOptions: { modelAssetPath: faceModel }, runningMode: "VIDEO", numFaces: 1 }),
          HandLandmarker.createFromOptions(wasm, { baseOptions: { modelAssetPath: handModel }, runningMode: "VIDEO", numHands: 1 }),
        ]);
        if (stopped) {
          faceTracker.close();
          handTracker.close();
          return;
        }

        setStatus("Loading the product model…");
        new GLTFLoader().load(product.tryOnModelUrl!, gltf => {
          if (stopped) return;
          const modelRoot = new THREE.Group();
          const modelScene = gltf.scene;
          const bounds = new THREE.Box3().setFromObject(modelScene);
          const size = bounds.getSize(new THREE.Vector3());
          const center = bounds.getCenter(new THREE.Vector3());
          modelScene.position.sub(center);
          modelRoot.add(modelScene);
          model = modelRoot;
          modelWidth = Math.max(size.x, size.y, size.z, .001);
          scene.add(model!);
          setStatus("Look toward the camera and move naturally.");
        }, undefined, () => { if (!stopped) setError("This 3D model could not be loaded. Check that its URL is public and allows cross-origin access."); });

        let lastDetection = 0;
        const render = (time: number) => {
          if (stopped) return;
          if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && time - lastDetection > 50) {
            lastDetection = time;
            const faces = faceTracker!.detectForVideo(video, time).faceLandmarks[0];
            const hands = handTracker!.detectForVideo(video, time).landmarks[0];
            const anchor = findAnchor(product, faces, hands, width, height);
            if (model) model.visible = Boolean(anchor);
            if (anchor && model) {
              const scale = anchor.width / modelWidth;
              model.scale.setScalar(scale);
              model.position.set(anchor.x, anchor.y, 0);
              model.rotation.z = anchor.angle;
            }
            if (!anchor && !model) setStatus("Preparing try-on…");
          }
          renderer?.render(scene, camera);
          animationFrame = requestAnimationFrame(render);
        };
        animationFrame = requestAnimationFrame(render);
      } catch (reason) {
        if (!stopped) setError(reason instanceof Error ? reason.message : "Could not start the camera try-on.");
      }
    };

    void start();
    return () => {
      stopped = true;
      cancelAnimationFrame(animationFrame);
      stream?.getTracks().forEach(track => track.stop());
      faceTracker?.close();
      handTracker?.close();
      model?.traverse(object => { if (object instanceof THREE.Mesh) object.geometry.dispose(); });
      renderer?.dispose();
    };
  }, [open, product]);

  if (!product.tryOn || !product.tryOnModelUrl || product.category === "Photo Frames" || product.category === "Pooja Essentials") return null;
  return <>
    <button className="sa-vto-button" type="button" onClick={() => { setError(""); setStatus("Starting your camera…"); setOpen(true); }}><ScanFace size={16}/> TRY IT ON</button>
    {open && <div className="sa-vto-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}><section className="sa-vto-dialog" role="dialog" aria-modal="true" aria-label={`Virtual try-on for ${product.name}`}><header><div><span className="sa-eyebrow">ON-DEVICE CAMERA TRY-ON</span><h2>{product.name}</h2></div><button type="button" aria-label="Close virtual try-on" onClick={() => setOpen(false)}><X size={18}/></button></header><p className="sa-vto-privacy">Camera tracking runs on this device. Your camera feed is not uploaded.</p><div className="sa-vto-stage"><video ref={videoRef} autoPlay muted playsInline/><canvas ref={canvasRef}/>{!error && <span>{status}</span>}</div>{error && <p className="sa-vto-error" role="alert">{error}</p>}<p className="sa-vto-hint">Center your {product.category === "Rings" || product.category === "Bracelets" ? "hand" : "face and neck"} in the camera view.</p></section></div>}
  </>;
}
