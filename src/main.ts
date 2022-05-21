import { Engine } from 'babylonjs';
import { createScene } from './scene';

// const app = document.querySelector<HTMLDivElement>('#app')!

// app.innerHTML = `
//   <h1>Hello Vite!</h1>
//   <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
// `

const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new Engine(canvas as HTMLCanvasElement, true); // Generate the BABYLON 3D engine

// Register a render loop to repeatedly render the scene
createScene(engine).then(sceneToRender => {
    engine.runRenderLoop(() => sceneToRender.render());
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
        engine.resize();
});
