import { Engine } from 'babylonjs';
import { createScene } from './piano/scene';

const canvas = document.getElementById("renderCanvas"); // キャンバス要素を取得
const engine = new Engine(canvas as HTMLCanvasElement, true); // BABYLON 3D エンジンを生成

if (canvas) {
    // レンダリングループを登録して、シーンを繰り返しレンダリング
    createScene(canvas, engine).then(sceneToRender => {
        engine.runRenderLoop(() => sceneToRender.render());
    });
}

// ブラウザとキャンバスのリサイズイベントを監視
window.addEventListener("resize", function () {
        engine.resize();
});
